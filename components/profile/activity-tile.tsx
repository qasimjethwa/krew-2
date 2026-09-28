import Image from "next/image";
import { PHOTOS } from "@/lib/photo-manifest";
import { cn } from "@/lib/utils";
import { ActivityIcon } from "./activity-icon";

/**
 * Photography-led activity tile. Uses the optimised local photo for the slug
 * (see scripts/prepare-images.mjs); otherwise draws the branded placeholder.
 * A dark gradient keeps the label readable on any image.
 */
export function ActivityArtwork({
  slug,
  label,
  className,
  sizes = "160px",
  priority,
}: {
  slug: string;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const photo = PHOTOS[slug];
  return (
    <div className={cn("relative overflow-hidden bg-ink-2", className)}>
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          style={{ objectPosition: photo.position }}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(120% 90% at 100% 0%, rgb(122 92 255 / 0.35), transparent 55%), radial-gradient(90% 80% at 0% 100%, rgb(25 196 255 / 0.22), transparent 60%)",
            }}
          />
          <ActivityIcon activityKey={slug} className="absolute -right-3 -top-2 size-[78%] text-paper/14" strokeWidth={1.25} />
        </>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/5" />
      {label ? <span className="absolute bottom-2.5 left-3 right-3 truncate text-sm font-semibold text-paper">{label}</span> : null}
    </div>
  );
}
