import { ArrowRight, AtSign, Camera, Mail, MessageCircle, Phone } from "lucide-react";
import { instagramHref, telHref, whatsappHref } from "@/lib/contact";

type Contacts = { phone: string | null; instagram: string | null; email: string | null };

const linkClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink hover:bg-mist";

/** "View contact details" — a native disclosure so it works without JS and is keyboard accessible. */
export function ContactReveal({ name, contacts }: { name: string; contacts: Contacts }) {
  const has = Boolean(contacts.phone || contacts.instagram || contacts.email);
  return (
    <details className="group rounded-2xl">
      <summary className="flex h-13 cursor-pointer list-none items-center justify-center gap-2 rounded-xl bg-lime px-6 font-semibold text-ink transition-colors hover:bg-lime-deep [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">View contact details</span>
        <span className="hidden group-open:inline">Hide contact details</span>
        <ArrowRight className="size-4 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>

      <div className="mt-3 rounded-2xl bg-paper p-5 text-ink animate-[krew-rise_.2s_ease-out]">
        {has ? (
          <dl className="space-y-4">
            {contacts.phone ? (
              <div>
                <dt className="flex items-center gap-2 text-sm text-mute">
                  <Phone className="size-4" aria-hidden="true" /> Phone / WhatsApp
                </dt>
                <dd className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="mr-2 text-lg font-semibold">{contacts.phone}</span>
                  <a className={linkClass} href={telHref(contacts.phone)}>
                    <Phone className="size-4" aria-hidden="true" /> Call
                  </a>
                  <a className={linkClass} href={whatsappHref(contacts.phone)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
                  </a>
                </dd>
              </div>
            ) : null}
            {contacts.instagram ? (
              <div>
                <dt className="flex items-center gap-2 text-sm text-mute">
                  <Camera className="size-4" aria-hidden="true" /> Instagram
                </dt>
                <dd className="mt-1">
                  <a className={`${linkClass} -ml-2.5 text-lg`} href={instagramHref(contacts.instagram)} target="_blank" rel="noopener noreferrer">
                    <AtSign className="size-4" aria-hidden="true" />
                    {contacts.instagram}
                  </a>
                </dd>
              </div>
            ) : null}
            {contacts.email ? (
              <div>
                <dt className="flex items-center gap-2 text-sm text-mute">
                  <Mail className="size-4" aria-hidden="true" /> Email
                </dt>
                <dd className="mt-1">
                  <a className={`${linkClass} -ml-2.5 text-lg break-all`} href={`mailto:${contacts.email}`}>
                    {contacts.email}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="text-[15px] leading-relaxed text-mute">
            {name} hasn&apos;t added contact details yet. We&apos;ve kept your connection — check back soon, and make sure your own
            contact details are up to date in your profile.
          </p>
        )}
        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-mute">
          Meet in a public place for your first session and let a friend know your plans.
        </p>
      </div>
    </details>
  );
}
