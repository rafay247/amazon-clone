"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { getSessionUser } from "./auth";
import { getProduct } from "./catalog";

export type ReviewState = { error?: string; ok?: boolean } | undefined;

export async function submitReview(_: ReviewState, form: FormData): Promise<ReviewState> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };
  const product = getProduct(Number(form.get("product_id")));
  if (!product) return { error: "Product not found." };
  const rating = Number(form.get("rating"));
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (!(rating >= 1 && rating <= 5)) return { error: "Please select a star rating." };
  if (!title) return { error: "Please add a headline." };
  if (body.length < 10) return { error: "Please write at least a sentence (10+ characters)." };
  if (title.length > 120 || body.length > 5000) return { error: "That review is too long." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_review", { p_product: product.id, p_rating: rating, p_title: title, p_body: body });
  if (error) return { error: error.message };
  revalidatePath(`/dp/${product.id}`, "layout");
  return { ok: true };
}

export async function deleteReview(productId: number) {
  const user = await getSessionUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("product_id", productId).eq("user_id", user.id);
  revalidatePath(`/dp/${productId}`, "layout");
}
