import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOrder } from "@/lib/orders";
import { getProduct } from "@/lib/catalog";
import { toCartProduct } from "@/lib/cart-product";
import { money } from "@/lib/format";
import { BuyAgainButton, CancelOrderButton } from "@/components/order-bits";
import { StatusLine } from "@/components/order-status";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  await requireUser(`/orders/${id}`);
  const placed = (await searchParams).placed === "1";
  const o = await getOrder(id);
  if (!o) notFound();

  const steps = ["Ordered", "Shipped", "Out for delivery", "Delivered"];
  const reached = o.status === "delivered" ? 3 : o.status === "shipped" ? 1 : 0;

  return (
    <div className="mx-auto max-w-[950px] px-4 py-4">
      {placed && (
        <div className="mb-5 rounded-lg border border-success/40 bg-[#f3faf3] p-5">
          <p className="flex items-center gap-2 text-lg font-bold text-success">
            <CheckCircle2 /> Order placed, thanks!
          </p>
          <p className="mt-1 text-sm">
            Confirmation will be sent to your email. <b>Shipping to {o.address.full_name}</b>, {o.address.line1}, {o.address.city}.
          </p>
          <div className="mt-3 flex gap-3">
            <Link href="/" className="btn-yellow">
              Continue shopping
            </Link>
            <Link href="/orders" className="btn-outline">
              Review or edit your recent orders
            </Link>
          </div>
        </div>
      )}
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/account" className="link">
          Your Account
        </Link>{" "}
        ›{" "}
        <Link href="/orders" className="link">
          Your Orders
        </Link>{" "}
        › <span className="text-[#c45500]">Order Details</span>
      </nav>
      <h1 className="mt-2 text-[28px]">Order Details</h1>
      <p className="text-sm">
        Ordered on {new Date(o.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        <span className="mx-2 text-line">|</span>Order# {o.number}
      </p>

      <div className="mt-4 grid gap-6 rounded-lg border border-line p-5 text-sm sm:grid-cols-3">
        <div>
          <h2 className="font-bold">Ship to</h2>
          <p>{o.address.full_name}</p>
          <p>{o.address.line1}</p>
          {o.address.line2 && <p>{o.address.line2}</p>}
          <p>
            {o.address.city}, {o.address.state} {o.address.zip}
          </p>
          <p>{o.address.country}</p>
        </div>
        <div>
          <h2 className="font-bold">Payment method</h2>
          <p>{o.payment.type === "card" ? `${o.payment.brand} ending in ${o.payment.last4}` : "Pay on delivery"}</p>
        </div>
        <div>
          <h2 className="font-bold">Order Summary</h2>
          <dl className="space-y-0.5">
            <Line k="Item(s) Subtotal:" v={money(o.subtotal)} />
            <Line k="Shipping & Handling:" v={money(o.shipping)} />
            <Line k="Total before tax:" v={money(o.subtotal + o.shipping)} />
            <Line k="Estimated tax:" v={money(o.tax)} />
            <Line k="Grand Total:" v={money(o.total)} bold />
          </dl>
        </div>
      </div>

      <div className="mt-5 grid gap-6 rounded-lg border border-line p-5 md:grid-cols-[1fr_220px]">
        <div>
          <StatusLine o={o} />
          {o.status !== "cancelled" && (
            <ol className="my-4 flex items-center text-xs" aria-label="Shipment progress">
              {steps.map((s, i) => (
                <li key={s} className="flex flex-1 flex-col items-start">
                  <div className="flex w-full items-center">
                    <span className={`size-3 shrink-0 rounded-full ${i <= reached ? "bg-success" : "bg-line"}`} />
                    {i < steps.length - 1 && <span className={`h-1 flex-1 ${i < reached ? "bg-success" : "bg-line"}`} />}
                  </div>
                  <span className={`mt-1 ${i <= reached ? "font-bold" : "text-muted"}`}>{s}</span>
                </li>
              ))}
            </ol>
          )}
          <ul className="space-y-4">
            {o.order_items.map((it) => {
              const p = getProduct(it.product_id);
              return (
                <li key={it.id} className="flex gap-4 text-sm">
                  <Image src={it.image} alt="" width={90} height={90} className="size-[90px] shrink-0 object-contain" />
                  <div>
                    <Link href={`/dp/${it.product_id}/${it.slug}`} className="link line-clamp-2">
                      {it.title}
                    </Link>
                    <p className="text-xs text-muted">Qty: {it.qty}</p>
                    <p className="font-bold text-deal">{money(it.price)}</p>
                    <div className="mt-2">
                      <BuyAgainButton product={p ? toCartProduct(p) : null} compact />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-2">
          {o.status === "placed" && <CancelOrderButton id={o.id} />}
          {o.order_items[0] && (
            <Link href={`/review/${o.order_items[0].product_id}`} className="btn-outline block text-center">
              Write a product review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Line({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${bold ? "font-bold" : ""}`}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
