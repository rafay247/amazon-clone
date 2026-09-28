import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listAddresses } from "@/lib/account-actions";
import { AddressBook } from "./address-book";

export const metadata: Metadata = { title: "Your Addresses" };

export default async function AddressesPage() {
  const user = (await requireUser("/account/addresses"))!;
  const addresses = await listAddresses();
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-4">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/account" className="link">
          Your Account
        </Link>{" "}
        › <span className="text-[#c45500]">Your Addresses</span>
      </nav>
      <h1 className="mt-2 text-[28px]">Your Addresses</h1>
      <AddressBook addresses={addresses} userName={user.name} />
    </div>
  );
}
