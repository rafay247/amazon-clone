import Link from "next/link";
import { Suspense } from "react";
import { departments } from "@/lib/catalog";
import type { SessionUser } from "@/lib/types";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { DeliverToButton } from "./deliver-to";
import { AccountMenu } from "./account-menu";
import { CartLink } from "./cart-link";
import { SideMenu } from "./side-menu";

const NAV = [
  { href: "/deals", label: "Today's Deals" },
  { href: "/orders?tab=buy-again", label: "Buy Again" },
  { href: "/s?sort=rating", label: "Best Sellers" },
  { href: "/s?sort=newest", label: "New Releases" },
  { href: "/s?dept=electronics", label: "Electronics" },
  { href: "/s?dept=fashion", label: "Fashion" },
  { href: "/s?dept=home-kitchen", label: "Home & Kitchen" },
  { href: "/s?dept=beauty", label: "Beauty" },
  { href: "/s?dept=grocery", label: "Grocery" },
  { href: "/s?dept=sports", label: "Sports & Outdoors" },
  { href: "/history", label: "Browsing History" },
];

export function Header({ user }: { user: SessionUser }) {
  const depts = departments.map(({ id, name }) => ({ id, name }));
  return (
    <header className="sticky top-0 z-40 md:static">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 bg-nav px-2 pt-1.5 pb-2 text-white sm:gap-x-2 md:h-[60px] md:flex-nowrap md:py-0">
        <Logo />
        <DeliverToButton />
        <div className="flex-1 md:hidden" />
        {/* Below md the search box takes its own full-width row. */}
        <div className="order-last flex min-w-0 basis-full md:order-none md:basis-auto md:flex-1">
          <Suspense fallback={<div className="h-10 flex-1 rounded-md bg-white" />}>
            <SearchBar departments={depts} />
          </Suspense>
        </div>
        <AccountMenu user={user} />
        <Link href="/orders" className="nav-hover hidden shrink-0 px-1.5 py-1.5 leading-tight md:block">
          <span className="block text-xs">Returns</span>
          <span className="block text-sm font-bold">&amp; Orders</span>
        </Link>
        <Link
          href={user ? "/account" : "/signin"}
          className="nav-hover shrink-0 px-1.5 py-1 text-xs md:hidden"
        >
          {user ? user.name.split(" ")[0] : "Sign in"} ›
        </Link>
        <CartLink />
      </div>
      <nav
        aria-label="Shortcuts"
        className="no-scrollbar flex h-[39px] items-center gap-0.5 overflow-x-auto bg-nav-2 px-2 text-sm whitespace-nowrap text-white"
      >
        <SideMenu departments={departments} user={user} />
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} className="nav-hover px-2 py-1">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
