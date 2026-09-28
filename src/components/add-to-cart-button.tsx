"use client";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cart, useCart, type CartProduct } from "@/lib/cart-store";

/** "Add to cart" that turns into a quantity stepper once the item is in the cart. */
export function AddToCartButton({ product }: { product: CartProduct }) {
  const { active } = useCart();
  const inCart = active.find((i) => i.id === product.id);

  if (inCart) {
    return (
      <div className="flex h-8 w-fit items-center rounded-full border-[3px] border-yellow text-sm">
        <button
          onClick={() => cart.setQty(product.id, inCart.qty - 1)}
          aria-label={inCart.qty === 1 ? "Remove from cart" : "Decrease quantity"}
          className="px-2.5"
        >
          {inCart.qty === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
        </button>
        <span className="min-w-6 text-center font-bold" aria-live="polite">
          {inCart.qty}
        </span>
        <button
          onClick={() => cart.add(product, 1, false)}
          aria-label="Increase quantity"
          disabled={inCart.qty >= Math.min(product.stock, 30)}
          className="px-2.5 disabled:opacity-40"
        >
          <Plus size={15} />
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => cart.add(product)} className="btn-yellow" disabled={product.stock === 0}>
      Add to cart
    </button>
  );
}
