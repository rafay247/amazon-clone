"use client";
import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CheckCircle2, Minus, Plus, Trash2 } from "lucide-react";
import { cart, useCart, type CartItem } from "@/lib/cart-store";
import { money } from "@/lib/format";
import { PrimeBadge } from "@/components/price";
import { BrowsingHistoryRow } from "@/components/browsing-history";

const FREE_SHIPPING = 35;
const noop = () => () => {};

export function CartView() {
  const { active, saved, count, subtotal } = useCart();
  // The cart lives in localStorage; render a skeleton on the server pass instead of "empty".
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  if (!hydrated) {
    return (
      <div className="bg-page p-5">
        <div className="mx-auto h-64 max-w-[1500px] animate-pulse bg-white" />
      </div>
    );
  }

  return (
    <div className="bg-page px-3 py-5 sm:px-5">
      <div className="mx-auto grid max-w-[1500px] items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="bg-white px-5 pt-5 pb-3">
            {active.length === 0 ? (
              <div className="pb-4">
                <h1 className="text-2xl font-bold">Your Amazon.clone Cart is empty</h1>
                <p className="mt-2 text-sm">
                  Your shopping cart lives to serve. Give it purpose — fill it with groceries, clothing, household supplies,
                  electronics, and more. Continue shopping on the{" "}
                  <Link href="/" className="link">
                    homepage
                  </Link>
                  , learn about{" "}
                  <Link href="/deals" className="link">
                    today&apos;s deals
                  </Link>
                  , or visit your{" "}
                  <Link href="/lists" className="link">
                    Wish List
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between border-b border-line pb-2">
                  <h1 className="text-[28px] leading-tight">Shopping Cart</h1>
                  <span className="hidden text-sm text-muted sm:block">Price</span>
                </div>
                <ul>
                  {active.map((i) => (
                    <Line key={i.id} item={i} />
                  ))}
                </ul>
                <p className="py-2 text-right text-lg">
                  Subtotal ({count} item{count === 1 ? "" : "s"}): <b>{money(subtotal)}</b>
                </p>
              </>
            )}
          </section>

          <section className="bg-white p-5">
            <h2 className="text-2xl font-bold">
              Saved for later {saved.length > 0 && <span className="text-base font-normal text-muted">({saved.length} item{saved.length === 1 ? "" : "s"})</span>}
            </h2>
            {saved.length === 0 ? (
              <p className="mt-3 rounded-md border border-line p-3 text-sm">No items saved for later</p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {saved.map((i) => (
                  <li key={i.id} className="flex flex-col rounded-md border border-line p-3 text-sm">
                    <Link href={`/dp/${i.id}/${i.slug}`} className="flex h-32 items-center justify-center">
                      <Image src={i.image} alt="" width={120} height={120} className="max-h-full w-auto object-contain" />
                    </Link>
                    <Link href={`/dp/${i.id}/${i.slug}`} className="link mt-2 line-clamp-2">
                      {i.title}
                    </Link>
                    <b className="mt-1">{money(i.price)}</b>
                    <p className="text-xs text-success">In Stock</p>
                    <button onClick={() => cart.toggleSaved(i.id)} className="btn-outline mt-2 !text-xs">
                      Move to cart
                    </button>
                    <button onClick={() => cart.remove(i.id)} className="link mt-1.5 text-xs">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <BrowsingHistoryRow />
        </div>

        {active.length > 0 && (
          <aside className="order-first space-y-3 bg-white p-5 lg:sticky lg:top-4 lg:order-none">
            {subtotal >= FREE_SHIPPING ? (
              <p className="flex gap-1.5 text-xs text-success">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>
                  Your order qualifies for FREE Shipping. <span className="text-ink">Choose this option at checkout.</span>
                </span>
              </p>
            ) : (
              <div className="text-xs">
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-[#e3e6e6]">
                  <div className="h-full bg-success" style={{ width: `${(subtotal / FREE_SHIPPING) * 100}%` }} />
                </div>
                Add <b className="text-deal">{money(FREE_SHIPPING - subtotal)}</b> of eligible items to your order for FREE delivery.
              </div>
            )}
            <p className="text-lg">
              Subtotal ({count} item{count === 1 ? "" : "s"}): <b>{money(subtotal)}</b>
            </p>
            <Link href="/checkout" className="btn-yellow block w-full text-center">
              Proceed to checkout
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}

function Line({ item: i }: { item: CartItem }) {
  const href = `/dp/${i.id}/${i.slug}`;
  return (
    <li className="flex gap-4 border-b border-line py-4 last:border-b-0">
      <Link href={href} className="flex size-32 shrink-0 items-center justify-center sm:size-44">
        <Image src={i.image} alt="" width={180} height={180} className="max-h-full w-auto object-contain" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-4">
          <Link href={href} className="line-clamp-2 text-lg leading-snug hover:text-link-hover">
            {i.title}
          </Link>
          <b className="hidden shrink-0 text-lg sm:block">{money(i.price)}</b>
        </div>
        <b className="sm:hidden">{money(i.price)}</b>
        <p className={`text-xs ${i.stock < 10 ? "text-deal" : "text-success"}`}>
          {i.stock < 10 ? `Only ${i.stock} left in stock - order soon.` : "In Stock"}
        </p>
        {i.prime && <PrimeBadge />}
        <p className="text-xs text-muted">FREE Returns</p>
        {i.listPrice && (
          <p className="text-xs">
            <span className="rounded-sm bg-deal px-1 py-0.5 font-bold text-white">
              {Math.round((1 - i.price / i.listPrice) * 100)}% off
            </span>{" "}
            <span className="text-muted">
              List: <s>{money(i.listPrice)}</s>
            </span>
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <div className="flex h-8 items-center rounded-full border-[3px] border-yellow text-sm">
            <button onClick={() => cart.setQty(i.id, i.qty - 1)} aria-label={i.qty === 1 ? "Delete" : "Decrease quantity"} className="px-2.5">
              {i.qty === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
            </button>
            <span className="min-w-6 text-center font-bold" aria-live="polite">
              {i.qty}
            </span>
            <button
              onClick={() => cart.setQty(i.id, i.qty + 1)}
              aria-label="Increase quantity"
              disabled={i.qty >= Math.min(i.stock, 30)}
              className="px-2.5 disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
          <Sep />
          <button onClick={() => cart.remove(i.id)} className="link">
            Delete
          </button>
          <Sep />
          <button onClick={() => cart.toggleSaved(i.id)} className="link">
            Save for later
          </button>
          <Sep />
          <Link href={`/s?k=${encodeURIComponent(i.title.split(" ").slice(0, 2).join(" "))}`} className="link">
            Compare with similar items
          </Link>
        </div>
      </div>
    </li>
  );
}

function Sep() {
  return <span className="h-4 w-px bg-line" aria-hidden />;
}
