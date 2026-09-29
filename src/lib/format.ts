const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function money(n: number) {
  return usd.format(n);
}

export function splitPrice(n: number) {
  const [whole, cents] = n.toFixed(2).split(".");
  return { whole: Number(whole).toLocaleString("en-US"), cents };
}

export function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n);
}

/** Estimated delivery: Express next day, otherwise 4-6 days out. */
export function deliveryDate(prime: boolean, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + (prime ? 1 : 5));
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function productHref(p: { id: number; slug: string }) {
  return `/dp/${p.id}/${p.slug}`;
}
