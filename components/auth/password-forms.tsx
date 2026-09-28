"use client";

import { useActionState } from "react";
import { Lock, Mail, MailCheck } from "lucide-react";
import { requestPasswordReset, updatePassword, type AuthFormState } from "@/app/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

const initial: AuthFormState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-mist p-6" role="status">
        <MailCheck className="size-8" aria-hidden="true" />
        <p className="mt-4 leading-relaxed">
          If an account exists for <span className="font-semibold">{state.email}</span>, we&apos;ve sent a link to reset
          your password.
        </p>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="space-y-4">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <Field label="Email" htmlFor="email" errors={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required invalid={!!state.fieldErrors?.email} leading={<Mail className="size-4" aria-hidden="true" />} />
      </Field>
      <Button type="submit" size="lg" className="w-full" pending={pending}>Send reset link</Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate className="space-y-4">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <Field label="New password" htmlFor="password" errors={e.password} hint="At least 8 characters, with a letter and a number.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required invalid={!!e.password} leading={<Lock className="size-4" aria-hidden="true" />} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" errors={e.confirmPassword}>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required invalid={!!e.confirmPassword} leading={<Lock className="size-4" aria-hidden="true" />} />
      </Field>
      <Button type="submit" size="lg" className="w-full" pending={pending}>Save new password</Button>
    </form>
  );
}
