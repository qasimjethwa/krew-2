import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Json } from "@/types/database";
import type { Tag } from "@/types/app";
import { supabaseUrl } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function firstName(name: string | null | undefined) {
  return (name ?? "").trim().split(/\s+/)[0] || "Someone";
}

export function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "K";
}

/** Public URL for a profile picture (Supabase Storage path or OAuth provider URL). */
export function avatarSrc(path: string | null | undefined, external?: string | null): string | null {
  if (path && supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/avatars/${path.split("/").map(encodeURIComponent).join("/")}`;
  }
  return external ?? null;
}

export function toTags(value: Json | null | undefined): Tag[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((v) => {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof v.key === "string" && typeof v.label === "string") {
      return [{ key: v.key, label: v.label }];
    }
    return [];
  });
}

export function joinNatural(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
