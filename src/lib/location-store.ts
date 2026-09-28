"use client";
import { useSyncExternalStore } from "react";

export type DeliverTo = { label: string; line: string } | null;

const KEY = "deliver:v1";
let value: DeliverTo = null;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) value = JSON.parse(raw);
  } catch {}
}

export const deliverTo = {
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    load();
    return value;
  },
  set(v: DeliverTo) {
    value = v;
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {}
    for (const l of listeners) l();
  },
};

export function useDeliverTo() {
  return useSyncExternalStore(deliverTo.subscribe, deliverTo.get, () => null);
}
