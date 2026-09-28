"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
  images: string[];
};

export function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[250px] overflow-hidden sm:h-[300px] md:h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) setI((x) => (x + (dx < 0 ? 1 : -1) + n) % n);
      }}
    >
      {slides.map((s, idx) => (
        <div
          key={s.title}
          aria-hidden={idx !== i}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          style={{ background: s.bg }}
        >
          <div className="mx-auto flex h-full max-w-[1500px] items-start justify-between gap-6 px-6 pt-6 sm:px-16 md:pt-12">
            <div className="max-w-[440px] text-white">
              <h2 className="text-2xl leading-tight font-bold drop-shadow sm:text-4xl md:text-5xl">{s.title}</h2>
              <p className="mt-2 text-sm opacity-90 sm:mt-3 sm:text-lg">{s.subtitle}</p>
              <Link
                href={s.href}
                tabIndex={idx === i ? 0 : -1}
                className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-ink shadow hover:bg-[#f3f3f3]"
              >
                {s.cta}
              </Link>
            </div>
            <div className="hidden flex-1 items-start justify-end gap-4 sm:flex">
              {s.images.map((src, k) => (
                <div
                  key={src}
                  className={`flex items-center justify-center rounded-2xl bg-white/90 p-3 shadow-xl ${k === 1 ? "size-36 md:size-52" : "size-28 md:size-40"}`}
                >
                  <Image src={src} alt="" width={240} height={240} className="max-h-full w-auto object-contain" preload={idx === 0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {/* Fade into the page, so the card grid can overlap */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-page" />
      <button
        onClick={() => setI((i - 1 + n) % n)}
        aria-label="Previous slide"
        className="absolute top-0 left-0 hidden h-full w-16 sm:flex items-start justify-center pt-24 text-ink/70 hover:text-ink md:h-[250px]"
      >
        <ChevronLeft size={48} strokeWidth={1.2} />
      </button>
      <button
        onClick={() => setI((i + 1) % n)}
        aria-label="Next slide"
        className="absolute top-0 right-0 hidden h-full w-16 sm:flex items-start justify-center pt-24 text-ink/70 hover:text-ink md:h-[250px]"
      >
        <ChevronRight size={48} strokeWidth={1.2} />
      </button>
    </section>
  );
}
