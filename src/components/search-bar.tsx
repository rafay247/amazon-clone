"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";

type Suggestion =
  | { type: "category"; label: string; href: string }
  | { type: "product"; label: string; image: string; href: string };

export function SearchBar({ departments }: { departments: { id: string; name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("k") ?? "");
  const [dept, setDept] = useState(params.get("dept") ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const box = useRef<HTMLFormElement>(null);

  // Keep the box in sync when navigating between searches.
  const urlK = params.get("k") ?? "";
  const urlDept = params.get("dept") ?? "";
  const [prev, setPrev] = useState({ urlK, urlDept });
  if (prev.urlK !== urlK || prev.urlDept !== urlDept) {
    setPrev({ urlK, urlDept });
    setQ(urlK);
    setDept(urlDept);
  }

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: Suggestion[]) => {
          setItems(d);
          setActive(-1);
        })
        .catch(() => {});
    }, 120);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const shown = q.trim() ? items : [];

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && shown[active]) return go(shown[active].href);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("k", q.trim());
    if (dept) sp.set("dept", dept);
    go(`/s?${sp}`);
    (document.activeElement as HTMLElement | null)?.blur();
  }

  function onKey(e: React.KeyboardEvent) {
    if (!shown.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % shown.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? shown.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const deptName = departments.find((d) => d.id === dept)?.name ?? "All";

  return (
    <>
      {open && shown.length > 0 && (
        <div className="fixed inset-0 top-[60px] z-30 bg-black/50" aria-hidden />
      )}
      <form
        ref={box}
        role="search"
        onSubmit={submit}
        className="relative z-40 flex h-10 min-w-0 flex-1 rounded-md focus-within:ring-[3px] focus-within:ring-orange"
      >
        <label className="relative hidden shrink-0 sm:block">
          <span className="sr-only">Search in</span>
          <span className="pointer-events-none flex h-full items-center gap-1 rounded-l-md border-r border-[#cdcdcd] bg-[#e6e6e6] px-2.5 text-xs text-[#555]">
            {deptName} <span className="text-[8px]">▼</span>
          </span>
          <select
            aria-label="Search department"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search Amazon.clone"
          aria-label="Search"
          role="combobox"
          aria-expanded={open && shown.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-l-md bg-white px-3 text-[15px] text-ink outline-none sm:rounded-none"
        />
        <button
          type="submit"
          aria-label="Go"
          className="flex w-11 shrink-0 items-center justify-center rounded-r-md bg-search text-ink hover:bg-search-hover"
        >
          <Search size={22} strokeWidth={2.2} />
        </button>

        {open && shown.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-full right-0 left-0 mt-px overflow-hidden rounded-b-md border border-[#cdcdcd] bg-white py-1 text-ink shadow-lg"
          >
            {shown.map((s, i) => (
              <li
                key={s.href + i}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(s.href);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[15px] ${i === active ? "bg-[#eee]" : ""}`}
              >
                {s.type === "product" ? (
                  <Image src={s.image} alt="" width={28} height={28} className="size-7 object-contain" />
                ) : (
                  <Search size={16} className="mx-1.5 text-muted" />
                )}
                <Highlight text={s.label} q={q} />
                {s.type === "category" && <span className="text-xs text-muted">in categories</span>}
              </li>
            ))}
          </ul>
        )}
      </form>
    </>
  );
}

/** Amazon bolds the part you haven't typed yet. */
function Highlight({ text, q }: { text: string; q: string }) {
  const t = q.trim().toLowerCase();
  const i = text.toLowerCase().indexOf(t);
  if (!t || i < 0) return <span className="truncate font-bold">{text}</span>;
  return (
    <span className="truncate">
      <b>{text.slice(0, i)}</b>
      {text.slice(i, i + t.length)}
      <b>{text.slice(i + t.length)}</b>
    </span>
  );
}
