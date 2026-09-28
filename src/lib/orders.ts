import "server-only";
import { createClient } from "./supabase/server";
import type { Order } from "./types";

const COLS =
  "id, number, status, subtotal, shipping, tax, total, address, payment, delivery_date, created_at, order_items (id, product_id, title, slug, image, price, qty)";

/** Orders past their delivery date read as delivered; there's no fulfilment backend. */
function withStatus(o: Order): Order {
  if (o.status !== "placed") return o;
  const today = new Date().toISOString().slice(0, 10);
  if (o.delivery_date < today) return { ...o, status: "delivered" };
  return o;
}

export async function listOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select(COLS).order("created_at", { ascending: false });
  return ((data ?? []) as unknown as Order[]).map(withStatus);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select(COLS).eq("id", id).maybeSingle();
  return data ? withStatus(data as unknown as Order) : null;
}
