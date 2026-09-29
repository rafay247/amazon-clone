import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Check } from "lucide-react";
import { ResultCard } from "@/components/product-card";
import { Stars } from "@/components/stars";
import { SortSelect } from "@/components/sort-select";
import { categoryName, getDepartment, search, type SearchParams, type SortKey } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;

function parse(sp: SP): SearchParams {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) as string | undefined;
  const num = (k: string) => {
    const v = one(k);
    return v != null && v !== "" && !isNaN(Number(v)) ? Number(v) : undefined;
  };
  const brand = sp.brand ? (Array.isArray(sp.brand) ? sp.brand : [sp.brand]) : undefined;
  return {
    k: one("k"),
    dept: one("dept"),
    cat: one("cat"),
    brand,
    minRating: num("rating"),
    minPrice: num("min"),
    maxPrice: num("max"),
    prime: one("prime") === "1",
    deals: one("deals") === "1",
    sort: (one("sort") as SortKey) ?? "featured",
    page: num("page"),
  };
}

function heading(q: SearchParams) {
  if (q.k) return `"${q.k}"`;
  if (q.cat) return categoryName(q.cat) ?? q.cat;
  if (q.dept) return getDepartment(q.dept)?.name ?? q.dept;
  if (q.deals) return "Today's Deals";
  if (q.sort === "rating") return "Best Sellers";
  if (q.sort === "newest") return "New Releases";
  return "All products";
}

export async function generateMetadata({ searchParams }: PageProps<"/s">): Promise<Metadata> {
  const q = parse(await searchParams);
  return { title: q.k ? `Cartly : ${q.k}` : heading(q) };
}

