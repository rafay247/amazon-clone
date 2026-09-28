import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listAddresses } from "@/lib/account-actions";
import { Checkout } from "./checkout";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const addresses = await listAddresses();
  return <Checkout addresses={addresses} userName={user!.name} />;
}
