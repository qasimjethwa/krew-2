"use client";

import { useActionState, useState } from "react";
import { Lock } from "lucide-react";
import { saveProfile } from "../actions";
import { StepFooter } from "@/components/onboarding/step-footer";
import { Alert } from "@/components/ui/alert";
import { Choice } from "@/components/ui/choice";
import { Field, FieldError, Input, Textarea } from "@/components/ui/field";
import { BIO_MAX, GENDERS, MIN_AGE } from "@/lib/constants";
import { initialFormState, type GenderIdentity } from "@/types/app";
import { AvatarUpload } from "./avatar-upload";

function maxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE);
  return d.toISOString().slice(0, 10);
}

export function ProfileForm({
  userId,
  defaults,
  edit,
  backHref,
  completing,
}: {
  userId: string;
  defaults: {
    fullName: string;
    dateOfBirth: string;
    gender: GenderIdentity | null;
    bio: string;
    avatarPath: string | null;
    externalAvatar: string | null;
    email: string;
    phone: string;
    instagram: string;
    shareEmail: boolean;
  };
  edit: boolean;
  backHref: string;
  completing: boolean;
}) {
  const [state, action, pending] = useActionState(saveProfile, initialFormState);
  const [bio, setBio] = useState(defaults.bio);
  const [name, setName] = useState(defaults.fullName);
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="flex flex-1 flex-col">
      {edit ? <input type="hidden" name="edit" value="1" /> : null}
      {state.message ? <Alert className="mb-5">{state.message}</Alert> : null}

      <AvatarUpload userId={userId} name={name} initialPath={defaults.avatarPath} external={defaults.externalAvatar} />

      <div className="mt-8 space-y-5">
        <Field label="Name" htmlFor="fullName" errors={e.fullName}>
          <Input id="fullName" name="fullName" autoComplete="name" value={name} onChange={(ev) => setName(ev.target.value)} maxLength={80} required invalid={!!e.fullName} />
        </Field>

        <Field label="Date of birth" htmlFor="dateOfBirth" errors={e.dateOfBirth} hint={`Only your age is shown. You need to be ${MIN_AGE} or older.`}>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" autoComplete="bday" defaultValue={defaults.dateOfBirth} max={maxDob()} min="1900-01-02" required invalid={!!e.dateOfBirth} />
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Gender</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {GENDERS.map((g) => (
              <Choice key={g.value} name="gender" value={g.value} label={g.label} defaultChecked={defaults.gender === g.value} />
            ))}
          </div>
          <FieldError errors={e.gender} />
        </fieldset>

        <Field label="Short bio" htmlFor="bio" optional errors={e.bio}>
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(ev) => setBio(ev.target.value.slice(0, BIO_MAX))}
            maxLength={BIO_MAX}
            placeholder="Beginner runner looking for someone to run with after college. Always up for new sports!"
            invalid={!!e.bio}
          />
          <p className="mt-1 text-right text-xs text-mute" aria-live="polite">
            {bio.length}/{BIO_MAX}
          </p>
        </Field>
      </div>

      <fieldset id="contact" className="mt-8 scroll-mt-24 rounded-2xl bg-mist p-5">
        <legend className="sr-only">Contact details</legend>
        <p className="flex items-center gap-2 font-semibold">
          <Lock className="size-4" aria-hidden="true" /> Contact details
        </p>
        <p className="mt-1 text-sm text-mute">Only shared with people you connect with, so your matches can reach you.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" required errors={e.email} hint="From your account sign-in.">
            <Input id="email" type="email" value={defaults.email} readOnly required invalid={!!e.email} className="text-mute" />
          </Field>
          <Field label="Phone / WhatsApp" htmlFor="phone" required errors={e.phone}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98200 12345" defaultValue={defaults.phone} required invalid={!!e.phone} />
          </Field>
          <Field label="Instagram" htmlFor="instagram" optional errors={e.instagram}>
            <Input id="instagram" name="instagram" autoCapitalize="none" placeholder="yourhandle" defaultValue={defaults.instagram} invalid={!!e.instagram} leading={<span className="text-sm">@</span>} />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm">
          <input type="checkbox" name="shareEmail" defaultChecked={defaults.shareEmail} className="size-4.5 accent-ink" />
          Also share my account email with connections
        </label>
      </fieldset>

      <StepFooter backHref={backHref} pending={pending} edit={edit} submitLabel={completing ? "Complete profile" : undefined} />
    </form>
  );
}