export default async function SearchPage({ searchParams }: PageProps<"/s">) {
  await connection();
  const sp = await searchParams;
  const q = parse(sp);
  const r = search(q);
  const now = new Date();

  // Build hrefs that toggle one param while keeping the rest.
  const href = (patch: Record<string, string | string[] | null>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "page" || v == null) continue;
      (Array.isArray(v) ? v : [v]).forEach((x) => u.append(k, x));
    }
    for (const [k, v] of Object.entries(patch)) {
      u.delete(k);
      if (v == null) continue;
      (Array.isArray(v) ? v : [v]).forEach((x) => u.append(k, x));
    }
    return `/s?${u}`;
  };

  const from = (r.page - 1) * 16 + 1;
  const to = Math.min(r.page * 16, r.total);
  const activeFilters = !!(q.brand?.length || q.minRating || q.minPrice != null || q.maxPrice != null || q.prime || q.deals);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2 shadow-sm">
        <p className="text-sm">
          {r.total ? `${from}-${to} of ${r.total} results for ` : "No results for "}
          <span className="font-bold text-[#c45500]">{heading(q)}</span>
        </p>
        <div className="flex items-center gap-2">
          {/* Phones: toggles the filter panel below via the checkbox (no JS needed). */}
          <label
            htmlFor="filters-toggle"
            className="cursor-pointer rounded-lg border border-line bg-[#f0f2f2] px-3 py-1 text-xs shadow-sm md:hidden"
          >
            Filters{activeFilters && <span className="ml-1 font-bold text-[#c45500]">•</span>}
          </label>
          <SortSelect value={q.sort ?? "featured"} />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-4 md:flex-row">
        <input id="filters-toggle" type="checkbox" className="peer sr-only" />
        <aside
          className="hidden shrink-0 space-y-5 rounded-lg border border-line p-4 text-sm peer-checked:block md:block md:w-[240px] md:rounded-none md:border-0 md:p-0"
          aria-label="Filters"
        >
          {activeFilters && (
            <Link href={href({ brand: null, rating: null, min: null, max: null, prime: null, deals: null })} className="link text-sm">
              ‹ Clear all filters
            </Link>
          )}
          <Facet title="Delivery">
            <Toggle on={!!q.prime} href={href({ prime: q.prime ? null : "1" })}>
              <span className="font-bold italic text-prime">express</span> eligible
            </Toggle>
            <Toggle on={!!q.deals} href={href({ deals: q.deals ? null : "1" })}>
              Today&apos;s Deals
            </Toggle>
          </Facet>

          {r.categories.length > 1 && (
            <Facet title="Department">
              {q.cat && (
                <Link href={href({ cat: null })} className="block text-ink hover:text-link-hover">
                  ‹ Any Department
                </Link>
              )}
              {r.categories.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  href={href({ cat: c.id })}
                  className={`block hover:text-link-hover ${q.cat === c.id ? "font-bold" : ""}`}
                >
                  {c.name}
                </Link>
              ))}
            </Facet>
          )}

          <Facet title="Customer Reviews">
            {[4, 3, 2].map((n) => (
              <Link
                key={n}
                href={href({ rating: q.minRating === n ? null : String(n) })}
                className={`flex items-center gap-1 hover:text-link-hover ${q.minRating === n ? "font-bold" : ""}`}
              >
                <Stars rating={n} size={18} /> &amp; Up
              </Link>
            ))}
          </Facet>

          <Facet title="Price">
            {[
              [null, 25, "Up to $25"],
              [25, 50, "$25 to $50"],
              [50, 200, "$50 to $200"],
              [200, 1000, "$200 to $1,000"],
              [1000, null, "$1,000 & above"],
            ].map(([min, max, label]) => {
              const on = q.minPrice == (min ?? undefined) && q.maxPrice == (max ?? undefined);
              return (
                <Link
                  key={label as string}
                  href={on ? href({ min: null, max: null }) : href({ min: min != null ? String(min) : null, max: max != null ? String(max) : null })}
                  className={`block hover:text-link-hover ${on ? "font-bold" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
            <form action="/s" className="mt-2 flex items-center gap-1.5">
              {Object.entries(sp).flatMap(([k, v]) =>
                k === "min" || k === "max" || k === "page" || v == null
                  ? []
                  : (Array.isArray(v) ? v : [v]).map((x, i) => <input key={k + i} type="hidden" name={k} value={x} />),
              )}
              <input name="min" placeholder="$ Min" defaultValue={q.minPrice ?? ""} className="input !w-20 !px-2" inputMode="decimal" aria-label="Minimum price" />
              <input name="max" placeholder="$ Max" defaultValue={q.maxPrice ?? ""} className="input !w-20 !px-2" inputMode="decimal" aria-label="Maximum price" />
              <button className="btn-outline !rounded-md !px-3">Go</button>
            </form>
          </Facet>

          {r.brands.length > 0 && (
            <Facet title="Brands">
              {r.brands.slice(0, 14).map((b) => {
                const on = q.brand?.includes(b) ?? false;
                const next = on ? (q.brand ?? []).filter((x) => x !== b) : [...(q.brand ?? []), b];
                return (
                  <Toggle key={b} on={on} href={href({ brand: next.length ? next : null })}>
                    {b}
                  </Toggle>
                );
              })}
            </Facet>
          )}
        </aside>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">Results</h1>
          <p className="mb-3 text-sm text-muted">Check each product page for other buying options.</p>
          {r.total === 0 ? (
            <div className="rounded-md border border-line p-8 text-center">
              <p className="text-lg font-bold">No results for {heading(q)}.</p>
              <p className="mt-2 text-sm text-muted">Try checking your spelling or use more general terms.</p>
              {activeFilters && (
                <Link href={href({ brand: null, rating: null, min: null, max: null, prime: null, deals: null })} className="link mt-3 inline-block text-sm">
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {r.results.map((p) => (
                <ResultCard key={p.id} p={p} now={now} />
              ))}
            </div>
          )}

          {r.pages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex justify-center">
              <ul className="flex overflow-hidden rounded-lg border border-line text-sm shadow-sm">
                <PageLink href={r.page > 1 ? href({ page: String(r.page - 1) }) : null}>‹ Previous</PageLink>
                {Array.from({ length: r.pages }, (_, i) => i + 1).map((n) => (
                  <PageLink key={n} href={n === r.page ? null : href({ page: String(n) })} current={n === r.page}>
                    {n}
                  </PageLink>
                ))}
                <PageLink href={r.page < r.pages ? href({ page: String(r.page + 1) }) : null}>Next ›</PageLink>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 font-bold">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Toggle({ on, href, children }: { on: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 hover:text-link-hover" aria-pressed={on}>
      <span className={`flex size-4 items-center justify-center rounded-sm border ${on ? "border-link bg-link text-white" : "border-[#888c8c] bg-white"}`}>
        {on && <Check size={12} strokeWidth={3} />}
      </span>
      <span>{children}</span>
    </Link>
  );
}

function PageLink({ href, children, current }: { href: string | null; children: React.ReactNode; current?: boolean }) {
  const cls = "block border-r border-line px-4 py-2.5 last:border-r-0";
  return (
    <li className="border-r border-line last:border-r-0">
      {href ? (
        <Link href={href} className={`${cls} hover:bg-[#f7fafa]`}>
          {children}
        </Link>
      ) : (
        <span className={`${cls} ${current ? "border border-ink font-bold" : "text-[#6f7373]"}`} aria-current={current ? "page" : undefined}>
          {children}
        </span>
      )}
    </li>
  );
}
