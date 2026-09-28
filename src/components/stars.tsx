import { compact } from "@/lib/format";

/** Five stars with partial fill. */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`s${i}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="#ffa41c" />
                <stop offset={`${fill * 100}%`} stopColor="#fff" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
              fill={`url(#s${i}-${Math.round(fill * 100)})`}
              stroke="#de7921"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}

export function RatingLine({ rating, count, href }: { rating: number; count: number; href?: string }) {
  return (
    <span className="flex items-center gap-1 text-sm">
      <span>{rating.toFixed(1)}</span>
      <Stars rating={rating} />
      {href ? (
        <a href={href} className="link">
          ({compact(count)})
        </a>
      ) : (
        <span className="text-link">({compact(count)})</span>
      )}
    </span>
  );
}
