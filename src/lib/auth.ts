import "server-only";
import type { SessionUser } from "./types";

// Placeholder until Supabase auth is wired in.
export async function getSessionUser(): Promise<SessionUser> {
  return null;
}
