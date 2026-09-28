"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StepFooter({
  backHref,
  pending,
  edit,
  submitLabel,
  disabled,
}: {
  backHref?: string | null;
  pending?: boolean;
  edit?: boolean;
  submitLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-auto flex items-center justify-between gap-3 border-t border-line bg-paper/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-10 sm:backdrop-blur-none">
      {backHref ? (
        <Link href={backHref} className="inline-flex h-11 items-center gap-2 rounded-xl px-2 text-[15px] font-semibold text-ink hover:bg-mist">
          <ArrowLeft className="size-4" aria-hidden="true" /> {edit ? "Cancel" : "Back"}
        </Link>
      ) : (
        <span />
      )}
      <Button type="submit" pending={pending} disabled={disabled} size="lg" className="min-w-36">
        {submitLabel ?? (edit ? "Save changes" : "Continue")}
        {!pending && !edit ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
      </Button>
    </div>
  );
}
