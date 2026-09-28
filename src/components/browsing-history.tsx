"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { history, useHistory, type Viewed } from "@/lib/history-store";
import { Carousel } from "./carousel";
import { Stars } from "./stars";
import { Price } from "./price";
import { compact } from "@/lib/format";

export function RecordView({ item }: { item: Viewed }) {
  useEffect(() => {
    history.record(item);
  }, [item]);
  return null;
}

export function ViewedCard({ v }: { v: Viewed }) {
  return (
    <Link href={`/dp/${v.id}/${v.slug}`} className="group block w-[170px] shrink-0">
      <div className="flex h-[170px] items-center justify-center bg-[#f7f7f7] p-2">
        <Image src={v.image} alt={v.title} width={160} height={160} className="max-h-full w-auto object-contain mix-blend-multiply" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-link group-hover:text-link-hover group-hover:underline">{v.title}</p>
      <span className="flex items-center gap-1 text-xs">
        <Stars rating={v.rating} size={13} /> <span className="text-link">{compact(v.ratingCount)}</span>
      </span>
      <Price value={v.price} size="sm" />
    </Link>
  );
}

/** "Your browsing history" row on the home page; hidden until you've viewed something. */
export function BrowsingHistoryRow({ excludeId }: { excludeId?: number }) {
  const items = useHistory().filter((v) => v.id !== excludeId);
  if (!items.length) return null;
  return (
    <section className="bg-white px-5 pt-5 pb-4">
      <div className="mb-3 flex items-baseline gap-4">
        <h2 className="text-xl font-bold">Your browsing history</h2>
        <Link href="/history" className="link text-sm">
          View or edit your browsing history
        </Link>
      </div>
      <Carousel label="Your browsing history">
        {items.map((v) => (
          <ViewedCard key={v.id} v={v} />
        ))}
      </Carousel>
    </section>
  );
}
