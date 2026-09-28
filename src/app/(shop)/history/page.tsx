"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { history, useHistory } from "@/lib/history-store";
import { ViewedCard } from "@/components/browsing-history";

const noop = () => () => {};

export default function HistoryPage() {
  const items = useHistory();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-[28px]">Your Browsing History</h1>
        {items.length > 0 && (
          <button onClick={() => history.clear()} className="link text-sm">
            Remove all items from view
          </button>
        )}
      </div>
      <p className="text-sm text-muted">These items were viewed recently. We use them to personalize recommendations.</p>
      {!hydrated ? null : items.length === 0 ? (
        <p className="mt-10 text-center text-sm">
          You have no recently viewed items.{" "}
          <Link href="/" className="link">
            Start browsing
          </Link>
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((v) => (
            <li key={v.id} className="relative">
              <ViewedCard v={v} />
              <button
                onClick={() => history.remove(v.id)}
                aria-label={`Remove ${v.title} from history`}
                className="absolute top-1 right-1 rounded-full bg-white p-1 shadow ring-1 ring-line hover:bg-[#f7fafa]"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
