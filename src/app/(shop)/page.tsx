import Image from "next/image";
import Link from "next/link";
import { Hero, type Slide } from "@/components/hero";
import { Carousel } from "@/components/carousel";
import { DealCard, MiniCard } from "@/components/product-card";
import { BrowsingHistoryRow } from "@/components/browsing-history";
import { bestSellers, deals, inCategory, inDepartment, products, type Product } from "@/lib/catalog";

const pick = (cat: string, n = 3) => inCategory(cat, n).map((p) => p.thumbnail);

const SLIDES: Slide[] = [
  {
    title: "Tech that keeps up",
    subtitle: "Phones, laptops and accessories, with Prime delivery tomorrow.",
    cta: "Shop electronics",
    href: "/s?dept=electronics",
    bg: "linear-gradient(120deg,#0f2b46 0%,#1b5e8c 55%,#37a0c9 100%)",
    images: [...pick("smartphones", 1), ...pick("laptops", 1), ...pick("tablets", 1)],
  },
  {
    title: "Kitchen must-haves",
    subtitle: "Cookware, gadgets and everything in between, from $4.99.",
    cta: "Shop kitchen",
    href: "/s?cat=kitchen-accessories",
    bg: "linear-gradient(120deg,#7a3b12 0%,#c46a2b 55%,#f0a868 100%)",
    images: pick("kitchen-accessories", 3),
  },
  {
    title: "Big deals, every day",
    subtitle: "Up to 20% off top-rated picks across every department.",
    cta: "See today's deals",
    href: "/deals",
    bg: "linear-gradient(120deg,#5b0e2d 0%,#a61e4d 55%,#e8588a 100%)",
    images: deals(3).map((p) => p.thumbnail),
  },
  {
    title: "Refresh your style",
    subtitle: "New season shoes, bags and watches.",
    cta: "Shop fashion",
    href: "/s?dept=fashion",
    bg: "linear-gradient(120deg,#23364a 0%,#4f6d7a 55%,#9fb8ad 100%)",
    images: [...pick("womens-bags", 1), ...pick("mens-shoes", 1), ...pick("womens-watches", 1)],
  },
];

type Grid = { title: string; href: string; link: string; items: { label: string; p: Product; href: string }[] };

function gridFor(title: string, cats: string[], link = "Shop now"): Grid {
  return {
    title,
    link,
    href: `/s?cat=${cats[0]}`,
    items: cats.map((c) => {
      const p = inCategory(c, 1)[0];
      return { label: p.categoryName, p, href: `/s?cat=${c}` };
    }),
  };
}

export default function Home() {
  const grids: Grid[] = [
    gridFor("Upgrade your tech", ["smartphones", "laptops", "tablets", "mobile-accessories"], "Shop electronics"),
    gridFor("Fashion finds for everyone", ["womens-dresses", "mens-shirts", "womens-shoes", "sunglasses"], "Discover more"),
    gridFor("Make your home feel new", ["furniture", "home-decoration", "kitchen-accessories", "groceries"]),
    gridFor("Beauty & self-care", ["beauty", "fragrances", "skin-care", "womens-jewellery"], "Shop beauty"),
  ];
  const grids2: Grid[] = [
    gridFor("Watches for every wrist", ["mens-watches", "womens-watches", "womens-jewellery", "sunglasses"]),
    gridFor("Get game-ready", ["sports-accessories", "mens-shoes", "tops", "groceries"], "Shop sports"),
    gridFor("On the road", ["vehicle", "motorcycle", "mobile-accessories", "sunglasses"], "Explore automotive"),
    gridFor("Bags & accessories", ["womens-bags", "womens-jewellery", "sunglasses", "womens-watches"]),
  ];

  return (
    <div className="bg-page pb-8">
      <div className="mx-auto max-w-[1500px]">
        <Hero slides={SLIDES} />
        <div className="relative z-10 -mt-16 space-y-5 px-4 sm:-mt-28 md:-mt-[340px] md:px-5">
          <GridRow grids={grids} />
          <Row title="Today's Deals" href="/deals" link="See all deals">
            <Carousel label="Today's deals">
              {deals(20).map((p) => (
                <DealCard key={p.id} p={p} />
              ))}
            </Carousel>
          </Row>
          <Row title="Best Sellers in Electronics" href="/s?dept=electronics&sort=rating">
            <Carousel label="Best sellers in electronics">
              {inDepartment("electronics", 20)
                .sort((a, b) => b.ratingCount - a.ratingCount)
                .map((p) => (
                  <MiniCard key={p.id} p={p} />
                ))}
            </Carousel>
          </Row>
          <GridRow grids={grids2} />
          <BrowsingHistoryRow />
          <Row title="Customers' most-loved" href="/s?sort=rating">
            <Carousel label="Most loved">
              {bestSellers(20).map((p) => (
                <MiniCard key={p.id} p={p} />
              ))}
            </Carousel>
          </Row>
          <Row title="Top picks in Kitchen & Dining" href="/s?cat=kitchen-accessories">
            <Carousel label="Kitchen picks">
              {inCategory("kitchen-accessories", 20).map((p) => (
                <MiniCard key={p.id} p={p} />
              ))}
            </Carousel>
          </Row>
          <Row title="Fresh groceries, delivered" href="/s?dept=grocery">
            <Carousel label="Groceries">
              {products
                .filter((p) => p.department === "grocery")
                .map((p) => (
                  <MiniCard key={p.id} p={p} />
                ))}
            </Carousel>
          </Row>
        </div>
      </div>
    </div>
  );
}

function GridRow({ grids }: { grids: Grid[] }) {
  return (
    // Phones: a swipeable strip of cards instead of four full-screen cards stacked.
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {grids.map((g) => (
        <section key={g.title} className="flex w-[78%] shrink-0 snap-center flex-col bg-white p-4 sm:w-auto sm:p-5">
          <h2 className="mb-3 text-xl leading-tight font-bold">{g.title}</h2>
          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
            {g.items.map((it) => (
              <Link key={it.label} href={it.href} className="group">
                <div className="flex aspect-square items-center justify-center bg-[#f7f7f7] p-2">
                  <Image
                    src={it.p.thumbnail}
                    alt=""
                    width={130}
                    height={130}
                    className="max-h-full w-auto object-contain mix-blend-multiply"
                  />
                </div>
                <p className="mt-1 text-xs group-hover:text-link-hover">{it.label}</p>
              </Link>
            ))}
          </div>
          <Link href={g.href} className="link mt-4 text-[13px]">
            {g.link}
          </Link>
        </section>
      ))}
    </div>
  );
}

function Row({ title, href, link = "See more", children }: { title: string; href: string; link?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white px-5 pt-5 pb-4">
      <div className="mb-3 flex items-baseline gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={href} className="link text-sm">
          {link}
        </Link>
      </div>
      {children}
    </section>
  );
}

