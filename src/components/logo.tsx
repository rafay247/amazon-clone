import Link from "next/link";

/** Wordmark with the smile arrow. Marked "clone" so it's never mistaken for the real site. */
export function Logo({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Home"
      className={`nav-hover flex shrink-0 items-start px-1.5 pt-1.5 pb-1 ${className}`}
    >
      <span className="relative inline-block leading-none">
        <span
          className={`text-[26px] font-bold tracking-[-1px] ${dark ? "text-ink" : "text-white"}`}
        >
          amazon
        </span>
        <svg
          viewBox="0 0 100 18"
          className="absolute -bottom-[7px] left-[2px] h-[11px] w-[80px]"
          aria-hidden
        >
          <path d="M2 4 Q50 22 92 5" stroke="#ff9900" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M84 1 L95 4.5 L88 12" stroke="#ff9900" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={`ml-0.5 text-[11px] ${dark ? "text-muted" : "text-[#ccc]"}`}>.clone</span>
    </Link>
  );
}
