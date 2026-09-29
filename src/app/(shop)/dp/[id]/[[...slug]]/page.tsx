import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getDepartment, getProduct, related } from "@/lib/catalog";
import { compact, deliveryDate, money } from "@/lib/format";
import { toCartProduct } from "@/lib/cart-product";
import { Gallery } from "@/components/gallery";
import { BuyBox } from "@/components/buy-box";
import { Price, PrimeBadge } from "@/components/price";
import { RatingLine } from "@/components/stars";
import { Carousel } from "@/components/carousel";
import { MiniCard } from "@/components/product-card";
import { RatingHistogram, ReviewList } from "@/components/reviews";
import { BrowsingHistoryRow, RecordView } from "@/components/browsing-history";
import { HeartButton } from "@/components/add-to-list";
import { MobileBuyBar } from "@/components/mobile-buy-bar";
import { AskAboutItem } from "@/components/ask-about-item";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/dp/[id]/[[...slug]]">): Promise<Metadata> {
  const p = getProduct(Number((await params).id));
  return { title: p ? p.title : "Product not found", description: p?.description };
}

export default async function ProductPage({ params }: PageProps<"/dp/[id]/[[...slug]]">) {
  await connection();
  const p = getProduct(Number((await params).id));
  if (!p) notFound();

  const dept = getDepartment(p.department);
  const now = new Date();
  const fast = new Date(now);
  fast.setHours(fast.getHours() + 20);
  const cp = toCartProduct(p);
  const also = related(p);
  const supabase = await createClient();
  const { data: written } = await supabase
    .from("reviews")
    .select("rating, title, body, author_name, created_at, verified")
    .eq("product_id", p.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const reviews = [
    ...(written ?? []).map((r) => ({ rating: r.rating, title: r.title, comment: r.body, name: r.author_name, date: r.created_at, verified: r.verified })),
    ...p.reviews,
  ];

  const bullets = [
    p.description,
    p.brand && `Brand: ${p.brand} — backed by ${p.warranty.toLowerCase()}.`,
    `${p.shipping}. ${p.returnPolicy}.`,
    `Dimensions: ${p.dimensions.width} x ${p.dimensions.height} x ${p.dimensions.depth} cm; weight ${p.weight} oz.`,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 lg:pb-10">
      <MobileBuyBar product={cp} />
      <RecordView
        item={{ id: p.id, slug: p.slug, title: p.title, image: p.thumbnail, price: p.price, rating: p.rating, ratingCount: p.ratingCount }}
      />
      <nav aria-label="Breadcrumb" className="py-3 text-xs text-muted">
        <Link href={`/s?dept=${p.department}`} className="hover:underline">
          {dept?.name}
        </Link>
        {" › "}
        <Link href={`/s?cat=${p.category}`} className="hover:underline">
          {p.categoryName}
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_260px]">
        <div className="relative lg:sticky lg:top-4 lg:self-start">
          <Gallery images={p.images} title={p.title} />
          <div className="absolute top-0 right-0">
            <HeartButton product={cp} />
          </div>
        </div>

        <div>
          <h1 className="text-2xl leading-8">{p.title}</h1>
          {p.brand && (
            <Link href={`/s?brand=${encodeURIComponent(p.brand)}`} className="link text-sm">
              Visit the {p.brand} Store
            </Link>
          )}
          <div className="mt-1">
            <RatingLine rating={p.rating} count={p.ratingCount} href="#reviews" />
          </div>
          {p.ratingCount > 20000 && (
            <span className="mt-1 inline-block rounded-sm bg-nav px-1.5 py-0.5 text-xs text-white">
              Cartly&apos;s <span className="text-orange">Choice</span>
            </span>
          )}
          {p.boughtPastMonth > 0 && (
            <p className="mt-1 text-sm">
              <b>{compact(p.boughtPastMonth)}+ bought</b> <span className="text-muted">in past month</span>
            </p>
          )}
          <hr className="my-3 border-line" />
          {p.discount > 0 && (
            <span className="mb-1 inline-block rounded-sm bg-deal px-1.5 py-1 text-xs font-bold text-white">Limited time deal</span>
          )}
          <div className="flex items-start gap-2">
            {p.discount > 0 && <span className="text-[28px] leading-none font-light text-deal">-{p.discount}%</span>}
            <Price value={p.price} size="lg" />
          </div>
          {p.listPrice && (
            <p className="text-xs text-muted">
              List Price: <span className="line-through">{money(p.listPrice)}</span>
            </p>
          )}
          {p.prime && <PrimeBadge className="mt-1" />}
          <p className="mt-2 text-sm">
            <span className="text-link">FREE Returns</span>
          </p>
          <hr className="my-3 border-line" />

          <table className="text-sm">
            <tbody>
              {[
                ["Brand", p.brand],
                ["Category", p.categoryName],
                ["Warranty", p.warranty],
                ["Item Weight", `${p.weight} ounces`],
                ["SKU", p.sku],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-1 pr-6 font-bold">{k}</td>
                    <td className="py-1">{v}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <hr className="my-3 border-line" />
          <h2 className="font-bold">About this item</h2>
          <ul className="mt-1 list-disc space-y-1.5 pl-5 text-sm">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {p.tags.length > 0 && (
            <p className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <Link key={t} href={`/s?k=${encodeURIComponent(t)}`} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-[#f7fafa]">
                  {t}
                </Link>
              ))}
            </p>
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <BuyBox
            product={cp}
            delivery={deliveryDate(p.prime, now)}
            fastDelivery={`Tomorrow, ${fast.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
            returnPolicy={p.returnPolicy}
            brand={p.brand}
          />
          <AskAboutItem />
        </div>
      </div>

      {also.length > 0 && (
        <section className="mt-10 border-t border-line pt-6">
          <h2 className="mb-3 text-xl font-bold">Products related to this item</h2>
          <Carousel label="Related products">
            {also.map((x) => (
              <MiniCard key={x.id} p={x} />
            ))}
          </Carousel>
        </section>
      )}

      <section id="reviews" className="mt-10 grid scroll-mt-4 gap-10 border-t border-line pt-6 md:grid-cols-[300px_1fr]">
        <div>
          <RatingHistogram rating={p.rating} count={p.ratingCount} />
          <hr className="my-6 border-line" />
          <h3 className="font-bold">Review this product</h3>
          <p className="mt-1 text-sm">Share your thoughts with other customers</p>
          <Link href={`/review/${p.id}`} className="btn-outline mt-3 block text-center">
            Write a customer review
          </Link>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold">Top reviews from the United States</h3>
          <ReviewList reviews={reviews} />
        </div>
      </section>

      <div className="mt-10 border-t border-line pt-2">
        <BrowsingHistoryRow excludeId={p.id} />
      </div>
    </div>
  );
}
