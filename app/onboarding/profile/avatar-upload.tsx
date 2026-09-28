"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Avatar } from "@/components/profile/avatar";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@/lib/constants";

/** Resize to max 1024px and re-encode as JPEG before upload (smaller files, strips EXIF). */
async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode_failed"))), "image/jpeg", 0.86),
  );
}

export function AvatarUpload({
  userId,
  name,
  initialPath,
  external,
}: {
  userId: string;
  name: string;
  initialPath: string | null;
  external: string | null;
}) {
  const [path, setPath] = useState(initialPath ?? "");
  const [status, setStatus] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const input = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type as (typeof AVATAR_MIME_TYPES)[number])) {
      setStatus({ busy: false, error: "Use a JPG, PNG or WebP image." });
      return;
    }
    if (file.size > AVATAR_MAX_BYTES * 3) {
      setStatus({ busy: false, error: "That image is too large. Use one under 15 MB." });
      return;
    }
    setStatus({ busy: true });
    try {
      const blob = await prepareImage(file);
      if (blob.size > AVATAR_MAX_BYTES) throw new Error("too_large");
      const newPath = `${userId}/${Date.now()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("avatars").upload(newPath, blob, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      // Remove an unsaved previous upload from this session.
      if (path && path !== initialPath) await supabase.storage.from("avatars").remove([path]);
      setPath(newPath);
      setStatus({ busy: false });
    } catch {
      setStatus({ busy: false, error: "Upload failed. Try another picture." });
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center">
      <input type="hidden" name="avatarPath" value={path} />
      <div className="relative">
        <Avatar name={name} path={path || null} external={path ? null : external} size={128} className="ring-4 ring-mist" />
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="absolute bottom-0 right-0 grid size-11 place-items-center rounded-full border-4 border-paper bg-ink text-paper hover:bg-ink-3"
          aria-label={path ? "Change profile picture" : "Add profile picture"}
          disabled={status.busy}
        >
          {status.busy ? <Spinner className="size-4" /> : <Camera className="size-4.5" aria-hidden="true" />}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept={AVATAR_MIME_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(ev) => onFile(ev.target.files?.[0])}
      />
      <p className="mt-3 text-sm text-mute">Profile picture · optional</p>
      {path ? (
        <button type="button" onClick={() => setPath("")} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-danger hover:underline">
          <Trash2 className="size-3.5" aria-hidden="true" /> Remove picture
        </button>
      ) : null}
      <FieldError errors={status.error} />
    </div>
  );
}
