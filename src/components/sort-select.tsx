"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  ["featured", "Featured"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
  ["rating", "Avg. Customer Review"],
  ["newest", "Newest Arrivals"],
];

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-1 rounded-lg border border-line bg-[#f0f2f2] px-2 py-1 text-xs shadow-sm">
      Sort by:
      <select
        value={value}
        onChange={(e) => {
          const u = new URLSearchParams(params);
          u.set("sort", e.target.value);
          u.delete("page");
          router.push(`${pathname}?${u}`);
        }}
        className="cursor-pointer bg-transparent outline-none"
      >
        {OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
