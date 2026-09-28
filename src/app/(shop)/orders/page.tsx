import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { getProduct } from "@/lib/catalog";
import { toCartProduct } from "@/lib/cart-product";
import { money } from "@/lib/format";
import type { Order } from "@/lib/types";
import { BuyAgainButton } from "@/components/order-bits";
import { Stars } from "@/components/stars";
import { StatusLine } from "@/components/order-status";

export const metadata: Metadata = { title: "Your Orders" };

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function OrdersPage({ searchParams }: PageProps<"/orders">) {
  await requireUser("/orders");
  const { tab } = await searchParams;
  const orders = await listOrders();
  const buyAgain = tab === "buy-again";

  return (
    <div className="mx-auto max-w-[950px] px-4 py-4">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/account" className="link">
          Your Account
        </Link>{" "}
        › <span className="text-[#c45500]">Your Orders</span>
      </nav>
      <h1 className="mt-2 text-[28px]">Your Orders</h1>
      <div className="mt-3 flex gap-6 border-b border-line text-sm">
        <Tab href="/orders" on={!buyAgain}>
          Orders
        </Tab>
        <Tab href="/orders?tab=buy-again" on={buyAgain}>
          Buy Again
        </Tab>
      </div>

      {buyAgain ? <BuyAgain orders={orders} /> : <OrderList orders={orders} />}
    </div>
  );
}

function Tab({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`-mb-px px-2 pb-2 ${on ? "border-b-2 border-[#e77600] font-bold" : "text-link hover:text-link-hover"}`}>
      {children}
    </Link>
  );
}

function OrderList({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return (
      <div className="py-10 text-center text-sm">
        <p>
          <b>0 orders</b> placed yet.
        </p>
        <p className="mt-2">
          Looks like you haven&apos;t placed an order.{" "}
          <Link href="/" className="link">
            Start shopping
          </Link>
        </p>
      </div>
    );
  }
  return (
    <>
      <p className="my-4 text-sm">
        <b>
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </b>{" "}
        placed
      </p>
      <ul className="space-y-5">
        {orders.map((o) => (
          <li key={o.id} className="overflow-hidden rounded-lg border border-line">
            <div className="flex flex-wrap gap-x-8 gap-y-2 bg-[#f0f2f2] px-5 py-3 text-xs text-muted">
              <Meta k="Order placed" v={fmt(o.created_at)} />
              <Meta k="Total" v={money(o.total)} />
              <Meta k="Ship to" v={o.address.full_name} link />
              <div className="ml-auto text-right">
                <p className="uppercase">Order # {o.number}</p>
                <Link href={`/orders/${o.id}`} className="link">
                  View order details
                </Link>
              </div>
            </div>
            <div className="p-5">
              <StatusLine o={o} />
              <ul className="mt-3 space-y-4">
                {o.order_items.map((it) => {
                  const p = getProduct(it.product_id);
                  return (
                    <li key={it.id} className="flex gap-4">
                      <Link href={`/dp/${it.product_id}/${it.slug}`} className="shrink-0">
                        <Image src={it.image} alt="" width={90} height={90} className="size-[90px] object-contain" />
                      </Link>
                      <div className="text-sm">
                        <Link href={`/dp/${it.product_id}/${it.slug}`} className="link line-clamp-2">
                          {it.title}
                        </Link>
                        <p className="text-xs text-muted">
                          Qty {it.qty} · {money(it.price)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <BuyAgainButton product={p ? toCartProduct(p) : null} compact />
                          <Link href={`/dp/${it.product_id}/${it.slug}`} className="btn-outline !px-3 !py-1 !text-xs">
                            View your item
                          </Link>
                          <Link href={`/review/${it.product_id}`} className="btn-outline !px-3 !py-1 !text-xs">
                            Write a product review
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Meta({ k, v, link }: { k: string; v: string; link?: boolean }) {
  return (
    <div>
      <p className="uppercase">{k}</p>
      <p className={`text-sm ${link ? "text-link" : "text-ink"}`}>{v}</p>
    </div>
  );
}

function BuyAgain({ orders }: { orders: Order[] }) {
  const seen = new Set<number>();
  const products = orders
    .flatMap((o) => o.order_items)
    .filter((i) => (seen.has(i.product_id) ? false : (seen.add(i.product_id), true)))
    .map((i) => getProduct(i.product_id))
    .filter((p) => !!p);
  if (!products.length) {
    return <p className="py-10 text-center text-sm">Items you&apos;ve bought will appear here, ready to reorder in one click.</p>;
  }
  return (
    <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
      {products.map((p) => (
        <li key={p.id} className="flex flex-col rounded-lg border border-line p-3 text-sm">
          <Link href={`/dp/${p.id}/${p.slug}`} className="flex h-36 items-center justify-center">
            <Image src={p.thumbnail} alt="" width={140} height={140} className="max-h-full w-auto object-contain" />
          </Link>
          <Link href={`/dp/${p.id}/${p.slug}`} className="link mt-2 line-clamp-2">
            {p.title}
          </Link>
          <Stars rating={p.rating} size={13} />
          <b className="mt-1">{money(p.price)}</b>
          <div className="mt-auto pt-2">
            <BuyAgainButton product={toCartProduct(p)} compact />
          </div>
        </li>
      ))}
    </ul>
  );
}
