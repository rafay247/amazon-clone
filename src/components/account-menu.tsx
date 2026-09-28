"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SessionUser } from "@/lib/types";

const LIST_LINKS = [
  { href: "/lists", label: "Your Wish List" },
  { href: "/lists", label: "Create a List" },
];
const ACCOUNT_LINKS = [
  { href: "/account", label: "Account" },
  { href: "/orders", label: "Orders" },
  { href: "/orders?tab=buy-again", label: "Buy Again" },
  { href: "/history", label: "Browsing History" },
  { href: "/account/addresses", label: "Your Addresses" },
  { href: "/lists", label: "Your Lists" },
];

export function AccountMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const first = user?.name.split(" ")[0];

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={user ? "/account" : "/signin"}
        className="nav-hover block px-1.5 py-1.5 leading-tight"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
      >
        <span className="block text-xs text-white">Hello, {first ?? "sign in"}</span>
        <span className="flex items-center gap-0.5 text-sm font-bold text-white">
          Account &amp; Lists <ChevronDown size={12} className="text-[#a7acb2]" />
        </span>
      </Link>

      {open && (
        <>
          <div className="fixed inset-0 top-[60px] z-30 bg-black/50" aria-hidden />
          <div className="absolute top-full right-[-60px] z-50 w-[480px] rounded-sm bg-white p-5 text-ink shadow-xl">
            <span className="absolute -top-2 right-[100px] size-4 rotate-45 bg-white" aria-hidden />
            {user ? (
              <div className="mb-4 flex items-center justify-between rounded-md bg-[#eaf4f4] px-4 py-3">
                <div>
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <form action="/auth/signout" method="post">
                  <button className="link text-sm">Sign Out</button>
                </form>
              </div>
            ) : (
              <div className="mb-4 border-b border-line pb-4 text-center">
                <Link href="/signin" className="btn-yellow inline-block w-56 !rounded-md">
                  Sign in
                </Link>
                <p className="mt-2 text-xs">
                  New customer?{" "}
                  <Link href="/register" className="link">
                    Start here.
                  </Link>
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <MenuCol title="Your Lists" links={LIST_LINKS} />
              <MenuCol title="Your Account" links={ACCOUNT_LINKS} border />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuCol({ title, links, border }: { title: string; links: { href: string; label: string }[]; border?: boolean }) {
  return (
    <div className={border ? "border-l border-line pl-6" : ""}>
      <p className="mb-2 font-bold">{title}</p>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-[13px] text-[#444] hover:text-link-hover hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
