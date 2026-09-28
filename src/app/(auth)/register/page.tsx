import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { RegisterForm } from "./form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = (await searchParams).next;
  const to = typeof next === "string" ? next : "/";
  if (await getSessionUser()) redirect(to);
  return <RegisterForm next={to} />;
}
