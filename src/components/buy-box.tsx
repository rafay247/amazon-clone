"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import { cart, useCart, type CartProduct } from "@/lib/cart-store";
import { Price, PrimeBadge } from "./price";
import { DeliverToButton } from "./deliver-to";
import { AddToListButton } from "./add-to-list";

export function BuyBox({
  product,
  delivery,
  fastDelivery,
  returnPolicy,
  brand,
}: {
  product: CartProduct;
  delivery: string;
  fastDelivery: string;
  returnPolicy: string;
  brand: string | null;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const { active } = useCart();
  const inCart = active.find((i) => i.id === product.id)?.qty ?? 0;
  const max = Math.max(0, Math.min(product.stock, 30) - inCart);
  const out = product.stock === 0;

  return (
    <div className="rounded-lg border border-line p-4 text-sm">
      <Price value={product.price} />
      {product.prime && <PrimeBadge className="mt-1 block" />}
      <p className="mt-3">
        {product.prime ? (
          <>
            <span className="text-link">FREE delivery</span> <b>{delivery}</b>
          </>
        ) : (
          <>
            $5.99 delivery <b>{delivery}</b>
          </>
        )}
      </p>
      {product.prime && (
        <p className="mt-1">
          Or fastest delivery <b>{fastDelivery}</b>. Order within <span className="text-success">4 hrs 12 mins</span>
        </p>
      )}
      <div className="mt-3">
        <DeliverToButton variant="inline" />
      </div>

      <p className={`mt-3 text-lg ${out ? "text-deal" : product.stock < 10 ? "text-deal" : "text-success"}`}>
        {out ? "Currently unavailable." : product.stock < 10 ? `Only ${product.stock} left in stock - order soon.` : "In Stock"}
      </p>

      {!out && (
        <>
          <label className="mt-3 flex w-fit items-center gap-1 rounded-lg border border-line bg-[#f0f2f2] px-2.5 py-1.5 shadow-sm">
            Quantity:
            <select
              value={Math.min(qty, Math.max(1, max))}
              onChange={(e) => setQty(Number(e.target.value))}
              className="cursor-pointer bg-transparent outline-none"
              disabled={max === 0}
            >
              {Array.from({ length: Math.max(1, Math.min(max, 10)) }, (_, i) => i + 1).map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          {inCart > 0 && <p className="mt-2 text-xs text-success">{inCart} already in your cart</p>}
          <div className="mt-3 space-y-2">
            <button className="btn-yellow w-full" disabled={max === 0} onClick={() => cart.add(product, qty)}>
              Add to cart
            </button>
            <button
              className="btn-orange w-full"
              onClick={() => {
                if (max > 0) cart.add(product, qty, false);
                router.push("/checkout");
              }}
            >
              Buy Now
            </button>
          </div>
        </>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-link">
        <Lock size={13} className="text-muted" /> Secure transaction
      </p>
      <dl className="mt-3 grid grid-cols-[80px_1fr] gap-y-1 text-xs">
        <dt className="text-muted">Ships from</dt>
        <dd>Cartly</dd>
        <dt className="text-muted">Sold by</dt>
        <dd className="text-link">{brand ?? "Cartly"}</dd>
        <dt className="text-muted">Returns</dt>
        <dd className="text-link">{returnPolicy}</dd>
      </dl>
      <hr className="my-4 border-line" />
      <AddToListButton product={product} />
    </div>
  );
}
