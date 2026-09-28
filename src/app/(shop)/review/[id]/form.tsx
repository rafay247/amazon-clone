"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitReview } from "@/lib/review-actions";

const LABELS = ["", "I hate it", "I don't like it", "It's okay", "I like it", "I love it"];

export function ReviewForm({
  productId,
  href,
  existing,
  reviewer,
}: {
  productId: number;
  href: string;
  existing: { rating: number; title: string; body: string } | null;
  reviewer: string;
}) {
  const [state, action, pending] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);

  if (state?.ok) {
    return (
      <div className="mt-6 rounded-lg border border-success/40 bg-[#f3faf3] p-5">
        <p className="flex items-center gap-2 text-lg font-bold text-success">
          <CheckCircle2 /> Review submitted - thank you!
        </p>
        <p className="mt-1 text-sm">It&apos;s now live on the product page.</p>
        <Link href={`${href}#reviews`} className="btn-yellow mt-3 inline-block">
          See your review
        </Link>
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <form action={action} className="space-y-6 py-5">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <fieldset>
        <legend className="text-lg font-bold">Overall rating</legend>
        <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
                  fill={n <= shown ? "#ffa41c" : "#fff"}
                  stroke="#de7921"
                  strokeWidth="1"
                />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-muted">{LABELS[shown]}</span>
        </div>
      </fieldset>
      <label className="block">
        <span className="text-lg font-bold">Add a headline</span>
        <input name="title" required maxLength={120} defaultValue={existing?.title} placeholder="What's most important to know?" className="input mt-2" />
      </label>
      <label className="block">
        <span className="text-lg font-bold">Add a written review</span>
        <textarea
          name="body"
          required
          rows={6}
          maxLength={5000}
          defaultValue={existing?.body}
          placeholder="What did you like or dislike? What did you use this product for?"
          className="input mt-2"
        />
      </label>
      <p className="text-sm text-muted">
        Posting publicly as <b className="text-ink">{reviewer}</b>. Reviews on items you&apos;ve ordered are marked Verified Purchase.
      </p>
      {state?.error && (
        <p role="alert" className="text-sm text-deal">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <button className="btn-yellow" disabled={pending}>
          {pending ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
