import type { Metadata } from "next";
import { LegalDoc } from "@/components/marketing/legal";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What information KREW collects, how it's used for matching, and who can see it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" updated="27 September 2026">
      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email address and password (stored securely by our authentication provider), or your Google profile if you sign in with Google.</li>
        <li>Profile details: date of birth, gender, optional profile picture and optional bio.</li>
        <li>Matching details: pincode and approximate location, preferred travel distance, activities, goals, fitness level, availability and matching preferences.</li>
        <li>Optional contact details you choose to add: phone/WhatsApp number, Instagram username, and whether to share your account email.</li>
        <li>Connection activity: requests you send, accept, decline or skip.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        We use this information to suggest compatible people nearby, show approximate distance and estimated travel time, and manage
        connection requests. We don&apos;t sell your personal information.
      </p>
      <h2>Who can see what</h2>
      <ul>
        <li>Other members who match your preferences can see your name, age, profile picture, bio, area, activities, goals, fitness level, availability and approximate distance.</li>
        <li>Your date of birth, exact coordinates and pincode are never shown to other members.</li>
        <li>Your contact details are only shown to people you&apos;re connected with. If you chose &ldquo;ask me first&rdquo;, that only happens after you accept their request.</li>
      </ul>
      <h2>Service providers</h2>
      <p>
        KREW is hosted on Vercel and uses Supabase for authentication, database and file storage. Pincodes are converted to approximate
        coordinates using OpenStreetMap&apos;s Nominatim service, and location maps are displayed from OpenStreetMap.
      </p>
      <h2>Your choices</h2>
      <ul>
        <li>Edit or remove optional profile and contact details at any time from your Profile page.</li>
        <li>To delete your account and data, email us and we&apos;ll process the request.</li>
      </ul>
      <h2>Contact</h2>
      <p>
        Email{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>{" "}
        with any privacy questions.
      </p>
    </LegalDoc>
  );
}
