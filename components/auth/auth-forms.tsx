"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail, MailCheck, User } from "lucide-react";
import { signIn, signUp, type AuthFormState } from "@/app/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, Input } from "@/components/ui/field";

const initial: AuthFormState = { status: "idle" };

function PasswordInput({ id, name, invalid, autoComplete }: { id: string; name: string; invalid?: boolean; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      id={id}
      name={name}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      required
      invalid={invalid}
      leading={<Lock className="size-4" aria-hidden="true" />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="grid size-9 place-items-center rounded-lg text-mute hover:bg-mist hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);
  const e = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-mist p-6" role="status">
        <MailCheck className="size-8" aria-hidden="true" />
        <h2 className="font-condensed mt-4 text-2xl">Check your inbox</h2>
        <p className="mt-2 leading-relaxed text-mute">
          We sent a confirmation link to <span className="font-semibold text-ink">{state.email}</span>. Open it on this
          device to continue setting up your profile.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-4">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <Field label="Name" htmlFor="name" errors={e.name}>
        <Input id="name" name="name" autoComplete="name" required invalid={!!e.name} leading={<User className="size-4" aria-hidden="true" />} />
      </Field>
      <Field label="Email" htmlFor="email" errors={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required invalid={!!e.email} leading={<Mail className="size-4" aria-hidden="true" />} />
      </Field>
      <Field label="Password" htmlFor="password" errors={e.password} hint="At least 8 characters, with a letter and a number.">
        <PasswordInput id="password" name="password" autoComplete="new-password" invalid={!!e.password} />
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword" errors={e.confirmPassword}>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" invalid={!!e.confirmPassword} />
      </Field>
      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-mute">
          <input
            type="checkbox"
            name="terms"
            className="mt-0.5 size-4.5 shrink-0 rounded accent-ink"
            aria-invalid={!!e.terms || undefined}
            aria-describedby={e.terms ? "terms-error" : undefined}
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-ink underline underline-offset-2">Terms of Service</Link> and{" "}
            <Link href="/privacy" target="_blank" className="font-semibold text-ink underline underline-offset-2">Privacy Policy</Link>
          </span>
        </label>
        <FieldError id="terms-error" errors={e.terms} />
      </div>
      <Button type="submit" className="w-full" size="lg" pending={pending}>
        Create account
      </Button>
    </form>
  );
}

export function LogInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate className="space-y-4">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" htmlFor="login-email" errors={e.email}>
        <Input id="login-email" name="email" type="email" autoComplete="email" inputMode="email" required invalid={!!e.email} leading={<Mail className="size-4" aria-hidden="true" />} />
      </Field>
      <Field label="Password" htmlFor="login-password" errors={e.password}>
        <PasswordInput id="login-password" name="password" autoComplete="current-password" invalid={!!e.password} />
      </Field>
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-sm font-semibold underline-offset-4 hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" size="lg" pending={pending}>
        Log in
      </Button>
    </form>
  );
}
