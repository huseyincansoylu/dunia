import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/forms";
import { getCurrentUser, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage({ searchParams }: PageProps<"/signup">) {
  return (
    <AuthShell>
      <Content searchParams={searchParams} />
    </AuthShell>
  );
}

async function Content({ searchParams }: Pick<PageProps<"/signup">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined);
  if (await getCurrentUser()) redirect(next);
  return <SignUpForm next={next} />;
}
