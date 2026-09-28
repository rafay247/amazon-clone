import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SignInForm } from "./form";

export const metadata: Metadata = { title: "Sign-In" };

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const next = (await searchParams).next;
  const to = typeof next === "string" ? next : "/";
  if (await getSessionUser()) redirect(to);
  return <SignInForm next={to} />;
}
