"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mist">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-condensed text-3xl">Something went wrong</h1>
        <p className="mt-2 text-mute">An unexpected error occurred. Please try again.</p>
        {error.digest ? <p className="mt-2 text-xs text-mute">Reference: {error.digest}</p> : null}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="outline">
            Go home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
