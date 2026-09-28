import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About this clone" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-8 text-[15px] leading-relaxed">
      <h1 className="text-3xl font-bold">About this clone</h1>
      <p className="mt-3">
        Amazon.clone is a 24-hour rebuild of the core amazon.com shopping loop, made for the 8x Software Engineer
        assignment. It is not affiliated with Amazon.com, Inc.; no real payments are taken and card numbers are never stored.
      </p>
      <h2 className="mt-6 text-xl font-bold">What works</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Search with autocomplete, department scoping, filters, sorting and pagination</li>
        <li>Product pages with gallery, buy box, related items and customer reviews</li>
        <li>Cart with a side drawer, quantity steppers and save for later, synced to your account</li>
        <li>Sign up / sign in, saved addresses, secure checkout, order history, cancel and buy again</li>
        <li>Verified-purchase reviews, wish list and browsing history</li>
      </ul>
      <h2 className="mt-6 text-xl font-bold">What was deliberately left out</h2>
      <p className="mt-2">
        Prime Video, Music, Alexa, sellers, gift cards, returns and real fulfilment. They are separate products; the
        time went into making the buying loop feel right.
      </p>
      <p className="mt-6">
        <Link href="https://github.com/rafay247/amazon-clone" className="link">
          Source code on GitHub
        </Link>
      </p>
    </div>
  );
}
