import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/forms";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password" };

// Reached from the reset email: /auth/callback signs the user in, then sends them here.
export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Content />
    </AuthShell>
  );
}

async function Content() {
  const user = await requireUser("/reset-password");
  return <ResetPasswordForm email={user.email} />;
}
