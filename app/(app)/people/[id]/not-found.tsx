import { UserX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function PersonNotFound() {
  return (
    <EmptyState
      icon={<UserX className="size-6" aria-hidden="true" />}
      title="Profile not available"
      action={<ButtonLink href="/discover">Back to Discover</ButtonLink>}
    >
      This person may have left KREW, be outside your matching preferences, or the link may be wrong.
    </EmptyState>
  );
}
