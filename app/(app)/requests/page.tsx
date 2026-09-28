import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Send } from "lucide-react";
import { cancelRequest, respondToRequest } from "@/app/(app)/actions";
import { PersonRow } from "@/components/connections/person-row";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { logServerError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Connection requests" };

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export default async function RequestsPage({ searchParams }: PageProps<"/requests">) {
  const sp = await searchParams;
  const tab = sp.tab === "sent" ? "sent" : "received";
  const supabase = await createClient();

  const [received, sent] = await Promise.all([
    supabase.rpc("list_connections", { p_box: "received" }),
    supabase.rpc("list_connections", { p_box: "sent" }),
  ]);
  if (received.error) logServerError("requests:received", received.error);
  if (sent.error) logServerError("requests:sent", sent.error);

  const rows = (tab === "received" ? received.data : sent.data) ?? [];
  const loadError = tab === "received" ? received.error : sent.error;

  const tabs = [
    { key: "received", label: "Received", count: received.data?.length ?? 0 },
    { key: "sent", label: "Sent", count: sent.data?.length ?? 0 },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-condensed text-4xl sm:text-5xl">Connection requests</h1>
      <p className="mt-2 text-[15px] text-mute">Contact details are only shared once a request is accepted.</p>

      <nav aria-label="Request folders" className="mt-6 flex border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "received" ? "/requests" : "/requests?tab=sent"}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "-mb-px flex-1 border-b-2 px-4 py-3 text-center text-sm font-semibold transition-colors sm:flex-none sm:px-8",
              tab === t.key ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink",
            )}
          >
            {t.label} ({t.count})
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-4">
        {sp.error ? (
          <Alert tone="error">
            {sp.error === "request_not_found" ? "That request is no longer available." : "Something went wrong. Please try again."}
          </Alert>
        ) : null}
        {sp.declined ? <Alert tone="info">Request declined. They won&apos;t be notified.</Alert> : null}
        {sp.cancelled ? <Alert tone="info">Request withdrawn.</Alert> : null}
        {loadError ? <Alert tone="error">We couldn&apos;t load your requests. Please refresh.</Alert> : null}

        {!loadError && rows.length === 0 ? (
          tab === "received" ? (
            <EmptyState
              icon={<Inbox className="size-6" aria-hidden="true" />}
              title="No requests yet"
              action={<ButtonLink href="/discover">Discover people</ButtonLink>}
            >
              When someone wants to work out with you, their request will show up here.
            </EmptyState>
          ) : (
            <EmptyState
              icon={<Send className="size-6" aria-hidden="true" />}
              title="No pending requests"
              action={<ButtonLink href="/discover">Find your KREW</ButtonLink>}
            >
              Requests you send appear here until they&apos;re answered.
            </EmptyState>
          )
        ) : null}

        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.connection_id}>
              <PersonRow
                row={row}
                href={`/people/${row.other_id}`}
                note={
                  tab === "received"
                    ? `Wants to connect${row.activity_label ? ` for ${row.activity_label}` : ""} · ${timeAgo(row.created_at)}`
                    : `Pending${row.activity_label ? ` · ${row.activity_label}` : ""} · sent ${timeAgo(row.created_at)}`
                }
              >
                {tab === "received" ? (
                  <form action={respondToRequest} className="flex gap-2">
                    <input type="hidden" name="connectionId" value={row.connection_id} />
                    <Button type="submit" name="decision" value="accept" size="sm">
                      Accept
                    </Button>
                    <Button type="submit" name="decision" value="decline" variant="outline" size="sm">
                      Decline
                    </Button>
                  </form>
                ) : (
                  <form action={cancelRequest}>
                    <input type="hidden" name="connectionId" value={row.connection_id} />
                    <Button type="submit" variant="outline" size="sm">
                      Withdraw
                    </Button>
                  </form>
                )}
              </PersonRow>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
