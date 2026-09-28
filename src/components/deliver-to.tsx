"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Modal } from "./modal";
import { deliverTo, useDeliverTo } from "@/lib/location-store";

const COUNTRIES = ["United States", "Pakistan", "United Kingdom", "Canada", "Germany", "India", "United Arab Emirates"];

export function DeliverToButton({ variant = "header" }: { variant?: "header" | "inline" }) {
  const loc = useDeliverTo();
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "header" ? (
        <button
          onClick={() => setOpen(true)}
          className="nav-hover hidden shrink-0 items-end gap-0.5 px-1.5 py-1.5 text-left lg:flex"
        >
          <MapPin size={17} className="mb-0.5 text-white" />
          <span className="leading-tight">
            <span className="block text-xs text-[#ccc]">{loc ? `Delivering to ${loc.label}` : "Deliver to"}</span>
            <span className="block text-sm font-bold text-white">{loc ? "Update location" : "United States"}</span>
          </span>
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="link flex items-center gap-1 text-xs">
          <MapPin size={14} />
          {loc ? `Deliver to ${loc.label}` : "Deliver to United States"}
        </button>
      )}
      {open && <LocationModal onClose={() => setOpen(false)} />}
    </>
  );
}

function LocationModal({ onClose }: { onClose: () => void }) {
  const [zip, setZip] = useState("");
  const [err, setErr] = useState("");
  return (
    <Modal title="Choose your location" onClose={onClose}>
      <p className="mb-4 text-xs text-muted">
        Delivery options and delivery speeds may vary for different locations.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\d{5}$/.test(zip)) return setErr("Please enter a valid US zip code");
          deliverTo.set({ label: zip, line: zip });
          onClose();
        }}
        className="flex gap-2"
      >
        <input
          value={zip}
          onChange={(e) => {
            setZip(e.target.value);
            setErr("");
          }}
          inputMode="numeric"
          maxLength={5}
          placeholder="US zip code"
          aria-label="US zip code"
          className="input"
        />
        <button className="btn-outline shrink-0 !rounded-md">Apply</button>
      </form>
      {err && <p className="mt-1 text-xs text-deal">{err}</p>}
      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or ship outside the US <span className="h-px flex-1 bg-line" />
      </div>
      <select
        className="input"
        defaultValue=""
        aria-label="Country"
        onChange={(e) => {
          if (!e.target.value) return;
          deliverTo.set({ label: e.target.value, line: e.target.value });
          onClose();
        }}
      >
        <option value="" disabled>
          Choose a country
        </option>
        {COUNTRIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </Modal>
  );
}
