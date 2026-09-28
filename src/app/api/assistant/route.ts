import { ASSISTANT_MODEL, systemMessages } from "@/lib/assistant";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 12;
const MAX_CHARS = 1000;

// Best-effort per-instance limiter; this is a public demo running on my own API key.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return error("The assistant isn't configured on this deployment.", 503);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) return error("You're asking a lot of questions! Please wait a few minutes and try again.", 429);

  let body: { messages?: unknown; productId?: unknown; cartIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return error("Bad request.", 400);
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is Msg =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "",
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return error("Ask a question first.", 400);

  const productId = typeof body.productId === "number" ? body.productId : undefined;
  const cartIds = Array.isArray(body.cartIds) ? body.cartIds.filter((x): x is number => typeof x === "number").slice(0, 30) : [];

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ASSISTANT_MODEL,
      reasoning_effort: "low",
      max_completion_tokens: 900,
      stream: true,
      messages: [...systemMessages({ productId, cartIds }), ...messages],
    }),
    signal: req.signal,
  }).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    console.error("assistant upstream", upstream?.status, await upstream?.text().catch(() => ""));
    return error("The assistant is unavailable right now. Please try again in a moment.", 502);
  }

  // Re-emit only the text deltas as a plain text stream.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buf += decoder.decode(chunk, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const l of lines) {
          if (!l.startsWith("data: ") || l === "data: [DONE]") continue;
          try {
            const delta = JSON.parse(l.slice(6)).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // Partial or keep-alive line; ignore.
          }
        }
      },
    }),
  );

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
