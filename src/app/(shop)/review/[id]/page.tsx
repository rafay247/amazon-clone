import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { productHref } from "@/lib/format";
import { ReviewForm } from "./form";

export const metadata: Metadata = { title: "Create Review" };

export default async function ReviewPage({ params }: PageProps<"/review/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/review/${id}`);
  const p = getProduct(Number(id));
  if (!p) notFound();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("reviews")
    .select("rating, title, body")
    .eq("product_id", p.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-[700px] px-4 py-6">
      <h1 className="text-[28px] font-bold">{existing ? "Edit your review" : "Create Review"}</h1>
      <Link href={productHref(p)} className="mt-3 flex items-center gap-4 border-b border-line pb-5">
        <Image src={p.thumbnail} alt="" width={64} height={64} className="size-16 object-contain" />
        <span className="text-sm hover:text-link-hover">{p.title}</span>
      </Link>
      <ReviewForm productId={p.id} href={productHref(p)} existing={existing} reviewer={user!.name} />
    </div>
  );
}
