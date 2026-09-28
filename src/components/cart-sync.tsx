"use client";
import { useEffect, useRef } from "react";
import { cart, setCartSync } from "@/lib/cart-store";
import { mergeCart, saveCart } from "@/lib/cart-actions";

const toRows = (items: ReturnType<typeof cart.get>["items"]) => items.map(({ id, qty, saved }) => ({ id, qty, saved }));

/** Mirrors the local cart to the signed-in user's account. */
export function CartSync({ userId }: { userId: string | null }) {
  const prev = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const was = prev.current;
    prev.current = userId;

    if (!userId) {
      setCartSync(null);
      // Signed out on this device: don't leave the account's cart behind for the next person.
      if (was) cart.replace([]);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setCartSync(null);
    mergeCart(toRows(cart.get().items)).then((merged) => {
      if (cancelled || !merged) return;
      cart.replace(merged);
      setCartSync((items) => {
        clearTimeout(timer);
        timer = setTimeout(() => saveCart(toRows(items)), 400);
      });
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setCartSync(null);
    };
  }, [userId]);

  return null;
}
