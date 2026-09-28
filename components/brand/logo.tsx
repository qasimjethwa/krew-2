import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The KREW mark (people + heart + location pin), transparent PNG from the supplied logo. */
export function LogoMark({ size = 40, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/krew-mark.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 select-none", className)}
    />
  );
}

/** Wordmark used in page headers, as in the approved UI reference. */
export function Wordmark({
  href = "/",
  tone = "dark",
  withMark = true,
  className,
}: {
  href?: string | null;
  tone?: "dark" | "light";
  withMark?: boolean;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {withMark ? <LogoMark size={30} /> : null}
      <span
        className={cn("text-[22px] leading-none font-black tracking-tight", tone === "light" ? "text-paper" : "text-ink")}
        style={{ fontStretch: "112%" }}
      >
        KREW
      </span>
    </span>
  );
  if (href === null) return content;
  return (
    <Link href={href} aria-label="KREW home" className="rounded-md">
      {content}
    </Link>
  );
}
