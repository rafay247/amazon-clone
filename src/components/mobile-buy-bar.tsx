"use client";
import { cart, type CartProduct } from "@/lib/cart-store";
import { Price } from "./price";

/** Phones only: the buy box sits below the fold, so keep "Add to cart" in reach. */
export function MobileBuyBar({ product }: { product: CartProduct }) {
  if (product.stock === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white px-4 py-2.5 shadow-[0_-2px_8px_rgba(0,0,0,.08)] lg:hidden">
      <Price value={product.price} size="sm" />
      <button className="btn-yellow flex-1" onClick={() => cart.add(product, 1)}>
        Add to cart
      </button>
    </div>
  );
}
