"use client";
import { useSyncExternalStore } from "react";

export type Viewed = {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  ratingCount: number;
};

const KEY = "history:v1";
const MAX = 40;
const EMPTY: Viewed[] = [];
let items: Viewed[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    items = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {}
}

function save(next: Viewed[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  for (const l of listeners) l();
}

export const history = {
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    load();
    return items;
  },
  record(v: Viewed) {
    load();
    save([v, ...items.filter((i) => i.id !== v.id)].slice(0, MAX));
  },
  remove(id: number) {
    save(items.filter((i) => i.id !== id));
  },
  clear() {
    save([]);
  },
};

export function useHistory() {
  return useSyncExternalStore(history.subscribe, history.get, () => EMPTY);
}
