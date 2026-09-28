import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { Assistant } from "@/components/assistant";
import { getSessionUser } from "@/lib/auth";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <>
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <Assistant />
    </>
  );
}
