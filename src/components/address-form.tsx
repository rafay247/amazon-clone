"use client";
import { useState, useTransition } from "react";
import { addAddress, type AddressInput } from "@/lib/account-actions";
import type { Address } from "@/lib/types";

const COUNTRIES = ["United States", "Pakistan", "United Kingdom", "Canada", "Germany", "India", "United Arab Emirates"];
const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");

export function AddressForm({
  defaultName,
  onSaved,
  submitLabel = "Use this address",
}: {
  defaultName: string;
  onSaved: (a: Address) => void;
  submitLabel?: string;
}) {
  const [country, setCountry] = useState("United States");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const us = country === "United States";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const input = Object.fromEntries(f) as unknown as AddressInput;
        input.is_default = f.get("is_default") === "on";
        start(async () => {
          const r = await addAddress(input);
          if (r.ok) onSaved(r.data);
          else setError(r.error);
        });
      }}
      className="space-y-3 text-sm"
    >
      <Field label="Country/Region">
        <select name="country" value={country} onChange={(e) => setCountry(e.target.value)} className="input">
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Full name (First and Last name)">
        <input name="full_name" required defaultValue={defaultName} autoComplete="name" className="input" />
      </Field>
      <Field label="Phone number" hint="May be used to assist delivery">
        <input name="phone" type="tel" autoComplete="tel" className="input" />
      </Field>
      <Field label="Address">
        <input name="line1" required placeholder="Street address or P.O. Box" autoComplete="address-line1" className="input" />
        <input name="line2" placeholder="Apt, suite, unit, building, floor, etc." autoComplete="address-line2" className="input mt-2" />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_110px]">
        <Field label="City">
          <input name="city" required autoComplete="address-level2" className="input" />
        </Field>
        <Field label={us ? "State" : "Region"}>
          {us ? (
            <select name="state" required defaultValue="" className="input">
              <option value="" disabled>
                Select
              </option>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ) : (
            <input name="state" autoComplete="address-level1" className="input" />
          )}
        </Field>
        <Field label={us ? "ZIP Code" : "Postal code"}>
          <input name="zip" required inputMode={us ? "numeric" : "text"} autoComplete="postal-code" className="input" />
        </Field>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="is_default" className="size-4 accent-link" /> Make this my default address
      </label>
      {error && (
        <p role="alert" className="text-deal">
          {error}
        </p>
      )}
      <button className="btn-yellow" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-bold">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
