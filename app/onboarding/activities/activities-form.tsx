"use client";

import { useActionState, useState } from "react";
import { Check, Plus } from "lucide-react";
import { saveActivities } from "../actions";
import { StepFooter } from "@/components/onboarding/step-footer";
import { ActivityArtwork } from "@/components/profile/activity-tile";
import { Alert } from "@/components/ui/alert";
import { Field, FieldError, Input } from "@/components/ui/field";
import { CUSTOM_TAG_MAX } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { initialFormState } from "@/types/app";

const tile =
  "group relative block cursor-pointer overflow-hidden rounded-2xl ring-offset-2 transition-shadow has-[:checked]:ring-[3px] has-[:checked]:ring-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-k-violet";

function CheckDot() {
  return (
    <span
      aria-hidden="true"
      className="absolute right-2 top-2 grid size-6 place-items-center rounded-full border-2 border-paper/80 bg-ink/30 text-transparent transition-colors group-has-[:checked]:border-paper group-has-[:checked]:bg-paper group-has-[:checked]:text-ink"
    >
      <Check className="size-3.5" strokeWidth={3} />
    </span>
  );
}

export function ActivitiesForm({
  options,
  defaults,
  edit,
  backHref,
}: {
  options: { slug: string; label: string }[];
  defaults: { selected: string[]; custom: string };
  edit: boolean;
  backHref: string | null;
}) {
  const [state, action, pending] = useActionState(saveActivities, initialFormState);
  const [other, setOther] = useState(Boolean(defaults.custom));
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="flex flex-1 flex-col">
      {edit ? <input type="hidden" name="edit" value="1" /> : null}
      {state.message ? <Alert className="mb-5">{state.message}</Alert> : null}

      <fieldset aria-describedby={e.activities ? "activities-error" : undefined}>
        <legend className="sr-only">Activities</legend>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {options.map((o) => (
            <label key={o.slug} className={tile}>
              <input type="checkbox" name="activities" value={o.slug} defaultChecked={defaults.selected.includes(o.slug)} className="sr-only" />
              <ActivityArtwork slug={o.slug} label={o.label} className="aspect-square" sizes="(min-width: 640px) 140px, 30vw" />
              <CheckDot />
            </label>
          ))}
          <label className={cn(tile, "has-[:checked]:bg-ink has-[:checked]:text-paper")}>
            <input type="checkbox" name="other" checked={other} onChange={(ev) => setOther(ev.target.checked)} className="sr-only" />
            <span className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-mute/50 text-sm font-semibold group-has-[:checked]:border-transparent">
              <Plus className="size-6" aria-hidden="true" /> Other
            </span>
          </label>
        </div>
        <FieldError id="activities-error" errors={e.activities} />
      </fieldset>

      {other ? (
        <Field
          label="What else do you do?"
          htmlFor="customActivity"
          errors={e.customActivity}
          hint="For example: bouldering, kabaddi, trekking."
          className="mt-6"
        >
          <Input
            id="customActivity"
            name="customActivity"
            defaultValue={defaults.custom}
            maxLength={CUSTOM_TAG_MAX}
            autoFocus={!defaults.custom}
            invalid={!!e.customActivity}
          />
        </Field>
      ) : null}

      <StepFooter backHref={backHref} pending={pending} edit={edit} />
    </form>
  );
}
