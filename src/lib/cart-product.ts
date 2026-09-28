import type { Product } from "./catalog";
import type { CartProduct } from "./cart-store";

/** The slice of a product the client cart keeps, so the catalog never ships to the browser. */
export function toCartProduct(p: Product): CartProduct {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    listPrice: p.listPrice,
    image: p.thumbnail,
    prime: p.prime,
    stock: p.stock,
  };
}
