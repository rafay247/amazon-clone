"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { signIn } from "../actions";

export const DEMO = { email: "demo@amazonclone.dev", password: "demo-shopper-2026" };

/** Two steps like the real flow: email, then password. */
export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const shownEmail = state?.email ?? email;
  const onPassword = step === "password" || !!state?.error;

  return (
    <div className="w-full max-w-[350px]">
      {state?.error && (
        <div role="alert" className="mb-4 flex gap-3 rounded-lg border border-deal p-4 shadow-[0_0_0_4px_#fcf4f4_inset]">
          <AlertTriangle className="shrink-0 text-deal" size={22} />
          <div>
            <p className="text-lg text-deal">There was a problem</p>
            <p className="text-sm">{state.error}</p>
          </div>
        </div>
      )}
      <div className="rounded-lg border border-line p-6">
        <h1 className="mb-3 text-[28px]">Sign in</h1>
        <form
          action={action}
          onSubmit={(e) => {
            if (!onPassword) {
              e.preventDefault();
              const el = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
              if (el.reportValidity()) setStep("password");
            }
          }}
          className="space-y-3"
        >
          <input type="hidden" name="next" value={next} />
          {!onPassword ? (
            <label className="block text-sm font-bold">
              Email
              <input
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1 font-normal"
              />
            </label>
          ) : (
            <>
              <input type="hidden" name="email" value={shownEmail} />
              <p className="text-sm">
                {shownEmail}{" "}
                <button type="button" onClick={() => setStep("email")} className="link">
                  Change
                </button>
              </p>
              <label className="block text-sm font-bold">
                Password
                <input name="password" type="password" required autoFocus autoComplete="current-password" className="input mt-1 font-normal" />
              </label>
            </>
          )}
          <button className="btn-yellow w-full !rounded-lg" disabled={pending}>
            {pending ? "Signing in…" : onPassword ? "Sign in" : "Continue"}
          </button>
        </form>
        <p className="mt-4 text-xs">
          This is a demo store. Don&apos;t use your real Amazon password here.
        </p>
      </div>

      <form action={action} className="mt-4 rounded-lg border border-dashed border-[#c45500] bg-[#fffaf3] p-4 text-sm">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="email" value={DEMO.email} />
        <input type="hidden" name="password" value={DEMO.password} />
        <p className="font-bold">Just looking around?</p>
        <p className="mt-0.5 text-xs text-muted">Sign in to a shared demo account with sample orders.</p>
        <button className="btn-outline mt-2 w-full !rounded-lg" disabled={pending}>
          Use the demo account
        </button>
      </form>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> New to Amazon.clone? <span className="h-px flex-1 bg-line" />
      </div>
      <Link href={`/register?next=${encodeURIComponent(next)}`} className="btn-outline mt-3 block w-full !rounded-lg text-center">
        Create your Amazon.clone account
      </Link>
    </div>
  );
}
