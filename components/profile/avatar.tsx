import Image from "next/image";
import { avatarSrc, cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  path,
  external,
  size = 48,
  className,
  priority,
}: {
  name: string | null | undefined;
  path?: string | null;
  external?: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const src = avatarSrc(path, external);
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-ink-2 text-paper", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={name ? `${name}'s profile picture` : "Profile picture"} fill sizes={`${size}px`} className="object-cover" priority={priority} />
      ) : (
        <span className="font-condensed" style={{ fontSize: size * 0.38 }} aria-label={name ?? "Profile"}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}

/** Large photo area for cards and profile heroes, with an initials fallback. */
export function ProfilePhoto({
  name,
  path,
  external,
  sizes,
  className,
  priority,
}: {
  name: string | null | undefined;
  path?: string | null;
  external?: string | null;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const src = avatarSrc(path, external);
  return (
    <div className={cn("relative overflow-hidden bg-ink-2", className)}>
      {src ? (
        <Image src={src} alt={name ? `${name}'s profile picture` : "Profile picture"} fill sizes={sizes} className="object-cover" priority={priority} />
      ) : (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(90% 70% at 30% 20%, rgb(122 92 255 / 0.35), transparent 60%), radial-gradient(80% 60% at 90% 90%, rgb(255 165 31 / 0.22), transparent 60%)" }}
          />
          <span className="relative font-display text-[7rem] text-paper/85">{initials(name)}</span>
        </div>
      )}
    </div>
  );
}
