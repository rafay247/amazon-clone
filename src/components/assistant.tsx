"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw, Sparkles, X } from "lucide-react";
import { cart, type CartProduct } from "@/lib/cart-store";
import { Stars } from "./stars";
import { AddToCartButton } from "./add-to-cart-button";
import { money } from "@/lib/format";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
type Card = CartProduct & { rating: number; ratingCount: number };

const STORE_KEY = "assistant:v1";
const OPEN_EVENT = "assistant:open";

/** Open the assistant from anywhere, optionally sending a question straight away. */
export function openAssistant(prompt?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { prompt } }));
}

const GENERAL = [
  "Best phone under $500",
  "Gift ideas for someone who loves cooking",
  "What's the best deal in electronics today?",
  "Compare the top-rated laptops",
];
const ON_PRODUCT = ["Is this worth buying?", "What do reviewers say?", "Show me cheaper alternatives", "What goes well with this?"];

const TAG = /\[\[(\d+)\]\]/g;

function productIdFrom(pathname: string) {
  const m = pathname.match(/^\/dp\/(\d+)/);
  return m ? Number(m[1]) : undefined;
}

function load(): Msg[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function Assistant() {
  const pathname = usePathname();
  const productId = productIdFrom(pathname);
  const [open, setOpen] = useState(false);
  // The panel starts closed, so restoring messages here can't cause a hydration mismatch.
  const [msgs, setMsgs] = useState<Msg[]>(() => (typeof window === "undefined" ? [] : load()));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [cards, setCards] = useState<Record<number, Card>>({});
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (busy) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-20)));
    } catch {
      // Storage unavailable (private mode); the chat just won't survive a reload.
    }
  }, [msgs, busy]);

  // Fetch card data for any product tags we haven't seen yet.
  const wanted = [...new Set(msgs.flatMap((m) => [...m.content.matchAll(TAG)].map((x) => Number(x[1]))))].filter(
    (id) => !(id in cards),
  );
  const wantedKey = wanted.join(",");
  useEffect(() => {
    if (!wantedKey || busy) return;
    fetch(`/api/products?ids=${wantedKey}`)
      .then((r) => r.json())
      .then((items: Card[]) => setCards((c) => ({ ...c, ...Object.fromEntries(items.map((i) => [i.id, i])) })))
      .catch(() => {});
  }, [wantedKey, busy]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [msgs, open]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput("");
      const history = [...msgs.filter((m) => !m.error), { role: "user" as const, content: q }];
      setMsgs([...history, { role: "assistant", content: "" }]);
      setBusy(true);
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
            productId: productIdFrom(window.location.pathname),
            cartIds: cart.get().items.filter((i) => !i.saved).map((i) => i.id),
          }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const { error } = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
          throw new Error(error);
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setMsgs([...history, { role: "assistant", content: acc }]);
        }
        if (!acc.trim()) throw new Error("I didn't get an answer that time. Please try again.");
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setMsgs([...history, { role: "assistant", content: (e as Error).message, error: true }]);
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [busy, msgs],
  );

  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) send(prompt);
      else setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [send]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    abort.current?.abort();
    setMsgs([]);
    setBusy(false);
  }

  const suggestions = productId ? ON_PRODUCT : GENERAL;
  // The product page has a sticky buy bar on phones; sit above it.
  const lift = productId ? "bottom-20 lg:bottom-6" : "bottom-4 sm:bottom-6";

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={`fixed right-4 z-40 flex items-center gap-2 rounded-full bg-nav-2 py-2.5 pr-4 pl-3 text-sm font-bold text-white shadow-lg ring-2 ring-white/10 transition hover:bg-nav-3 sm:right-6 ${lift}`}
        >
          <Sparkles size={18} className="text-orange" /> Ask AI
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="AI shopping assistant"
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(640px,calc(100vh-48px))] sm:w-[400px] sm:rounded-xl sm:shadow-2xl sm:ring-1 sm:ring-black/10"
        >
          <header className="flex items-center gap-2 bg-nav-2 px-4 py-3 text-white sm:rounded-t-xl">
            <Sparkles size={18} className="text-orange" />
            <h2 className="font-bold">Shopping assistant</h2>
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">AI</span>
            <div className="ml-auto flex items-center gap-1">
              {msgs.length > 0 && (
                <button onClick={reset} aria-label="New chat" title="New chat" className="rounded p-1.5 hover:bg-white/10">
                  <RotateCcw size={16} />
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1.5 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
          </header>

          <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {msgs.length === 0 ? (
              <div>
                <p className="text-lg font-bold">Hi! What are you shopping for?</p>
                <p className="mt-1 text-sm text-muted">
                  {productId
                    ? "Ask me anything about this item, or have me find alternatives."
                    : "I know every product in the store. Ask for recommendations, comparisons or gift ideas."}
                </p>
                <div className="mt-4 flex flex-col items-start gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-line px-3 py-1.5 text-left text-sm hover:border-link hover:bg-[#f7fafa]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              msgs.map((m, i) =>
                m.role === "user" ? (
                  <p key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-[#e7f4f5] px-3.5 py-2 text-sm">
                    {m.content}
                  </p>
                ) : (
                  <Answer
                    key={i}
                    msg={m}
                    cards={cards}
                    streaming={busy && i === msgs.length - 1}
                    onRetry={() => {
                      const lastUser = [...msgs].reverse().find((x) => x.role === "user");
                      if (lastUser) {
                        setMsgs(msgs.slice(0, msgs.lastIndexOf(lastUser)));
                        send(lastUser.content);
                      }
                    }}
                  />
                ),
              )
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-line p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-[#888c8c] px-3 py-1.5 focus-within:border-link focus-within:ring-2 focus-within:ring-link/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                maxLength={1000}
                placeholder={productId ? "Ask about this item…" : "Ask a shopping question…"}
                aria-label="Message"
                className="max-h-28 flex-1 resize-none bg-transparent py-1 text-sm outline-none [field-sizing:content]"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                aria-label="Send"
                className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-yellow disabled:opacity-40"
              >
                <ArrowUp size={16} />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[11px] text-muted">AI answers can be wrong. Check the product page before buying.</p>
          </form>
        </section>
      )}
    </>
  );
}

function Answer({
  msg,
  cards,
  streaming,
  onRetry,
}: {
  msg: Msg;
  cards: Record<number, Card>;
  streaming: boolean;
  onRetry: () => void;
}) {
  if (msg.error) {
    return (
      <div className="rounded-lg border border-[#f5c2c7] bg-[#fdf2f3] p-3 text-sm">
        {msg.content}{" "}
        <button onClick={onRetry} className="link font-bold">
          Try again
        </button>
      </div>
    );
  }
  if (!msg.content) {
    return (
      <div className="flex gap-1 py-2" aria-label="Thinking">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 animate-bounce rounded-full bg-muted/60" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    );
  }
  // Hide a tag that's still arriving ("[[12") so it doesn't flash as raw text.
  const text = streaming ? msg.content.replace(/\[\[\d*\]?$/, "") : msg.content;
  const ids = [...new Set([...msg.content.matchAll(TAG)].map((m) => Number(m[1])))];
  const shown = ids.map((id) => cards[id]).filter(Boolean);

  return (
    <div className="text-sm leading-relaxed">
      <Markdown text={text.replace(TAG, "").replace(/ +([.,;:!?)])/g, "$1")} />
      {!streaming && shown.length > 0 && (
        <ul className="no-scrollbar -mx-4 mt-3 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1">
          {shown.map((c) => (
            <li key={c.id} className="flex w-[150px] shrink-0 snap-start flex-col rounded-lg border border-line p-2.5">
              <Link href={`/dp/${c.id}/${c.slug}`} className="flex h-24 items-center justify-center">
                <Image src={c.image} alt="" width={96} height={96} className="max-h-full w-auto object-contain" />
              </Link>
              <Link href={`/dp/${c.id}/${c.slug}`} className="mt-1.5 line-clamp-2 text-xs leading-snug hover:text-link-hover">
                {c.title}
              </Link>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-link">
                <Stars rating={c.rating} size={11} /> {c.ratingCount.toLocaleString()}
              </span>
              <b className="mt-0.5">{money(c.price)}</b>
              <div className="mt-auto pt-2 [&_button]:text-xs">
                <AddToCartButton product={c} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Just enough markdown for the model's answers: paragraphs, "- " bullets and **bold**. */
function Markdown({ text }: { text: string }) {
  const blocks: { list: boolean; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      blocks.push({ list: false, lines: [] });
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.*)/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.list) last.lines.push(bullet[1]);
      else blocks.push({ list: true, lines: [bullet[1]] });
    } else if (last && !last.list && last.lines.length) last.lines.push(line);
    else blocks.push({ list: false, lines: [line] });
  }
  return (
    <div className="space-y-2">
      {blocks
        .filter((b) => b.lines.length)
        .map((b, i) =>
          b.list ? (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.lines.map((l, j) => (
                <li key={j}>
                  <Inline text={l} />
                </li>
              ))}
            </ul>
          ) : (
            <p key={i}>
              {b.lines.map((l, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  <Inline text={l} />
                </Fragment>
              ))}
            </p>
          ),
        )}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>,
  );
}
