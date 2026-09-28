import { z } from "zod";
import { BIO_MAX, CUSTOM_TAG_MAX, MAX_GOALS, MIN_AGE } from "./constants";

const trimmed = (max: number) => z.string().trim().max(max);

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80, "Use 80 characters or fewer."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.literal("on", { message: "Accept the Terms of Service and Privacy Policy to continue." }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match." });

export const pincodeSchema = z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode.");

export const locationSchema = z.object({
  pincode: pincodeSchema,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  areaName: trimmed(120).optional().transform((v) => v || null),
  city: trimmed(120).optional().transform((v) => v || null),
  travelRadius: z.enum(["1_2_km", "2_5_km", "5_plus_km"], { message: "Choose how far you're willing to travel." }),
});

const customTag = z
  .string()
  .trim()
  .max(CUSTOM_TAG_MAX, `Use ${CUSTOM_TAG_MAX} characters or fewer.`)
  .refine((v) => v === "" || v.length >= 2, "Use at least 2 characters.")
  .refine((v) => v === "" || /^[\p{L}\p{N} &'./+-]+$/u.test(v), "Use letters, numbers and simple punctuation only.");

export const activitiesSchema = z
  .object({
    activities: z.array(z.string().regex(/^[a-z0-9_]{2,40}$/)).max(20),
    other: z.boolean(),
    customActivity: customTag,
  })
  .superRefine((d, ctx) => {
    if (d.other && !d.customActivity) {
      ctx.addIssue({ code: "custom", path: ["customActivity"], message: "Type the activity you do." });
    }
    if (d.activities.length === 0 && !(d.other && d.customActivity)) {
      ctx.addIssue({ code: "custom", path: ["activities"], message: "Pick at least one activity." });
    }
  });

export const goalsSchema = z
  .object({
    goals: z.array(z.string().regex(/^[a-z0-9_]{2,40}$/)).max(MAX_GOALS),
    other: z.boolean(),
    customGoal: customTag,
    fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], { message: "Choose your fitness level." }),
    availability: z
      .array(z.enum(["morning", "afternoon", "evening", "weekends"]))
      .min(1, "Pick at least one time you like to work out."),
  })
  .superRefine((d, ctx) => {
    if (d.other && !d.customGoal) {
      ctx.addIssue({ code: "custom", path: ["customGoal"], message: "Type your goal." });
    }
    const total = d.goals.length + (d.other && d.customGoal ? 1 : 0);
    if (total === 0) ctx.addIssue({ code: "custom", path: ["goals"], message: "Pick at least one goal." });
    if (total > MAX_GOALS) ctx.addIssue({ code: "custom", path: ["goals"], message: `Pick up to ${MAX_GOALS} goals.` });
  });

export const preferencesSchema = z.object({
  genderPreference: z.enum(["same_gender", "no_preference"], { message: "Choose who you'd like to match with." }),
  requireApproval: z.enum(["yes", "no"], { message: "Choose how contact details are shared." }),
});

function ageOn(dob: Date, today = new Date()) {
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(80, "Use 80 characters or fewer."),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth.")
    .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), "Enter a valid date.")
    .refine((v) => new Date(`${v}T00:00:00Z`) <= new Date(), "Date of birth can't be in the future.")
    .refine((v) => new Date(`${v}T00:00:00Z`).getUTCFullYear() > 1900, "Enter a valid date.")
    .refine((v) => ageOn(new Date(`${v}T00:00:00`)) >= MIN_AGE, `You need to be ${MIN_AGE} or older to use KREW.`),
  gender: z.enum(["woman", "man", "non_binary", "other"], { message: "Choose your gender." }),
  bio: z.string().trim().max(BIO_MAX, `Keep your bio to ${BIO_MAX} characters.`),
  avatarPath: z.string().max(300),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9][0-9 ]{6,17}$/.test(v), "Enter a valid phone number, e.g. +91 98200 12345."),
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, ""))
    .refine((v) => v === "" || /^[A-Za-z0-9._]{1,30}$/.test(v), "Enter a valid Instagram username."),
  shareEmail: z.boolean(),
});

export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
