import type { Metadata } from "next";

/** Personalised, session-dependent pages: never prerender. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set up your profile",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: LayoutProps<"/onboarding">) {
  return children;
}
