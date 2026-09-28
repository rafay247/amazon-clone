import type { Metadata } from "next";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { CartSync } from "@/components/cart-sync";

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
        {children}
        <CartSync userId={user?.id ?? null} />
      </body>
    </html>
  );
}
