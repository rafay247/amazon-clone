"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { cart, type CartProduct } from "@/lib/cart-store";
import { cancelOrder } from "@/lib/account-actions";

export function BuyAgainButton({ product, compact }: { product: CartProduct | null; compact?: boolean }) {
  if (!product) return null;
  return (
    <button onClick={() => cart.add(product)} className={`btn-yellow inline-flex items-center gap-1.5 ${compact ? "!px-3 !py-1 !text-xs" : ""}`}>
      <RotateCcw size={14} /> Buy it again
    </button>
  );
}

export function CancelOrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  if (confirming) {
    return (
      <div className="rounded-lg border border-line p-3 text-sm">
        <p>Cancel this order?</p>
        <div className="mt-2 flex gap-2">
          <button
            className="btn-yellow !py-1"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await cancelOrder(id);
                if (!r.ok) setError(r.error);
                setConfirming(false);
                router.refresh();
              })
            }
          >
            {pending ? "Cancelling…" : "Yes, cancel"}
          </button>
          <button className="btn-outline !py-1" onClick={() => setConfirming(false)}>
            Keep order
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-deal">{error}</p>}
      </div>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className="btn-outline w-full">
      Cancel items
    </button>
  );
}
