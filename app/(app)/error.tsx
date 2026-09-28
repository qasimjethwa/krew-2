"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={<TriangleAlert className="size-6" aria-hidden="true" />}
      title="Something went wrong"
      action={
        <>
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/discover" variant="outline">
            Back to Discover
          </ButtonLink>
        </>
      }
    >
      We couldn&apos;t load this page. Please try again in a moment.
      {error.digest ? <span className="mt-2 block text-xs">Reference: {error.digest}</span> : null}
    </EmptyState>
  );
}
