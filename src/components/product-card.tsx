import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { compact, deliveryDate, productHref } from "@/lib/format";
import { Price, PrimeBadge, ListPrice } from "./price";
import { RatingLine, Stars } from "./stars";
import { AddToCartButton } from "./add-to-cart-button";
import { toCartProduct } from "@/lib/cart-product";

/** Search-results tile. */
export function ResultCard({ p, now }: { p: Product; now: Date }) {
  const href = productHref(p);
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-[#e7e7e7] bg-white">
      <Link href={href} className="relative flex h-[240px] items-center justify-center bg-[#f7f7f7] p-4">
        {p.discount >= 20 && (
          <span className="absolute top-2 left-2 rounded-sm bg-deal px-1.5 py-0.5 text-xs font-bold text-white">
            Limited time deal
          </span>
        )}
        <Image
          src={p.thumbnail}
          alt={p.title}
          width={220}
          height={220}
          className="max-h-full w-auto object-contain mix-blend-multiply"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={href} className="line-clamp-3 text-base leading-snug hover:text-link-hover">
          {p.brand && !p.title.toLowerCase().startsWith(p.brand.toLowerCase()) && <span className="font-bold">{p.brand} </span>}
          {p.title}
        </Link>
        <RatingLine rating={p.rating} count={p.ratingCount} />
        {p.boughtPastMonth > 0 && (
          <p className="text-[13px] text-muted">{compact(p.boughtPastMonth)}+ bought in past month</p>
        )}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <Price value={p.price} />
          {p.listPrice && <ListPrice value={p.listPrice} />}
        </div>
        {p.prime && <PrimeBadge />}
        <p className="text-[13px]">
          {p.prime ? "FREE delivery " : "Delivery "}
          <b>{deliveryDate(p.prime, now)}</b>
        </p>
        {p.stock < 10 && <p className="text-[13px] text-deal">Only {p.stock} left in stock - order soon.</p>}
        <div className="mt-auto pt-2">
          <AddToCartButton product={toCartProduct(p)} />
        </div>
      </div>
    </div>
  );
}

/** Compact tile used in horizontal carousels. */
export function MiniCard({ p, showPrice = true }: { p: Product; showPrice?: boolean }) {
  return (
    <Link href={productHref(p)} className="group block w-[170px] shrink-0">
      <div className="flex h-[170px] items-center justify-center bg-[#f7f7f7] p-2">
        <Image
          src={p.thumbnail}
          alt={p.title}
          width={160}
          height={160}
          className="max-h-full w-auto object-contain mix-blend-multiply"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-link group-hover:text-link-hover group-hover:underline">
        {p.title}
      </p>
      <span className="flex items-center gap-1 text-xs">
        <Stars rating={p.rating} size={13} /> <span className="text-link">{compact(p.ratingCount)}</span>
      </span>
      {showPrice && (
        <div className="mt-0.5 flex items-baseline gap-1.5">
          {p.discount > 0 && <span className="text-lg text-deal">-{p.discount}%</span>}
          <Price value={p.price} size="sm" />
        </div>
      )}
    </Link>
  );
}

/** Deal tile: red badge + price + title. */
export function DealCard({ p }: { p: Product }) {
  return (
    <Link href={productHref(p)} className="group block w-[200px] shrink-0">
      <div className="flex h-[200px] items-center justify-center bg-[#f7f7f7] p-3">
        <Image
          src={p.thumbnail}
          alt={p.title}
          width={180}
          height={180}
          className="max-h-full w-auto object-contain mix-blend-multiply"
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-sm bg-deal px-1.5 py-1 text-xs font-bold text-white">Up to {p.discount}% off</span>
        <span className="text-xs font-bold text-deal">Deal</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm group-hover:text-link-hover">{p.title}</p>
    </Link>
  );
}
