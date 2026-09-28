import type { Metadata } from "next";
import { LegalDoc } from "@/components/marketing/legal";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use KREW to find people to work out with.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated="27 September 2026">
      <h2>1. About KREW</h2>
      <p>
        KREW is a website that helps adults find people nearby to exercise and play sport with, based on shared activities, goals,
        fitness level, schedule and location. By creating an account you agree to these terms.
      </p>
      <h2>2. Eligibility</h2>
      <p>You must be at least 18 years old to create an account. You must give accurate information about yourself, including your date of birth and gender.</p>
      <h2>3. Your account</h2>
      <ul>
        <li>Keep your login details secure and don&apos;t share your account.</li>
        <li>You&apos;re responsible for activity that happens under your account.</li>
        <li>You can update your profile at any time from the Profile page.</li>
      </ul>
      <h2>4. Meeting people safely</h2>
      <p>
        KREW introduces people; it does not screen, supervise or verify users or the activities they arrange. Meet in public places,
        tell someone where you&apos;re going, and only share contact details you&apos;re comfortable sharing. Exercise within your own
        limits and consult a medical professional where appropriate.
      </p>
      <h2>5. Acceptable use</h2>
      <ul>
        <li>No harassment, hate speech, threats, impersonation or sexual content.</li>
        <li>No commercial solicitation, spam or scraping of other users&apos; information.</li>
        <li>Don&apos;t use contact details shared with you for anything other than arranging activities with that person.</li>
      </ul>
      <h2>6. Suspension</h2>
      <p>We may suspend or remove accounts that break these terms or put other people at risk.</p>
      <h2>7. Liability</h2>
      <p>
        KREW is provided &ldquo;as is&rdquo;. To the extent permitted by law, KREW is not liable for the conduct of users or for injuries or
        losses arising from activities arranged through the service.
      </p>
      <h2>8. Changes and contact</h2>
      <p>
        We may update these terms and will show the date of the latest version on this page. Questions? Email{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </LegalDoc>
  );
}
