import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Link href="/auth?mode=login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-mute hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to log in
      </Link>
      <h1 className="font-condensed text-4xl">Reset your password</h1>
      <p className="mt-2 mb-7 text-mute">Enter the email you signed up with and we&apos;ll send you a reset link.</p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
