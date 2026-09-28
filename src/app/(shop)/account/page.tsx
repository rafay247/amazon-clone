import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Heart, LogOut, MapPin, Package, RotateCcw, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Your Account" };

const CARDS = [
  { href: "/orders", icon: Package, title: "Your Orders", text: "Track, cancel an order, or buy again" },
  { href: "/account/addresses", icon: MapPin, title: "Your Addresses", text: "Edit, remove or set default address" },
  { href: "/lists", icon: Heart, title: "Your Lists", text: "View and manage your Wish List" },
  { href: "/orders?tab=buy-again", icon: RotateCcw, title: "Buy Again", text: "Reorder items you've bought before" },
  { href: "/history", icon: Clock, title: "Browsing History", text: "Pick up where you left off" },
];

export default async function AccountPage() {
  const user = (await requireUser("/account"))!;
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <h1 className="text-[28px]">Your Account</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="flex gap-4 rounded-lg border border-line p-4 hover:bg-[#f7fafa]">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#e6f4f7] text-link">
              <Icon size={26} />
            </span>
            <span>
              <span className="block text-lg">{title}</span>
              <span className="block text-sm text-muted">{text}</span>
            </span>
          </Link>
        ))}
        <div className="flex gap-4 rounded-lg border border-line p-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#e6f4f7] text-link">
            <ShieldCheck size={26} />
          </span>
          <span className="min-w-0">
            <span className="block text-lg">Login &amp; security</span>
            <span className="block truncate text-sm text-muted">{user.name}</span>
            <span className="block truncate text-sm text-muted">{user.email}</span>
          </span>
        </div>
      </div>
      <form action="/auth/signout" method="post" className="mt-6">
        <button className="btn-outline inline-flex items-center gap-2">
          <LogOut size={15} /> Sign out
        </button>
      </form>
    </div>
  );
}
