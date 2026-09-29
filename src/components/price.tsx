import { money, splitPrice } from "@/lib/format";

/** Price: superscript $ and cents. */
export function Price({ value, size = "md", className = "" }: { value: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const { whole, cents } = splitPrice(value);
  const big = { sm: "text-lg", md: "text-[28px]", lg: "text-[28px]" }[size];
  return (
    <span className={`inline-flex items-start leading-none ${className}`} aria-label={money(value)}>
      <span className="mt-[3px] text-xs">$</span>
      <span className={big}>{whole}</span>
      <span className="mt-[3px] text-xs">{cents}</span>
    </span>
  );
}

export function PrimeBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center text-[13px] font-bold italic text-prime ${className}`}>
      <span className="mr-0.5 not-italic text-orange">✓</span>express
    </span>
  );
}

export function ListPrice({ value }: { value: number }) {
  return (
    <span className="text-xs text-muted">
      List: <span className="line-through">{money(value)}</span>
    </span>
  );
}
