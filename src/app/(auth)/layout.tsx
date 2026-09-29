import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <div className="flex justify-center pt-4 pb-2">
        <Logo dark />
      </div>
      <main className="flex flex-1 justify-center px-4 pb-10">{children}</main>
      <footer className="border-t border-line bg-gradient-to-b from-[#f6f6f6] to-white py-6 text-center text-xs">
        <div className="space-x-5">
          <Link href="/" className="link">
            Home
          </Link>
          <Link href="/about" className="link">
            About Cartly
          </Link>
        </div>
        <p className="mt-2 text-muted">A portfolio demo store. No real payments are taken.</p>
      </footer>
    </div>
  );
}
