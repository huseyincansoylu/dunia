import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  return (
    <AuthShell>
      <Content searchParams={searchParams} />
    </AuthShell>
  );
}

async function Content({ searchParams }: Pick<PageProps<"/forgot-password">, "searchParams">) {
  const { error } = await searchParams;
  const notice = error === "link" ? "That reset link has expired or was already used. Request a new one." : undefined;
  return <ForgotPasswordForm notice={notice} />;
}
