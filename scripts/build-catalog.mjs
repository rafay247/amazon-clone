// Builds src/data/products.json from DummyJSON.
// Usage: node scripts/build-catalog.mjs
// Derived fields (list price, rating counts, Prime, "bought in past month") are
// deterministic per product id so the catalog is stable across rebuilds.
import { writeFileSync, mkdirSync } from "node:fs";

const DEPARTMENTS = {
  electronics: { name: "Electronics", categories: ["smartphones", "laptops", "tablets", "mobile-accessories"] },
  fashion: {
    name: "Fashion",
    categories: [
      "mens-shirts", "mens-shoes", "mens-watches", "womens-dresses", "womens-shoes",
      "womens-bags", "womens-jewellery", "womens-watches", "tops", "sunglasses",
    ],
  },
  "home-kitchen": { name: "Home & Kitchen", categories: ["kitchen-accessories", "furniture", "home-decoration"] },
  beauty: { name: "Beauty & Personal Care", categories: ["beauty", "fragrances", "skin-care"] },
  grocery: { name: "Grocery", categories: ["groceries"] },
  sports: { name: "Sports & Outdoors", categories: ["sports-accessories"] },
  automotive: { name: "Automotive", categories: ["motorcycle", "vehicle"] },
};

const CATEGORY_NAMES = {
  smartphones: "Cell Phones", laptops: "Laptops", tablets: "Tablets",
  "mobile-accessories": "Phone Accessories", "mens-shirts": "Men's Shirts",
  "mens-shoes": "Men's Shoes", "mens-watches": "Men's Watches",
  "womens-dresses": "Women's Dresses", "womens-shoes": "Women's Shoes",
  "womens-bags": "Handbags", "womens-jewellery": "Jewelry",
  "womens-watches": "Women's Watches", tops: "Women's Tops", sunglasses: "Sunglasses",
  "kitchen-accessories": "Kitchen & Dining", furniture: "Furniture",
  "home-decoration": "Home Décor", beauty: "Makeup", fragrances: "Fragrances",
  "skin-care": "Skin Care", groceries: "Grocery", "sports-accessories": "Sports Equipment",
  motorcycle: "Motorcycles", vehicle: "Cars",
};

// mulberry32: tiny seeded PRNG
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const departmentOf = Object.fromEntries(
  Object.entries(DEPARTMENTS).flatMap(([id, d]) => d.categories.map((c) => [c, id])),
);

const res = await fetch("https://dummyjson.com/products?limit=0");
const { products } = await res.json();

const out = products.map((p) => {
  const r = rng(p.id * 7919);
  const discount = r() < 0.55 ? Math.round(p.discountPercentage) : 0;
  const listPrice = discount ? Math.round((p.price / (1 - discount / 100)) * 100) / 100 : null;
  const ratingCount = Math.round(40 + r() ** 3 * 60000);
  const bought = r() < 0.6 ? [50, 100, 200, 300, 500, 1000, 2000, 5000, 10000][Math.floor(r() * 9)] : 0;
  return {
    id: p.id,
    slug: slugify(p.title),
    title: p.title,
    description: p.description,
    brand: p.brand ?? null,
    category: p.category,
    categoryName: CATEGORY_NAMES[p.category] ?? p.category,
    department: departmentOf[p.category],
    price: p.price,
    listPrice,
    discount,
    rating: Math.round(p.rating * 10) / 10,
    ratingCount,
    boughtPastMonth: bought,
    stock: p.stock,
    prime: r() < 0.7,
    images: p.images,
    thumbnail: p.thumbnail,
    tags: p.tags,
    warranty: p.warrantyInformation,
    shipping: p.shippingInformation,
    returnPolicy: p.returnPolicy,
    sku: p.sku,
    weight: p.weight,
    dimensions: p.dimensions,
    reviews: p.reviews.map((rv) => ({
      rating: rv.rating,
      comment: rv.comment,
      date: rv.date,
      name: rv.reviewerName,
    })),
  };
});

mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/products.json", JSON.stringify(out));
writeFileSync(
  "src/data/departments.json",
  JSON.stringify(
    Object.entries(DEPARTMENTS).map(([id, d]) => ({
      id,
      name: d.name,
      categories: d.categories.map((c) => ({ id: c, name: CATEGORY_NAMES[c] })),
    })),
    null,
    2,
  ),
);
console.log(`wrote ${out.length} products`);
