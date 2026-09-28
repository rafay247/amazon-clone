import { CircleUserRound } from "lucide-react";
import type { Review } from "@/lib/catalog";
import { Stars } from "./stars";

/** Star distribution derived from the average, so histogram and average agree. */
export function distribution(avg: number) {
  const w = [1, 2, 3, 4, 5].map((s) => Math.exp(-((s - avg - 0.35) ** 2) / 1.1) + (s === 1 ? 0.04 : 0));
  const total = w.reduce((a, b) => a + b, 0);
  const pct = w.map((x) => Math.round((x / total) * 100));
  pct[4] += 100 - pct.reduce((a, b) => a + b, 0);
  return pct.reverse(); // index 0 = 5 stars
}

export function RatingHistogram({ rating, count }: { rating: number; count: number }) {
  const dist = distribution(rating);
  return (
    <div>
      <h2 className="text-2xl font-bold">Customer reviews</h2>
      <div className="mt-2 flex items-center gap-2">
        <Stars rating={rating} size={20} />
        <span className="text-lg">{rating.toFixed(1)} out of 5</span>
      </div>
      <p className="mt-1 text-sm text-muted">{count.toLocaleString("en-US")} global ratings</p>
      <table className="mt-4 w-full text-sm">
        <tbody>
          {dist.map((p, i) => (
            <tr key={i}>
              <td className="w-14 py-1.5 whitespace-nowrap text-link">{5 - i} star</td>
              <td className="px-2">
                <div className="h-5 overflow-hidden rounded border border-[#e3e6e6] bg-[#f0f2f2] shadow-inner">
                  <div className="h-full bg-orange" style={{ width: `${p}%` }} />
                </div>
              </td>
              <td className="w-10 text-right text-link">{p}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: (Review & { title?: string; verified?: boolean })[] }) {
  if (!reviews.length) return <p className="text-sm text-muted">No written reviews yet.</p>;
  return (
    <ul className="space-y-6">
      {reviews.map((r, i) => (
        <li key={i}>
          <div className="flex items-center gap-2 text-sm">
            <CircleUserRound size={32} strokeWidth={1.2} className="text-[#999]" />
            {r.name}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Stars rating={r.rating} size={16} />
            {r.title && <b className="text-sm">{r.title}</b>}
          </div>
          <p className="mt-1 text-sm text-muted">
            Reviewed on {new Date(r.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          {r.verified !== false && <p className="text-xs font-bold text-[#c45500]">Verified Purchase</p>}
          <p className="mt-1.5 text-sm">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
