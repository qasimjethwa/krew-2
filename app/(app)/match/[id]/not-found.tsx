import { HeartOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function MatchNotFound() {
  return (
    <EmptyState
      icon={<HeartOff className="size-6" aria-hidden="true" />}
      title="Connection not found"
      action={
        <>
          <ButtonLink href="/connections">Your connections</ButtonLink>
          <ButtonLink href="/requests" variant="outline">
            Requests
          </ButtonLink>
        </>
      }
    >
      Contact details are only visible once both people have connected. This request may still be pending or is no longer active.
    </EmptyState>
  );
}
