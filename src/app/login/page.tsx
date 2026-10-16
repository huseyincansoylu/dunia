import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/forms";
import { getCurrentUser, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, string> = {
  link: "That link has expired or was already used. Sign in, or request a new link.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthShell>
      <Content searchParams={searchParams} />
    </AuthShell>
  );
}

async function Content({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined);
  if (await getCurrentUser()) redirect(next);

  const notice = typeof params.error === "string" ? NOTICES[params.error] : undefined;
  return <SignInForm next={next} notice={notice} />;
}
