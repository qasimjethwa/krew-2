import type { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Selectable option built on a native radio/checkbox so it works with
 * keyboard, screen readers and FormData. Selected = solid black, per the
 * approved reference.
 */
type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type?: "radio" | "checkbox";
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
  layout?: "row" | "stack";
};

export function Choice({ type = "radio", label, hint, className, layout = "row", ...input }: ChoiceProps) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 text-[15px] font-medium transition-colors",
        "hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45 has-[:disabled]:hover:border-line",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-k-violet",
        layout === "row" ? "min-h-12 py-2.5" : "min-h-16 py-3.5",
        className,
      )}
    >
      <input type={type} className="peer sr-only" {...input} />
      <span className="min-w-0">
        <span className="block">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm font-normal text-mute group-has-[:checked]:text-paper/70">{hint}</span> : null}
      </span>
      <span
        aria-hidden="true"
        className="grid size-5 shrink-0 place-items-center rounded-full border border-line opacity-0 transition-opacity peer-checked:border-paper peer-checked:bg-paper peer-checked:text-ink peer-checked:opacity-100"
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </label>
  );
}
