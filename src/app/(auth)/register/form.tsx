"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Info } from "lucide-react";
import { signUp } from "../actions";

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUp, undefined);
  return (
    <div className="w-full max-w-[350px]">
      <div className="rounded-lg border border-line p-6">
        <h1 className="mb-3 text-[28px]">Create account</h1>
        <form action={action} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm font-bold">
            Your name
            <input name="name" required autoFocus autoComplete="name" defaultValue={state?.name} placeholder="First and last name" className="input mt-1 font-normal" />
          </label>
          <label className="block text-sm font-bold">
            Email
            <input name="email" type="email" required autoComplete="email" defaultValue={state?.email} className="input mt-1 font-normal" />
          </label>
          <label className="block text-sm font-bold">
            Password
            <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className="input mt-1 font-normal" />
          </label>
          <p className="flex items-center gap-1 text-xs">
            <Info size={14} className="text-link" /> Passwords must be at least 6 characters.
          </p>
          <label className="block text-sm font-bold">
            Re-enter password
            <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className="input mt-1 font-normal" />
          </label>
          {state?.error && (
            <p role="alert" className="text-xs text-deal">
              ! {state.error}
            </p>
          )}
          <button className="btn-yellow w-full !rounded-lg" disabled={pending}>
            {pending ? "Creating account…" : "Continue"}
          </button>
        </form>
        <p className="mt-4 text-xs">This is a demo store. Don&apos;t reuse a real password.</p>
        <hr className="my-4 border-line" />
        <p className="text-sm">
          Already have an account?{" "}
          <Link href={`/signin?next=${encodeURIComponent(next)}`} className="link">
            Sign in ›
          </Link>
        </p>
      </div>
    </div>
  );
}
