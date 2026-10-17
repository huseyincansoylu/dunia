import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { WelcomeForm } from "@/components/auth/forms";
import { requireUser } from "@/lib/auth";
import { accountExists, getProfile } from "@/lib/profiles";

export const metadata: Metadata = { title: "Pick your username" };

// For signed-in users who don't have a username yet (e.g. someone else took theirs
// between sign-up and confirming the email). Everyone else goes straight to their map.
export default function WelcomePage() {
  return (
    <AuthShell>
      <Content />
    </AuthShell>
  );
}

async function Content() {
  const user = await requireUser("/welcome");
  const profile = await getProfile(user.id);
  if (profile?.username) redirect("/atlas");
  // No profile at all can mean the account was just deleted while this session lived on.
  if (!profile && !(await accountExists(user.id))) redirect("/auth/gone");
  return <WelcomeForm />;
}
