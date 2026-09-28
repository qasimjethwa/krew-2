import Image from "next/image";
import { PHOTOS } from "@/lib/photo-manifest";

/**
 * Full-bleed background photo for the dark brand panels (auth / onboarding).
 * Renders nothing when no photo is configured, so the existing logo art shows.
 */
export function PanelPhoto({ photoKey, sizes }: { photoKey: "auth" | "onboarding"; sizes: string }) {
  const photo = PHOTOS[photoKey];
  if (!photo) return null;
  return (
    <>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority
        sizes={sizes}
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/35" />
    </>
  );
}

export const hasPanelPhoto = (key: "auth" | "onboarding") => Boolean(PHOTOS[key]);
