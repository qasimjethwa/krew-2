"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, safeNextPath } from "@/lib/site-url";
import { emailSchema, fieldErrors, newPasswordSchema, signInSchema, signUpSchema } from "@/lib/validation";
import { logServerError } from "@/lib/errors";
import type { FormState } from "@/types/app";

export type AuthFormState = FormState & { email?: string };

function callbackUrl(next: string) {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms") ?? undefined,
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: callbackUrl("/onboarding"),
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { status: "error", fieldErrors: { email: ["An account with this email already exists. Log in instead."] } };
    }
    if (error.code === "weak_password") {
      return { status: "error", fieldErrors: { password: ["Choose a stronger password."] } };
    }
    if (error.status === 429) {
      return { status: "error", message: "Too many attempts. Wait a minute and try again." };
    }
    logServerError("auth.signUp", error);
    return { status: "error", message: "We couldn't create your account. Try again." };
  }

  // Email confirmation enabled → no session yet.
  if (!data.session) {
    return { status: "success", email: parsed.data.email };
  }
  redirect("/onboarding");
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { status: "error", message: "Confirm your email first — check your inbox for the link we sent." };
    }
    if (error.status === 429) {
      return { status: "error", message: "Too many attempts. Wait a minute and try again." };
    }
    return { status: "error", message: "That email and password don't match. Try again or reset your password." };
  }
  redirect(safeNextPath(formData.get("next")?.toString(), "/discover"));
}

export async function signInWithProvider(provider: "google" | "apple", formData: FormData) {
  const next = safeNextPath(formData.get("next")?.toString(), "/discover");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl(next) },
  });
  if (error || !data.url) {
    logServerError(`auth.oauth.${provider}`, error);
    redirect(`/auth/error?reason=provider&provider=${provider}`);
  }
  redirect(data.url);
}

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: callbackUrl("/auth/reset-password"),
  });
  if (error && error.status === 429) {
    return { status: "error", message: "Too many attempts. Wait a minute and try again." };
  }
  if (error) logServerError("auth.reset", error);
  // Same response whether or not the account exists (prevents account enumeration).
  return { status: "success", email: parsed.data.email };
}

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") {
      return { status: "error", fieldErrors: { password: ["Choose a password you haven't used before."] } };
    }
    logServerError("auth.updatePassword", error);
    return { status: "error", message: "Your reset link has expired. Request a new one." };
  }
  redirect("/discover");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
