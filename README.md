# Amazon.clone

A working rebuild of amazon.com's shopping experience, made in one day for the 8x Software Engineer assignment.

**Live site:** https://amazon-clone-self-sigma.vercel.app

**Demo login:** on the sign-in page, click **"Use the demo account"**. No sign-up needed.
(Or sign in with `demo@amazonclone.dev` / `demo-shopper-2026`, or create your own account.)

**Test card:** `4242 4242 4242 4242`, any future date, any CVV. No real payment is taken.

---

## Try it in 2 minutes

1. Search for **"phone"** and try the filters and sort.
2. Open a product and click **Add to cart**.
3. Click **Ask AI** (bottom right) and ask *"Is this worth buying?"*
4. Go to the cart and click **Proceed to checkout**. You'll be asked to sign in, so use the demo account.
5. Place the order, then see it under **Returns & Orders**. Try **Buy it again**.

---

## What works

| Area | What you can do |
|---|---|
| **Browse** | Home page with deals and category rows, the "All" side menu, department pages |
| **Search** | Suggestions as you type, filters (Prime, deals, price, rating, brand), sorting, pages |
| **Product page** | Photo gallery with zoom, price and delivery date, stock, reviews with a star breakdown, related items |
| **Cart** | Add, change quantity, delete, save for later, free-shipping progress bar |
| **Account** | Sign up, sign in, saved addresses, wish list, browsing history |
| **Checkout** | Address → payment → review → place order, with tax and shipping |
| **Orders** | Order history, order details, buy it again, write a review |
| **AI assistant** | Ask shopping questions. It recommends real products from the store and shows them as cards you can add to your cart. On a product page it knows which item you mean. |
| **Phone layout** | Every page works on a phone |

---

## What I built first, and what I left out

I built the full **buying path** first: find a product, add it to the cart, check out, see the order. That path is Amazon's core, so it all works end to end, including real accounts and saved orders.

Then I added one thing Amazon doesn't do as well: an **AI assistant** that knows the whole catalogue and answers "which one should I buy?" questions.

**Left out on purpose,** because none of it is part of shopping for a product:

- Prime Video, Music, Kindle, Alexa
- Seller accounts and dashboards
- Real payments, shipping and tracking
- Returns and refunds
- Gift cards, languages and currencies

---

## Tech stack

- **Next.js 16** (React 19) + **Tailwind CSS**, hosted on **Vercel**
- **Supabase** for accounts and the database (addresses, cart, orders, reviews)
- **OpenAI** (`gpt-5.4-mini`) for the AI assistant
- **Products:** 194 real items with photos from [DummyJSON](https://dummyjson.com)

---

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
node --env-file=.env.local scripts/migrate.mjs   # creates the database tables
npm run dev
```

`.env.local` needs:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
DATABASE_URL=...        # only for the migrate step
OPENAI_API_KEY=...      # for the AI assistant
```

---

## How I worked with AI

I built this with Claude Code. Every prompt and response is saved in [`.agent-logs/`](.agent-logs), and [`CAPTURE-TEST.md`](CAPTURE-TEST.md) explains how those logs are captured.

---

*A portfolio project, not affiliated with Amazon.com, Inc.*
