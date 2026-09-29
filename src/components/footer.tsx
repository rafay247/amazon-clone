import Link from "next/link";
import { Logo } from "./logo";
import { BackToTop } from "./back-to-top";

const COLS = [
  {
    title: "Get to Know Us",
    links: [
      { href: "/about", label: "About Cartly" },
      { href: "https://github.com/rafay247/amazon-clone", label: "Source code" },
    ],
  },
  {
    title: "Shop with Us",
    links: [
      { href: "/deals", label: "Today's Deals" },
      { href: "/s?sort=rating", label: "Best Sellers" },
      { href: "/s?sort=newest", label: "New Releases" },
    ],
  },
  {
    title: "Your Account",
    links: [
      { href: "/account", label: "Your Account" },
      { href: "/orders", label: "Your Orders" },
      { href: "/lists", label: "Your Lists" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { href: "/orders", label: "Returns & Replacements" },
      { href: "/account/addresses", label: "Manage Addresses" },
      { href: "/history", label: "Browsing History" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto text-white">
      <BackToTop />
      <div className="bg-nav-2 px-6 py-10">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-8 md:grid-cols-4">
          {COLS.map((c) => (
            <div key={c.title}>
              <h3 className="mb-2 font-bold">{c.title}</h3>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-[#ddd] hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-[#3a4553] bg-nav-2 py-8">
        <Logo />
      </div>
      <div className="bg-nav px-4 py-6 text-center text-xs text-[#ddd]">
        Cartly is a portfolio demo store built for the 8x assignment. No real payments are taken.
        <br />
        Product data from DummyJSON. No real payments are taken.
      </div>
    </footer>
  );
}
