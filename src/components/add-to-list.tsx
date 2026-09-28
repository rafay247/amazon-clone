"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist, wishlist } from "@/lib/list-store";
import type { CartProduct } from "@/lib/cart-store";

export function AddToListButton({ product }: { product: CartProduct }) {
  const saved = useWishlist().some((i) => i.id === product.id);
  return (
    <div>
      <button onClick={() => wishlist.toggle(product)} className="btn-outline flex w-full items-center justify-center gap-2 !rounded-md">
        <Heart size={15} className={saved ? "fill-deal text-deal" : ""} />
        {saved ? "Remove from List" : "Add to List"}
      </button>
      {saved && (
        <p className="mt-2 text-center text-xs">
          Added to{" "}
          <Link href="/lists" className="link">
            Wish List
          </Link>
        </p>
      )}
    </div>
  );
}

export function HeartButton({ product }: { product: CartProduct }) {
  const saved = useWishlist().some((i) => i.id === product.id);
  return (
    <button
      onClick={() => wishlist.toggle(product)}
      aria-label={saved ? "Remove from Wish List" : "Add to Wish List"}
      aria-pressed={saved}
      className="flex size-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-line hover:bg-[#f7fafa]"
    >
      <Heart size={20} className={saved ? "fill-deal text-deal" : "text-ink"} />
    </button>
  );
}
