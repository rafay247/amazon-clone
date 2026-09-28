import Link from "next/link";
import { Lock } from "lucide-react";
import { Logo } from "@/components/logo";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <header className="flex h-[60px] items-center justify-between bg-nav px-4 text-white">
        <Logo />
        <h1 className="flex items-center gap-1.5 text-base sm:gap-2 sm:text-2xl">
          Secure checkout <Lock size={16} className="text-[#999]" />
        </h1>
        <Link href="/cart" className="nav-hover px-2 py-1 text-sm">
          Cart
        </Link>
      </header>
      <main className="flex-1 bg-[#f7f7f7]">{children}</main>
      <footer className="bg-nav-2 py-5 text-center text-xs text-[#ddd]">
        A portfolio rebuild. No real payments are taken, and cards are never stored.
      </footer>
    </div>
  );
}
