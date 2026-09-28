"use client";

import { useActionState, useState } from "react";
import { saveGoals } from "../actions";
import { StepFooter } from "@/components/onboarding/step-footer";
import { Alert } from "@/components/ui/alert";
import { Choice } from "@/components/ui/choice";
import { Field, FieldError, Input } from "@/components/ui/field";
import { AVAILABILITY, CUSTOM_TAG_MAX, FITNESS_LEVELS, MAX_GOALS } from "@/lib/constants";
import { initialFormState, type AvailabilitySlot, type FitnessLevel } from "@/types/app";

export function GoalsForm({
  options,
  defaults,
  edit,
  backHref,
}: {
  options: { slug: string; label: string }[];
  defaults: { goals: string[]; custom: string; level: FitnessLevel | null; availability: AvailabilitySlot[] };
  edit: boolean;
  backHref: string;
}) {
  const [state, action, pending] = useActionState(saveGoals, initialFormState);
  const [goals, setGoals] = useState<string[]>(defaults.goals);
  const [other, setOther] = useState(Boolean(defaults.custom));
  const e = state.fieldErrors ?? {};
  const count = goals.length + (other ? 1 : 0);
  const full = count >= MAX_GOALS;

  function toggle(slug: string, on: boolean) {
    setGoals((g) => (on ? [...g, slug] : g.filter((x) => x !== slug)));
  }

  return (
    <form action={action} noValidate className="flex flex-1 flex-col">
      {edit ? <input type="hidden" name="edit" value="1" /> : null}
      {state.message ? <Alert className="mb-5">{state.message}</Alert> : null}

      <fieldset>
        <legend className="text-lg font-semibold">What are you looking for?</legend>
        <p className="mt-1 text-sm text-mute" aria-live="polite">
          Select up to {MAX_GOALS} goals{count ? ` · ${count} of ${MAX_GOALS} selected` : ""}.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {options.map((o) => {
            const checked = goals.includes(o.slug);
            return (
              <Choice
                key={o.slug}
                type="checkbox"
                name="goals"
                value={o.slug}
                label={o.label}
                checked={checked}
                disabled={!checked && full}
                onChange={(ev) => toggle(o.slug, ev.target.checked)}
              />
            );
          })}
          <Choice
            type="checkbox"
            name="other"
            label="Other"
            checked={other}
            disabled={!other && full}
            onChange={(ev) => setOther(ev.target.checked)}
          />
        </div>
        <FieldError errors={e.goals} />
        {other ? (
          <Field label="Your goal" htmlFor="customGoal" errors={e.customGoal} className="mt-4" hint="For example: train for a 10K.">
            <Input id="customGoal" name="customGoal" defaultValue={defaults.custom} maxLength={CUSTOM_TAG_MAX} autoFocus={!defaults.custom} invalid={!!e.customGoal} />
          </Field>
        ) : null}
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-semibold">Your fitness level</legend>
        <p className="mt-1 text-sm text-mute">Where would you place yourself?</p>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {FITNESS_LEVELS.map((l) => (
            <Choice key={l.value} name="fitnessLevel" value={l.value} label={l.label} defaultChecked={defaults.level === l.value} className="gap-2 px-3" />
          ))}
        </div>
        <FieldError errors={e.fitnessLevel} />
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-semibold">When do you usually like to work out?</legend>
        <p className="mt-1 text-sm text-mute">Pick all that fit.</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {AVAILABILITY.map((a) => (
            <Choice key={a.value} type="checkbox" name="availability" value={a.value} label={a.label} defaultChecked={defaults.availability.includes(a.value)} />
          ))}
        </div>
        <FieldError errors={e.availability} />
      </fieldset>

      <StepFooter backHref={backHref} pending={pending} edit={edit} />
    </form>
  );
}
