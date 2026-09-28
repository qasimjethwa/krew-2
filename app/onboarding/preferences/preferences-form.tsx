"use client";

import { useActionState } from "react";
import { savePreferences } from "../actions";
import { StepFooter } from "@/components/onboarding/step-footer";
import { Alert } from "@/components/ui/alert";
import { Choice } from "@/components/ui/choice";
import { FieldError } from "@/components/ui/field";
import { GENDER_PREFERENCES } from "@/lib/constants";
import { initialFormState, type GenderPreference } from "@/types/app";

export function PreferencesForm({
  defaults,
  edit,
  backHref,
}: {
  defaults: { genderPreference: GenderPreference | null; requireApproval: boolean | null };
  edit: boolean;
  backHref: string;
}) {
  const [state, action, pending] = useActionState(savePreferences, initialFormState);
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="flex flex-1 flex-col">
      {edit ? <input type="hidden" name="edit" value="1" /> : null}
      {state.message ? <Alert className="mb-5">{state.message}</Alert> : null}

      <fieldset>
        <legend className="text-lg font-semibold">Who would you be comfortable being matched with?</legend>
        <div className="mt-4 grid gap-2.5">
          {GENDER_PREFERENCES.map((g) => (
            <Choice key={g.value} layout="stack" name="genderPreference" value={g.value} label={g.label} hint={g.hint} defaultChecked={defaults.genderPreference === g.value} />
          ))}
        </div>
        <FieldError errors={e.genderPreference} />
      </fieldset>

      <fieldset className="mt-10">
        <legend className="text-lg font-semibold">Before sharing your contact details, would you like to approve the match?</legend>
        <div className="mt-4 grid gap-2.5">
          <Choice
            layout="stack"
            name="requireApproval"
            value="yes"
            label="Yes, ask me first"
            hint="People send you a request. Your details are shared only if you accept."
            defaultChecked={defaults.requireApproval !== false}
          />
          <Choice
            layout="stack"
            name="requireApproval"
            value="no"
            label="I'm comfortable sharing"
            hint="When someone connects with you, you're matched straight away and they can see your details."
            defaultChecked={defaults.requireApproval === false}
          />
        </div>
        <FieldError errors={e.requireApproval} />
      </fieldset>

      <StepFooter backHref={backHref} pending={pending} edit={edit} />
    </form>
  );
}
