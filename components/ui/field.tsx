import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function FieldError({ id, errors }: { id?: string; errors?: string[] | string }) {
  const msg = Array.isArray(errors) ? errors[0] : errors;
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger" role="alert">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {msg}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  optional,
  required,
  errors,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  optional?: boolean;
  required?: boolean;
  errors?: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="font-normal text-mute">Optional</span> : null}
        {required ? <span className="font-normal text-mute">Required</span> : null}
      </label>
      {children}
      {hint && !errors?.length ? <p className="mt-1.5 text-sm text-mute">{hint}</p> : null}
      <FieldError id={`${htmlFor}-error`} errors={errors} />
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-line bg-paper px-3.5 text-[15px] text-ink placeholder:text-mute/70 transition-colors hover:border-mute/60 focus:border-ink focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-ink/10 disabled:bg-mist disabled:text-mute aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; leading?: ReactNode; trailing?: ReactNode };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leading, trailing, id, ...props },
  ref,
) {
  return (
    <div className="relative">
      {leading ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-mute">{leading}</span>
      ) : null}
      <input
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && id ? `${id}-error` : undefined}
        className={cn(inputBase, "h-12", leading && "pl-10", trailing && "pr-12", className)}
        {...props}
      />
      {trailing ? <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span> : null}
    </div>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, id, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      className={cn(inputBase, "min-h-28 resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
});
