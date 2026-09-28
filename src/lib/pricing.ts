// Shared by the checkout UI (display) and the server (authoritative).
export const FREE_SHIPPING_MIN = 35;
export const SHIPPING_FEE = 5.99;
export const TAX_RATE = 0.0825;

const round = (n: number) => Math.round(n * 100) / 100;

export function totals(lines: { price: number; qty: number }[]) {
  const subtotal = round(lines.reduce((n, l) => n + l.price * l.qty, 0));
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const tax = round((subtotal + shipping) * TAX_RATE);
  return { subtotal, shipping, tax, total: round(subtotal + shipping + tax) };
}

/** All-Prime orders arrive tomorrow; anything else in five days. */
export function orderDelivery(lines: { prime: boolean }[], from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + (lines.every((l) => l.prime) ? 1 : 5));
  return d;
}

export function cardBrand(num: string) {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^6(011|5)/.test(n)) return "Discover";
  return "Card";
}

export function luhn(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length < 12 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let x = Number(d[d.length - 1 - i]);
    if (i % 2) {
      x *= 2;
      if (x > 9) x -= 9;
    }
    sum += x;
  }
  return sum % 10 === 0;
}
