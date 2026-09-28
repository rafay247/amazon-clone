"use client";
import { useSyncExternalStore } from "react";

export type CartItem = {
  id: number;
  slug: string;
  title: string;
  price: number;
  listPrice: number | null;
  image: string;
  prime: boolean;
  stock: number;
  qty: number;
  saved: boolean; // "Save for later"
};

export type CartProduct = Omit<CartItem, "qty" | "saved">;

type State = { items: CartItem[]; drawer: CartItem | null };

const KEY = "cart:v1";
const EMPTY: State = { items: [], drawer: null };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...state, items: JSON.parse(raw) };
  } catch {
    // storage unavailable (private mode); the cart just won't persist
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try {
      state = { ...state, items: e.newValue ? JSON.parse(e.newValue) : [] };
      emit();
    } catch {}
  });
}

function emit() {
  for (const l of listeners) l();
}

function set(items: CartItem[], drawer: CartItem | null = state.drawer) {
  state = { items, drawer };
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  emit();
  onChange?.(items);
}

/** Hook for syncing to the server when signed in. */
let onChange: ((items: CartItem[]) => void) | null = null;
export function setCartSync(fn: typeof onChange) {
  onChange = fn;
}

export const cart = {
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    load();
    return state;
  },
  add(p: CartProduct, qty = 1, openDrawer = true) {
    const existing = state.items.find((i) => i.id === p.id);
    let items: CartItem[];
    let added: CartItem;
    if (existing) {
      added = { ...existing, ...p, qty: Math.min(existing.qty + qty, p.stock, 30), saved: false };
      items = state.items.map((i) => (i.id === p.id ? added : i));
    } else {
      added = { ...p, qty: Math.min(qty, p.stock, 30), saved: false };
      items = [added, ...state.items];
    }
    set(items, openDrawer ? added : state.drawer);
  },
  setQty(id: number, qty: number) {
    if (qty <= 0) return cart.remove(id);
    set(state.items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.stock, 30) } : i)));
  },
  remove(id: number) {
    set(state.items.filter((i) => i.id !== id));
  },
  toggleSaved(id: number) {
    set(state.items.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)));
  },
  replace(items: CartItem[]) {
    set(items);
  },
  clearActive() {
    set(state.items.filter((i) => i.saved), null);
  },
  closeDrawer() {
    state = { ...state, drawer: null };
    emit();
  },
};

export function useCart() {
  const s = useSyncExternalStore(cart.subscribe, cart.get, () => EMPTY);
  const active = s.items.filter((i) => !i.saved);
  const saved = s.items.filter((i) => i.saved);
  const count = active.reduce((n, i) => n + i.qty, 0);
  const subtotal = active.reduce((n, i) => n + i.qty * i.price, 0);
  return { items: s.items, active, saved, count, subtotal, drawer: s.drawer };
}
