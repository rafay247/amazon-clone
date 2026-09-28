"use server";
import { createClient } from "./supabase/server";
import { getSessionUser } from "./auth";
import { getProduct } from "./catalog";
import { toCartProduct } from "./cart-product";
import type { CartItem } from "./cart-store";

type Row = { id: number; qty: number; saved: boolean };

function clean(rows: Row[]): Row[] {
  const seen = new Map<number, Row>();
  for (const r of rows.slice(0, 100)) {
    const p = getProduct(Number(r.id));
    if (!p || p.stock === 0) continue;
    const qty = Math.max(1, Math.min(Math.floor(Number(r.qty)) || 1, p.stock, 30));
    seen.set(p.id, { id: p.id, qty, saved: !!r.saved });
  }
  return [...seen.values()];
}

function hydrate(rows: Row[]): CartItem[] {
  return rows.map((r) => ({ ...toCartProduct(getProduct(r.id)!), qty: r.qty, saved: r.saved }));
}

async function write(userId: string, rows: Row[]) {
  const supabase = await createClient();
  const ids = rows.map((r) => r.id);
  const del = supabase.from("cart_items").delete().eq("user_id", userId);
  await (ids.length ? del.not("product_id", "in", `(${ids.join(",")})`) : del);
  if (rows.length) {
    await supabase.from("cart_items").upsert(
      rows.map((r) => ({ user_id: userId, product_id: r.id, qty: r.qty, saved: r.saved, updated_at: new Date().toISOString() })),
    );
  }
}

/** On sign-in: merge the browser cart into the account cart and return the result. */
export async function mergeCart(local: Row[]): Promise<CartItem[] | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("cart_items").select("product_id, qty, saved").order("updated_at", { ascending: false });
  const merged = new Map<number, Row>();
  for (const r of data ?? []) merged.set(r.product_id, { id: r.product_id, qty: r.qty, saved: r.saved });
  for (const r of local) {
    const prev = merged.get(r.id);
    merged.set(r.id, prev ? { id: r.id, qty: Math.max(prev.qty, r.qty), saved: r.saved && prev.saved } : r);
  }
  const rows = clean([...merged.values()]);
  await write(user.id, rows);
  return hydrate(rows);
}

/** Persist the whole cart (it's small). */
export async function saveCart(items: Row[]) {
  const user = await getSessionUser();
  if (!user) return;
  await write(user.id, clean(items));
}
