import Link from "next/link";
import { ShoppingBasket } from "lucide-react";

/** Cartly wordmark with a basket mark. */
export function Logo({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Cartly home"
      className={`nav-hover flex shrink-0 items-center gap-1 px-1.5 pt-1.5 pb-1 ${className}`}
    >
      <ShoppingBasket size={24} className="text-orange" aria-hidden />
      <span className={`text-[24px] font-bold tracking-[-0.5px] leading-none ${dark ? "text-ink" : "text-white"}`}>
        cartly
      </span>
    </Link>
  );
}
