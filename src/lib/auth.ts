import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { SessionUser } from "./types";

/** Verified user from the session cookie (JWT checked via getClaims). Cached per request. */
export const getSessionUser = cache(async (): Promise<SessionUser> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const c = data?.claims;
  if (!c?.sub) return null;
  const meta = (c.user_metadata ?? {}) as { full_name?: string };
  const email = (c.email as string) ?? "";
  return { id: c.sub, email, name: meta.full_name || email.split("@")[0] };
});

export async function requireUser(next: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return user;
}
