"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { friendlyDbError, logServerError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

const uuid = z.uuid();

export type ConnectResult =
  | { ok: true; status: "pending" | "accepted"; connectionId: string }
  | { ok: false; message: string };

export type SimpleResult = { ok: true } | { ok: false; message: string };

async function authed() {
  const userId = await getUserId();
  if (!userId) redirect("/auth?mode=login");
  return { userId, supabase: await createClient() };
}

/** Send (or auto-accept) a connection request. Returns state so the UI can show "Request sent" or the match. */
export async function connectWith(targetId: string): Promise<ConnectResult> {
  const parsed = uuid.safeParse(targetId);
  if (!parsed.success) return { ok: false, message: "This profile isn't available." };
  const { supabase } = await authed();

  const { data, error } = await supabase.rpc("send_connection", { p_target: parsed.data });
  const row = data?.[0];
  if (error || !row) {
    if (error) logServerError("connect", error);
    return { ok: false, message: friendlyDbError(error, "We couldn't send that request. Try again.") };
  }
  revalidatePath("/requests");
  revalidatePath("/connections");
  if (row.status !== "pending" && row.status !== "accepted") {
    return { ok: false, message: "This person isn't available to connect right now." };
  }
  return { ok: true, status: row.status, connectionId: row.connection_id };
}

/** Hide a profile from discovery for 30 days. */
export async function skipProfile(targetId: string): Promise<SimpleResult> {
  const parsed = uuid.safeParse(targetId);
  if (!parsed.success) return { ok: false, message: "This profile isn't available." };
  const { userId, supabase } = await authed();
  if (userId === parsed.data) return { ok: false, message: "You can't skip yourself." };

  const { error } = await supabase
    .from("skips")
    .upsert({ user_id: userId, skipped_id: parsed.data, created_at: new Date().toISOString() }, { onConflict: "user_id,skipped_id" });
  if (error) {
    logServerError("skip", error);
    return { ok: false, message: "Couldn't skip right now. Try again." };
  }
  return { ok: true };
}

/** Form action: accept or decline a received request. Accepting opens the match screen. */
export async function respondToRequest(formData: FormData) {
  const id = uuid.safeParse(formData.get("connectionId"));
  const accept = formData.get("decision") === "accept";
  if (!id.success) redirect("/requests?error=request_not_found");
  const { supabase } = await authed();

  const { data, error } = await supabase.rpc("respond_connection", { p_connection: id.data, p_accept: accept });
  if (error) {
    logServerError("respond", error);
    redirect(`/requests?error=${encodeURIComponent(error.message?.includes("request_not_found") ? "request_not_found" : "generic")}`);
  }
  revalidatePath("/", "layout");
  if (accept && data === "accepted") redirect(`/match/${id.data}`);
  redirect("/requests?declined=1");
}

/** Form action: withdraw a pending request you sent. */
export async function cancelRequest(formData: FormData) {
  const id = uuid.safeParse(formData.get("connectionId"));
  if (!id.success) redirect("/requests?tab=sent");
  const { supabase } = await authed();
  const { error } = await supabase.rpc("cancel_connection", { p_connection: id.data });
  if (error) {
    logServerError("cancel", error);
    redirect("/requests?tab=sent&error=generic");
  }
  const back = formData.get("from");
  revalidatePath("/", "layout");
  redirect(typeof back === "string" && back.startsWith("/people/") ? back : "/requests?tab=sent&cancelled=1");
}
