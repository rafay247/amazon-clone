"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CircleUserRound, Menu, X } from "lucide-react";
import type { SessionUser } from "@/lib/types";

type Dept = { id: string; name: string; categories: { id: string; name: string }[] };

export function SideMenu({ departments, user }: { departments: Dept[]; user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const [dept, setDept] = useState<Dept | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setDept(null);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="nav-hover flex items-center gap-1 px-2 py-1 font-bold">
        <Menu size={20} /> All
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={close} aria-hidden />
          <nav
            aria-label="All categories"
            className="relative flex h-full w-[365px] max-w-[85vw] flex-col bg-white text-ink shadow-xl"
          >
            <Link
              href={user ? "/account" : "/signin"}
              onClick={close}
              className="flex items-center gap-3 bg-nav-2 px-8 py-3 text-lg font-bold text-white"
            >
              <CircleUserRound size={28} /> Hello, {user ? user.name.split(" ")[0] : "sign in"}
            </Link>
            <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
              <div className={`transition-transform duration-300 ${dept ? "-translate-x-full" : ""}`}>
                <Section title="Trending">
                  <Item href="/s?sort=rating" onClick={close}>Best Sellers</Item>
                  <Item href="/s?sort=newest" onClick={close}>New Releases</Item>
                  <Item href="/deals" onClick={close}>Today&apos;s Deals</Item>
                </Section>
                <Section title="Shop by Department">
                  {departments.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDept(d)}
                      className="flex w-full items-center justify-between py-3 pr-5 pl-9 text-left text-sm hover:bg-[#eaeded]"
                    >
                      {d.name} <ChevronRight size={18} className="text-muted" />
                    </button>
                  ))}
                </Section>
                <Section title="Help & Settings" last>
                  <Item href="/account" onClick={close}>Your Account</Item>
                  <Item href="/orders" onClick={close}>Your Orders</Item>
                  {user ? (
                    <form action="/auth/signout" method="post">
                      <button className="w-full py-3 pl-9 text-left text-sm hover:bg-[#eaeded]">Sign Out</button>
                    </form>
                  ) : (
                    <Item href="/signin" onClick={close}>Sign in</Item>
                  )}
                </Section>
              </div>
              {dept && (
                <div className="absolute inset-0 animate-[slidein_.3s_ease]">
                  <button
                    onClick={() => setDept(null)}
                    className="flex w-full items-center gap-2 border-b border-line px-8 py-3 text-sm font-bold hover:bg-[#eaeded]"
                  >
                    <ChevronLeft size={18} /> MAIN MENU
                  </button>
                  <Section title={dept.name}>
                    <Item href={`/s?dept=${dept.id}`} onClick={close}>
                      All {dept.name}
                    </Item>
                    {dept.categories.map((c) => (
                      <Item key={c.id} href={`/s?cat=${c.id}`} onClick={close}>
                        {c.name}
                      </Item>
                    ))}
                  </Section>
                </div>
              )}
            </div>
          </nav>
          <button
            onClick={close}
            aria-label="Close menu"
            className="absolute top-3 left-[min(375px,calc(85vw+10px))] text-white"
          >
            <X size={30} />
          </button>
        </div>
      )}
    </>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`py-2 ${last ? "" : "border-b border-line"}`}>
      <h3 className="px-9 pt-3 pb-2 text-lg font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Item({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block py-3 pl-9 text-sm hover:bg-[#eaeded]">
      {children}
    </Link>
  );
}
