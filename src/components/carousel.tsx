"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horizontal scroller with Amazon's side paddles. */
export function Carousel({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className="group relative">
      <div ref={ref} role="list" aria-label={label} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth">
        {children}
      </div>
      <Paddle side="left" onClick={() => scroll(-1)} />
      <Paddle side="right" onClick={() => scroll(1)} />
    </div>
  );
}

function Paddle({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={`absolute top-[60px] ${side === "left" ? "left-0 rounded-r-md" : "right-0 rounded-l-md"} hidden h-[90px] w-11 items-center justify-center border border-[#d5d9d9] bg-white/95 shadow-md group-hover:flex`}
    >
      <Icon size={28} />
    </button>
  );
}
