import { getProduct } from "@/lib/catalog";
import { toCartProduct } from "@/lib/cart-product";

/** Card data for a handful of products by id: GET /api/products?ids=1,2,3 */
export function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter(Number.isInteger)
    .slice(0, 12);
  const items = ids
    .map(getProduct)
    .filter((p) => !!p)
    .map((p) => ({ ...toCartProduct(p), rating: p.rating, ratingCount: p.ratingCount }));
  return Response.json(items, { headers: { "Cache-Control": "public, max-age=3600" } });
}
