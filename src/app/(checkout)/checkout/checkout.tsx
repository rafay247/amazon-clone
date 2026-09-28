"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { CreditCard, Lock, Minus, Plus, Trash2, Truck } from "lucide-react";
import { cart, useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";
import { cardBrand, luhn, orderDelivery, totals } from "@/lib/pricing";
import { placeOrder } from "@/lib/account-actions";
import type { Address, Payment } from "@/lib/types";
import { Modal } from "@/components/modal";
import { AddressForm } from "@/components/address-form";
import { PrimeBadge } from "@/components/price";

const noop = () => () => {};

export function Checkout({ addresses: initial, userName }: { addresses: Address[]; userName: string }) {
  const router = useRouter();
  const { active } = useCart();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [addresses, setAddresses] = useState(initial);
  const [addressId, setAddressId] = useState<string | null>(initial.find((a) => a.is_default)?.id ?? initial[0]?.id ?? null);
  const [step, setStep] = useState<"address" | "payment" | "review">(addressId ? "payment" : "address");
  const [adding, setAdding] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [placing, start] = useTransition();

  if (!hydrated) return <div className="mx-auto mt-6 h-96 max-w-[1150px] animate-pulse bg-white" />;

  if (active.length === 0) {
    return (
      <div className="mx-auto mt-10 max-w-lg bg-white p-8 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted">Add something to your cart to check out.</p>
        <Link href="/" className="btn-yellow mt-4 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  const address = addresses.find((a) => a.id === addressId) ?? null;
  const t = totals(active);
  const delivery = orderDelivery(active).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const ready = !!address && !!payment;

  function submit() {
    setError("");
    if (!address) return setStep("address");
    if (!payment) return setStep("payment");
    start(async () => {
      const r = await placeOrder({ addressId: address.id, payment, items: active.map(({ id, qty }) => ({ id, qty })) });
      if (!r.ok) return setError(r.error);
      cart.clearActive();
      router.replace(`/orders/${r.data.id}?placed=1`);
    });
  }

  return (
    <div className="mx-auto grid max-w-[1150px] items-start gap-5 px-3 py-5 md:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        {/* 1. Address */}
        <Step n={1} title={address && step !== "address" ? "Delivering to " + address.full_name : "Choose a delivery address"} open={step === "address"}
          summary={address && (
            <p className="text-sm">
              {address.line1}
              {address.line2 && `, ${address.line2}`}, {address.city}, {address.state} {address.zip}, {address.country}
            </p>
          )}
          onChange={() => setStep("address")}
        >
          {addresses.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-bold">Your addresses</legend>
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${a.id === addressId ? "border-[#fbd8b4] bg-[#fcf5ee]" : "border-transparent"}`}>
                  <input type="radio" name="address" checked={a.id === addressId} onChange={() => setAddressId(a.id)} className="mt-0.5 accent-link" />
                  <span>
                    <b>{a.full_name}</b> {a.line1}
                    {a.line2 && `, ${a.line2}`}, {a.city}, {a.state} {a.zip}, {a.country}
                    {a.is_default && <span className="ml-2 text-xs text-muted">(default)</span>}
                  </span>
                </label>
              ))}
            </fieldset>
          )}
          <button onClick={() => setAdding(true)} className="link mt-3 text-sm">
            + Add a new delivery address
          </button>
          {addressId && (
            <div className="mt-4">
              <button onClick={() => setStep(payment ? "review" : "payment")} className="btn-yellow">
                Deliver to this address
              </button>
            </div>
          )}
        </Step>

        {/* 2. Payment */}
        <Step n={2} title="Payment method" open={step === "payment"}
          summary={payment && <p className="text-sm">{payment.type === "card" ? `${payment.brand} ending in ${payment.last4}` : "Pay on delivery (Cash/Card)"}</p>}
          onChange={address ? () => setStep("payment") : undefined}
        >
          <PaymentForm
            initialName={address?.full_name ?? userName}
            onDone={(p) => {
              setPayment(p);
              setStep("review");
            }}
          />
        </Step>

        {/* 3. Review */}
        <Step n={3} title="Review items and shipping" open={step === "review"} alwaysShowBody>
          <div className="rounded-lg border border-line p-4">
            <p className="flex items-center gap-2 font-bold text-success">
              <Truck size={18} /> Arriving {delivery}
            </p>
            <p className="text-xs text-muted">If you order in the next 4 hours and 12 minutes</p>
            <ul className="mt-3 divide-y divide-line">
              {active.map((i) => (
                <li key={i.id} className="flex gap-3 py-3">
                  <Image src={i.image} alt="" width={80} height={80} className="size-20 object-contain" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-2 font-bold">{i.title}</p>
                    <p className="font-bold text-deal">{money(i.price)}</p>
                    {i.prime && <PrimeBadge />}
                    <div className="mt-1 flex h-7 w-fit items-center rounded-full border-2 border-yellow">
                      <button onClick={() => cart.setQty(i.id, i.qty - 1)} className="px-2" aria-label={i.qty === 1 ? "Remove" : "Decrease quantity"}>
                        {i.qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                      </button>
                      <span className="min-w-5 text-center text-xs font-bold">{i.qty}</span>
                      <button onClick={() => cart.setQty(i.id, i.qty + 1)} disabled={i.qty >= Math.min(i.stock, 30)} className="px-2 disabled:opacity-40" aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Step>
      </div>

      <aside className="space-y-3 rounded-lg border border-line bg-white p-5 text-sm md:sticky md:top-4">
        {step === "payment" ? (
          <button type="submit" form="payment-form" className="btn-yellow w-full">
            Use this payment method
          </button>
        ) : step === "address" ? (
          <button onClick={() => (address ? setStep(payment ? "review" : "payment") : setAdding(true))} className="btn-yellow w-full">
            {address ? "Deliver to this address" : "Add a delivery address"}
          </button>
        ) : (
          <button onClick={submit} disabled={placing || !ready} className="btn-yellow w-full">
            {placing ? "Placing your order…" : "Place your order"}
          </button>
        )}
        {error && (
          <p role="alert" className="rounded-md border border-deal bg-[#fcf4f4] p-2 text-xs text-deal">
            {error}
          </p>
        )}
        <p className="text-center text-xs text-muted">By placing your order, you agree to this demo store&apos;s terms. No real charge is made.</p>
        <hr className="border-line" />
        <h2 className="text-lg font-bold">Order Summary</h2>
        <dl className="space-y-1">
          <Row k={`Items (${active.reduce((n, i) => n + i.qty, 0)}):`} v={money(t.subtotal)} />
          <Row k="Shipping & handling:" v={t.shipping ? money(t.shipping) : "FREE"} />
          <Row k="Total before tax:" v={money(t.subtotal + t.shipping)} />
          <Row k="Estimated tax to be collected:" v={money(t.tax)} />
        </dl>
        <hr className="border-line" />
        <div className="flex justify-between text-lg font-bold text-deal">
          <span>Order total:</span>
          <span>{money(t.total)}</span>
        </div>
      </aside>

      {adding && (
        <Modal title="Add an address" onClose={() => setAdding(false)} width="max-w-lg">
          <h3 className="mb-3 text-xl font-bold">Enter a new shipping address</h3>
          <AddressForm
            defaultName={userName}
            onSaved={(a) => {
              setAddresses((xs) => [a, ...xs.map((x) => (a.is_default ? { ...x, is_default: false } : x))]);
              setAddressId(a.id);
              setAdding(false);
              setStep("payment");
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function Step({
  n,
  title,
  open,
  summary,
  onChange,
  alwaysShowBody,
  children,
}: {
  n: number;
  title: string;
  open: boolean;
  summary?: React.ReactNode;
  onChange?: () => void;
  alwaysShowBody?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-lg bg-white p-5 ${open ? "ring-1 ring-line" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="text-lg font-bold">{n}</span>
          <div>
            <h2 className={`text-lg font-bold ${open ? "text-[#c45500]" : ""}`}>{title}</h2>
            {!open && summary}
          </div>
        </div>
        {!open && onChange && (
          <button onClick={onChange} className="link shrink-0 text-sm">
            Change
          </button>
        )}
      </div>
      {(open || alwaysShowBody) && <div className="mt-4 sm:pl-7">{children}</div>}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function PaymentForm({ initialName, onDone }: { initialName: string; onDone: (p: Payment) => void }) {
  const [method, setMethod] = useState<"card" | "cod">("card");
  const [num, setNum] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState(initialName);
  const [err, setErr] = useState("");
  const brand = cardBrand(num);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (method === "cod") return onDone({ type: "cod" });
    if (!luhn(num)) return setErr("That card number doesn't look right. Try the test card 4242 4242 4242 4242.");
    const m = exp.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) return setErr("Enter the expiry date as MM/YY.");
    const end = new Date(2000 + Number(m[2]), Number(m[1]), 1);
    if (end <= new Date()) return setErr("This card has expired.");
    if (!/^\d{3,4}$/.test(cvc)) return setErr("Enter the 3 or 4 digit security code.");
    if (!name.trim()) return setErr("Enter the name on the card.");
    // Only brand + last 4 leave this form.
    onDone({ type: "card", brand, last4: num.replace(/\D/g, "").slice(-4), name: name.trim(), exp: `${m[1]}/${m[2]}` });
  }

  return (
    <form id="payment-form" onSubmit={submit} className="space-y-3 text-sm">
      <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${method === "card" ? "border-[#fbd8b4] bg-[#fcf5ee]" : "border-line"}`}>
        <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} className="accent-link" />
        <CreditCard size={18} /> Credit or debit card
      </label>
      {method === "card" && (
        <div className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block font-bold">Card number</span>
            <div className="relative">
              <input
                value={num}
                onChange={(e) => setNum(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                className="input pr-24"
              />
              {num.length > 1 && <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-muted">{brand}</span>}
            </div>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block font-bold">Name on card</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="cc-name" className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block font-bold">Expiration date</span>
            <input
              value={exp}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
              }}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-bold">Security code (CVV)</span>
            <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" className="input" />
          </label>
          <p className="flex items-center gap-1.5 text-xs text-muted sm:col-span-2">
            <Lock size={12} /> Demo store: use test card <b>4242 4242 4242 4242</b>, any future date and any CVV. Card numbers are never stored.
          </p>
        </div>
      )}
      <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${method === "cod" ? "border-[#fbd8b4] bg-[#fcf5ee]" : "border-line"}`}>
        <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} className="accent-link" />
        Cash on Delivery (Cash/Card)
      </label>
      {err && (
        <p role="alert" className="text-deal">
          {err}
        </p>
      )}
      <button className="btn-yellow">Use this payment method</button>
    </form>
  );
}
