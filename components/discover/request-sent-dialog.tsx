"use client";

import { useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export function RequestSentDialog({
  name,
  activity,
  onClose,
}: {
  name: string;
  activity: string | null;
  onClose: () => void;
}) {
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    doneRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-5" role="presentation">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-[krew-fade_.2s_ease-out]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-sent-title"
        className="relative w-full max-w-sm rounded-3xl bg-paper p-7 text-center shadow-lift animate-[krew-rise_.25s_ease-out]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-mute hover:bg-mist hover:text-ink"
          aria-label="Close"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-lime animate-[krew-pop_.4s_ease-out]">
          <Send className="size-7 text-ink" aria-hidden="true" />
        </div>
        <h2 id="request-sent-title" className="mt-5 font-condensed text-3xl">
          Request sent!
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-mute">
          {name} has been notified that you&apos;d like to connect{activity ? ` for ${activity}` : ""}. We&apos;ll let you know when they respond.
        </p>
        <div className="mt-6 grid gap-2.5">
          <Button ref={doneRef} onClick={onClose} size="lg">
            Done
          </Button>
          <ButtonLink href="/requests?tab=sent" variant="outline" size="lg">
            View sent requests
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
