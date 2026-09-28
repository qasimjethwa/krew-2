"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, SearchX } from "lucide-react";
import { connectWith, skipProfile } from "@/app/(app)/actions";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { firstName } from "@/lib/utils";
import { ProfileCard } from "./profile-card";
import { RequestSentDialog } from "./request-sent-dialog";
import type { DiscoverCard } from "./types";

export function DiscoverFeed({ cards, filtered }: { cards: DiscoverCard[]; filtered: boolean }) {
  const router = useRouter();
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState<{ id: string; kind: "skip" | "connect" } | null>(null);
  const [sent, setSent] = useState<{ name: string; activity: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, startRefresh] = useTransition();

  const visible = cards.filter((c) => !hidden.has(c.id));
  const hide = (id: string) => setHidden((prev) => new Set(prev).add(id));

  async function handleSkip(card: DiscoverCard) {
    setError(null);
    setBusy({ id: card.id, kind: "skip" });
    const res = await skipProfile(card.id);
    setBusy(null);
    if (res.ok) hide(card.id);
    else setError(res.message);
  }

  async function handleConnect(card: DiscoverCard) {
    setError(null);
    setBusy({ id: card.id, kind: "connect" });
    const res = await connectWith(card.id);
    setBusy(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    hide(card.id);
    if (res.status === "accepted") {
      router.push(`/match/${res.connectionId}`);
      return;
    }
    const sharedLabel = card.sharedActivities[0] ?? null;
    setSent({ name: firstName(card.name), activity: sharedLabel });
  }

  const closeDialog = useCallback(() => setSent(null), []);

  return (
    <>
      {error ? (
        <Alert className="mb-5" tone="error">
          {error}
        </Alert>
      ) : null}

      {visible.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Suggested people">
          {visible.map((card, i) => (
            <li key={card.id}>
              <ProfileCard
                card={card}
                priority={i < 2}
                busy={busy?.id === card.id ? busy.kind : null}
                onSkip={() => handleSkip(card)}
                onConnect={() => handleConnect(card)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden="true" />}
          title={cards.length ? "You're all caught up" : filtered ? "No one matches these filters" : "No matches nearby yet"}
          action={
            <>
              {filtered ? (
                <ButtonLink href="/discover" variant="primary">
                  Clear filters
                </ButtonLink>
              ) : null}
              <Button variant="outline" pending={refreshing} onClick={() => startRefresh(() => router.refresh())}>
                {!refreshing ? <RefreshCw className="size-4" aria-hidden="true" /> : null}
                Refresh
              </Button>
              {!filtered ? (
                <ButtonLink href="/onboarding/location?edit=1" variant="ghost">
                  Widen travel distance
                </ButtonLink>
              ) : null}
            </>
          }
        >
          {cards.length
            ? "You've seen everyone who matches right now. New people join every day — check back soon."
            : filtered
              ? "Try removing a filter or two to see more people."
              : "KREW is growing near you. Try a wider travel distance, add more activities, or check back soon."}
        </EmptyState>
      )}

      {sent ? <RequestSentDialog name={sent.name} activity={sent.activity} onClose={closeDialog} /> : null}
    </>
  );
}
