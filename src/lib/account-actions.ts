"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { getSessionUser } from "./auth";
import { getProduct } from "./catalog";
import { orderDelivery, totals } from "./pricing";
import type { Address, Payment } from "./types";

export type AddressInput = Omit<Address, "id" | "is_default"> & { is_default?: boolean };
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const ADDRESS_COLS = "id, full_name, phone, line1, line2, city, state, zip, country, is_default";

function validateAddress(a: AddressInput): string | null {
  if (!a.full_name?.trim()) return "Please enter a name.";
  if (!a.line1?.trim()) return "Please enter an address.";
  if (!a.city?.trim()) return "Please enter a city name.";
  if (!a.zip?.trim()) return "Please enter a ZIP or postal code.";
  if (a.country === "United States" && !/^\d{5}(-\d{4})?$/.test(a.zip.trim())) return "Please enter a valid US ZIP code.";
  if (a.phone && !/^[+\d][\d\s()-]{6,}$/.test(a.phone.trim())) return "Please enter a valid phone number.";
  return null;
}

export async function addAddress(input: AddressInput): Promise<Result<Address>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const err = validateAddress(input);
  if (err) return { ok: false, error: err };
  const supabase = await createClient();
  const { count } = await supabase.from("addresses").select("id", { count: "exact", head: true });
  const makeDefault = !!input.is_default || !count;
  if (makeDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  const row = {
    full_name: input.full_name.trim(),
    phone: (input.phone ?? "").trim(),
    line1: input.line1.trim(),
    line2: (input.line2 ?? "").trim(),
    city: input.city.trim(),
    state: (input.state ?? "").trim(),
    zip: input.zip.trim(),
    country: input.country || "United States",
    is_default: makeDefault,
  };
  const { data, error } = await supabase.from("addresses").insert(row).select(ADDRESS_COLS).single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/addresses");
  return { ok: true, data };
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", id);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  revalidatePath("/account/addresses");
}

export async function listAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select(ADDRESS_COLS)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

/**
 * Places an order. Prices, totals and delivery date are computed here from the catalog,
 * never taken from the client. Card details other than brand/last4 are never sent.
 */
export async function placeOrder(input: {
  addressId: string;
  payment: Payment;
  items: { id: number; qty: number }[];
}): Promise<Result<{ id: string; number: string }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Your session expired. Please sign in again." };

  const lines = [];
  for (const i of input.items.slice(0, 100)) {
    const p = getProduct(Number(i.id));
    if (!p) continue;
    if (p.stock === 0) return { ok: false, error: `${p.title} is out of stock.` };
    const qty = Math.max(1, Math.min(Math.floor(Number(i.qty)) || 1, p.stock, 30));
    lines.push({ p, qty });
  }
  if (!lines.length) return { ok: false, error: "Your cart is empty." };

  const supabase = await createClient();
  const { data: addr } = await supabase.from("addresses").select(ADDRESS_COLS).eq("id", input.addressId).maybeSingle();
  if (!addr) return { ok: false, error: "Choose a delivery address." };

  let payment: Payment;
  if (input.payment?.type === "card") {
    const { brand, last4, name, exp } = input.payment;
    if (!/^\d{4}$/.test(last4)) return { ok: false, error: "Add a payment method." };
    payment = { type: "card", brand: String(brand).slice(0, 20), last4, name: String(name).slice(0, 80), exp: String(exp).slice(0, 5) };
  } else if (input.payment?.type === "cod") {
    payment = { type: "cod" };
  } else {
    return { ok: false, error: "Add a payment method." };
  }

  const t = totals(lines.map(({ p, qty }) => ({ price: p.price, qty })));
  const delivery = orderDelivery(lines.map(({ p }) => ({ prime: p.prime })));
  const address = {
    full_name: addr.full_name, phone: addr.phone, line1: addr.line1, line2: addr.line2,
    city: addr.city, state: addr.state, zip: addr.zip, country: addr.country,
  };

  const { data, error } = await supabase.rpc("place_order", {
    p_order: { ...t, address, payment, delivery_date: delivery.toISOString().slice(0, 10) },
    p_items: lines.map(({ p, qty }) => ({
      product_id: p.id,
      title: p.title,
      slug: p.slug,
      image: p.thumbnail,
      price: p.price,
      qty,
    })),
  });
  if (error || !data?.[0]) return { ok: false, error: error?.message ?? "Something went wrong placing your order." };
  revalidatePath("/orders");
  return { ok: true, data: data[0] };
}

export async function cancelOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id).eq("status", "placed");
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
