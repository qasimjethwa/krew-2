import { signInWithProvider } from "@/app/auth/actions";
import { appleSignInEnabled } from "@/lib/env";
import { OAuthSubmit } from "./oauth-submit";

export function OAuthButtons({ next }: { next?: string }) {
  return (
    <div className="space-y-2.5">
      <form action={signInWithProvider.bind(null, "google")}>
        <input type="hidden" name="next" value={next ?? ""} />
        <OAuthSubmit provider="google" />
      </form>
      {appleSignInEnabled ? (
        <form action={signInWithProvider.bind(null, "apple")}>
          <input type="hidden" name="next" value={next ?? ""} />
          <OAuthSubmit provider="apple" />
        </form>
      ) : null}
    </div>
  );
}
