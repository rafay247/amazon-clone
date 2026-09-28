"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="nav-hover flex shrink-0 items-end px-1.5 py-1" aria-label={`Cart, ${count} items`}>
      <span className="relative">
        <CartIcon />
        <span className="absolute top-[-3px] left-[17px] w-[22px] text-center text-base font-bold text-orange">
          {count > 99 ? "99+" : count}
        </span>
      </span>
      <span className="mb-0.5 hidden text-sm font-bold text-white sm:inline">Cart</span>
    </Link>
  );
}

function CartIcon() {
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none" aria-hidden>
      <path d="M2 6h5l5 17h20l4-12H12" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="28" r="2.4" fill="white" />
      <circle cx="29" cy="28" r="2.4" fill="white" />
    </svg>
  );
}
