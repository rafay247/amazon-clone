import type { Order } from "@/lib/types";

export function StatusLine({ o }: { o: Order }) {
  const date = new Date(o.delivery_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const text = {
    placed: `Arriving ${date}`,
    shipped: `Arriving ${date}`,
    delivered: `Delivered ${date}`,
    cancelled: "Cancelled",
  }[o.status];
  return <h2 className={`text-lg font-bold ${o.status === "cancelled" ? "text-deal" : o.status === "delivered" ? "" : "text-success"}`}>{text}</h2>;
}
