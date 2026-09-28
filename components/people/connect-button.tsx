"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { connectWith } from "@/app/(app)/actions";
import { RequestSentDialog } from "@/components/discover/request-sent-dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ConnectButton({ targetId, name, activity }: { targetId: string; name: string; activity: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onClick() {
    setError(null);
    setPending(true);
    const res = await connectWith(targetId);
    setPending(false);
    if (!res.ok) return setError(res.message);
    if (res.status === "accepted") return router.push(`/match/${res.connectionId}`);
    setSent(true);
  }

  const close = useCallback(() => {
    setSent(false);
    router.refresh();
  }, [router]);

  return (
    <div className="w-full">
      {error ? (
        <Alert className="mb-3" tone="error">
          {error}
        </Alert>
      ) : null}
      <Button size="lg" className="w-full" onClick={onClick} pending={pending}>
        Connect with {name}
        {!pending ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
      </Button>
      {sent ? <RequestSentDialog name={name} activity={activity} onClose={close} /> : null}
    </div>
  );
}
