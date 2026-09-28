"use client";
import { useSyncExternalStore } from "react";
import type { CartProduct } from "./cart-store";

export type ListItem = CartProduct & { addedAt: string; addedPrice: number };

const KEY = "wishlist:v1";
const EMPTY: ListItem[] = [];
let items: ListItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    items = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {}
}

function save(next: ListItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  for (const l of listeners) l();
}

export const wishlist = {
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    load();
    return items;
  },
  toggle(p: CartProduct) {
    load();
    if (items.some((i) => i.id === p.id)) save(items.filter((i) => i.id !== p.id));
    else save([{ ...p, addedAt: new Date().toISOString(), addedPrice: p.price }, ...items]);
  },
  remove(id: number) {
    save(items.filter((i) => i.id !== id));
  },
};

export function useWishlist() {
  return useSyncExternalStore(wishlist.subscribe, wishlist.get, () => EMPTY);
}
