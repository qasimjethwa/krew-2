import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import { PersonRow } from "@/components/connections/person-row";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { logServerError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your KREW" };

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_connections", { p_box: "connected" });
  if (error) logServerError("connections", error);
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-condensed text-4xl sm:text-5xl">
        Your <span className="text-krew">KREW</span>
      </h1>
      <p className="mt-2 text-[15px] text-mute">People you&apos;ve connected with. Open a connection to see their contact details.</p>

      <div className="mt-6 space-y-4">
        {error ? <Alert tone="error">We couldn&apos;t load your connections. Please refresh.</Alert> : null}
        {!error && rows.length === 0 ? (
          <EmptyState
            icon={<UsersRound className="size-6" aria-hidden="true" />}
            title="No connections yet"
            action={<ButtonLink href="/discover">Discover people</ButtonLink>}
          >
            When a connection request is accepted, they&apos;ll appear here with their shared contact details.
          </EmptyState>
        ) : null}
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.connection_id}>
              <PersonRow
                row={row}
                href={`/match/${row.connection_id}`}
                note={row.activity_label ? `Connected for ${row.activity_label}` : "Connected"}
              >
                <ButtonLink href={`/match/${row.connection_id}`} size="sm" variant="accent">
                  View contact details
                </ButtonLink>
              </PersonRow>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
