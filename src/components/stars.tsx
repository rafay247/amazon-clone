import { compact } from "@/lib/format";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

/**
 * Five stars with partial fill. The fill is a clipped overlay rather than an SVG
 * gradient: gradient ids repeat across a page, and Chrome drops the fill when the
 * first element with that id sits inside a hidden subtree.
 */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
            <StarSvg size={size} fill="#fff" />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <StarSvg size={size} fill="#ffa41c" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function StarSvg({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="block max-w-none">
      <path d={STAR} fill={fill} stroke="#de7921" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
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
