"use client";
import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Heart, TrendingDown } from "lucide-react";
import { useWishlist, wishlist } from "@/lib/list-store";
import { cart } from "@/lib/cart-store";
import { money } from "@/lib/format";

const noop = () => () => {};

export default function ListsPage() {
  const items = useWishlist();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <h1 className="text-[28px]">Your Lists</h1>
      <div className="mt-4 rounded-lg border border-line">
        <div className="border-b border-line bg-[#f0f2f2] px-5 py-3">
          <h2 className="text-lg font-bold">Wish List</h2>
          <p className="text-xs text-muted">Private · saved on this device</p>
        </div>
        {!hydrated ? (
          <div className="h-40 animate-pulse" />
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm">
            <Heart size={36} className="mx-auto text-muted" />
            <p className="mt-2 font-bold">Your Wish List is empty</p>
            <p className="mt-1 text-muted">Tap the heart on any product to save it here.</p>
            <Link href="/" className="btn-yellow mt-4 inline-block">
              Discover products
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((i) => {
              const href = `/dp/${i.id}/${i.slug}`;
              const drop = i.addedPrice - i.price;
              return (
                <li key={i.id} className="flex gap-4 p-5">
                  <Link href={href} className="flex size-32 shrink-0 items-center justify-center">
                    <Image src={i.image} alt="" width={130} height={130} className="max-h-full w-auto object-contain" />
                  </Link>
                  <div className="min-w-0 flex-1 text-sm">
                    <Link href={href} className="link line-clamp-2 text-base">
                      {i.title}
                    </Link>
                    <p className="mt-1 text-lg font-bold">{money(i.price)}</p>
                    {drop > 0 && (
                      <p className="flex items-center gap-1 text-xs text-success">
                        <TrendingDown size={14} /> Price dropped {money(drop)} since you added it
                      </p>
                    )}
                    <p className="text-xs text-muted">
                      Item added {new Date(i.addedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex w-36 shrink-0 flex-col gap-2">
                    <button onClick={() => cart.add(i)} className="btn-yellow !text-xs">
                      Add to Cart
                    </button>
                    <button onClick={() => wishlist.remove(i.id)} className="btn-outline !text-xs">
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
