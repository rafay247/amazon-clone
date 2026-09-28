import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Amazon.clone: Online Shopping for Electronics, Fashion, Home & more",
    template: "%s · Amazon.clone",
  },
  description: "A working rebuild of the amazon.com shopping experience.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
