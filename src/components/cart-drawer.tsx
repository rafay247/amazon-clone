"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { cart, useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";

const FREE_SHIPPING = 35;

/** Slide-in panel after "Add to cart", like the real site. */
export function CartDrawer() {
  const { drawer, subtotal, count } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    cart.closeDrawer();
  }, [pathname]);

  useEffect(() => {
    if (!drawer) return;
    const t = setTimeout(() => cart.closeDrawer(), 8000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  if (!drawer) return null;
  const qualifies = subtotal >= FREE_SHIPPING;

  return (
    <aside
      role="status"
      className="fixed top-0 right-0 z-50 flex h-full w-[300px] max-w-full animate-[drawer_.25s_ease-out] flex-col border-l border-line bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between border-b border-line p-4">
        <div className="flex items-center gap-2 text-lg font-bold text-success">
          <CheckCircle2 size={22} /> Added to cart
        </div>
        <button onClick={() => cart.closeDrawer()} aria-label="Close" className="rounded p-1 hover:bg-black/5">
          <X size={18} />
        </button>
      </div>
      <div className="flex gap-3 border-b border-line p-4">
        <Image src={drawer.image} alt="" width={80} height={80} className="size-20 object-contain" />
        <div className="min-w-0">
          <p className="line-clamp-3 text-sm">{drawer.title}</p>
          <p className="mt-1 text-sm font-bold">{money(drawer.price)}</p>
        </div>
      </div>
      <div className="space-y-3 p-4 text-center">
        <p className="text-sm">
          Cart subtotal ({count} item{count === 1 ? "" : "s"}):{" "}
          <b className="text-deal">{money(subtotal)}</b>
        </p>
        <p className={`text-xs ${qualifies ? "text-success" : "text-muted"}`}>
          {qualifies
            ? "Your order qualifies for FREE delivery."
            : `Add ${money(FREE_SHIPPING - subtotal)} of eligible items for FREE delivery.`}
        </p>
        <Link href="/cart" className="btn-outline block">
          Go to Cart
        </Link>
        <Link href="/checkout" className="btn-yellow block">
          Proceed to checkout ({count} item{count === 1 ? "" : "s"})
        </Link>
      </div>
    </aside>
  );
}
