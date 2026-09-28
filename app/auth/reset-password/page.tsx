import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import { getUserId } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage() {
  // The recovery link signs the user in via /auth/callback before landing here.
  if (!(await getUserId())) redirect("/auth/forgot-password");
  return (
    <AuthShell>
      <h1 className="font-condensed text-4xl">Choose a new password</h1>
      <p className="mt-2 mb-7 text-mute">You&apos;ll stay signed in on this device.</p>
      <ResetPasswordForm />
    </AuthShell>
  );
}
