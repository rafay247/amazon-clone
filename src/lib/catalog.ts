import "server-only";
import productsJson from "@/data/products.json";
import departmentsJson from "@/data/departments.json";

export type Review = { rating: number; comment: string; date: string; name: string };

export type Product = {
  id: number;
  slug: string;
  title: string;
  description: string;
  brand: string | null;
  category: string;
  categoryName: string;
  department: string;
  price: number;
  listPrice: number | null;
  discount: number;
  rating: number;
  ratingCount: number;
  boughtPastMonth: number;
  stock: number;
  prime: boolean;
  images: string[];
  thumbnail: string;
  tags: string[];
  warranty: string;
  shipping: string;
  returnPolicy: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  reviews: Review[];
};

export type Department = { id: string; name: string; categories: { id: string; name: string }[] };

export const products = productsJson as Product[];
export const departments = departmentsJson as Department[];

const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: number) {
  return byId.get(id);
}

export function getDepartment(id: string) {
  return departments.find((d) => d.id === id);
}

export function categoryName(id: string) {
  for (const d of departments) {
    const c = d.categories.find((c) => c.id === id);
    if (c) return c.name;
  }
  return undefined;
}

export function inCategory(category: string, limit = 12) {
  return products.filter((p) => p.category === category).slice(0, limit);
}

export function inDepartment(department: string, limit = 12) {
  return products.filter((p) => p.department === department).slice(0, limit);
}

export function deals(limit = 20) {
  return products
    .filter((p) => p.discount >= 10)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit);
}

export function bestSellers(limit = 20) {
  return [...products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, limit);
}

export function related(p: Product, limit = 12) {
  const same = products.filter((x) => x.category === p.category && x.id !== p.id);
  const dept = products.filter(
    (x) => x.department === p.department && x.category !== p.category,
  );
  return [...same, ...dept].slice(0, limit);
}

// ---------- search ----------

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export type SearchParams = {
  k?: string;
  dept?: string;
  cat?: string;
  brand?: string[];
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  prime?: boolean;
  deals?: boolean;
  sort?: SortKey;
  page?: number;
};

export const PAGE_SIZE = 16;

function tokens(s: string) {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function haystack(p: Product) {
  return `${p.title} ${p.brand ?? ""} ${p.categoryName} ${p.category} ${p.tags.join(" ")} ${p.description}`.toLowerCase();
}

const stacks = new Map(products.map((p) => [p.id, haystack(p)]));

/** Relevance score: title matches weigh most, then brand/category/tags, then description. */
function score(p: Product, terms: string[]) {
  const title = p.title.toLowerCase();
  const meta = `${p.brand ?? ""} ${p.categoryName} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
  const all = stacks.get(p.id)!;
  let s = 0;
  for (const t of terms) {
    // Allow simple plurals: "phones" should hit "phone" and vice versa.
    const stem = t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t;
    if (title.includes(stem)) s += 10;
    else if (meta.includes(stem)) s += 5;
    else if (all.includes(stem)) s += 1;
    else return 0;
  }
  return s;
}

export function search(q: SearchParams) {
  const terms = q.k ? tokens(q.k) : [];
  let base = products
    .map((p) => ({ p, s: terms.length ? score(p, terms) : 1 }))
    .filter((x) => x.s > 0);

  if (q.dept) base = base.filter((x) => x.p.department === q.dept);
  if (q.cat) base = base.filter((x) => x.p.category === q.cat);

  // Facets are computed before the refinement filters so they stay useful.
  const facetBrands = new Map<string, number>();
  const facetCats = new Map<string, number>();
  for (const { p } of base) {
    if (p.brand) facetBrands.set(p.brand, (facetBrands.get(p.brand) ?? 0) + 1);
    facetCats.set(p.category, (facetCats.get(p.category) ?? 0) + 1);
  }

  let rows = base;
  if (q.brand?.length) rows = rows.filter((x) => x.p.brand && q.brand!.includes(x.p.brand));
  if (q.minRating) rows = rows.filter((x) => x.p.rating >= q.minRating!);
  if (q.minPrice != null) rows = rows.filter((x) => x.p.price >= q.minPrice!);
  if (q.maxPrice != null) rows = rows.filter((x) => x.p.price <= q.maxPrice!);
  if (q.prime) rows = rows.filter((x) => x.p.prime);
  if (q.deals) rows = rows.filter((x) => x.p.discount > 0);

  const sorted = rows.sort((a, b) => {
    switch (q.sort) {
      case "price-asc":
        return a.p.price - b.p.price;
      case "price-desc":
        return b.p.price - a.p.price;
      case "rating":
        return b.p.rating - a.p.rating || b.p.ratingCount - a.p.ratingCount;
      case "newest":
        return b.p.id - a.p.id;
      default:
        return b.s - a.s || b.p.ratingCount - a.p.ratingCount;
    }
  });

  const total = sorted.length;
  const page = Math.max(1, q.page ?? 1);
  return {
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    results: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((x) => x.p),
    brands: [...facetBrands.entries()].sort((a, b) => b[1] - a[1]).map(([b]) => b),
    categories: [...facetCats.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => ({ id, name: categoryName(id) ?? id })),
  };
}

/** Autocomplete: product titles plus category names that match the prefix/terms. */
export function suggest(q: string, limit = 10) {
  const terms = tokens(q);
  if (!terms.length) return [];
  const cats = departments
    .flatMap((d) => d.categories)
    .filter((c) => terms.every((t) => c.name.toLowerCase().includes(t)))
    .map((c) => ({ type: "category" as const, label: c.name.toLowerCase(), href: `/s?cat=${c.id}` }));
  const items = products
    .map((p) => ({ p, s: score(p, terms) }))
    .filter((x) => x.s >= terms.length * 5)
    .sort((a, b) => b.s - a.s || b.p.ratingCount - a.p.ratingCount)
    .map(({ p }) => ({
      type: "product" as const,
      label: p.title,
      image: p.thumbnail,
      href: `/dp/${p.id}/${p.slug}`,
    }));
  return [...cats, ...items].slice(0, limit);
}
