/** Default country calling code used to build WhatsApp links for local numbers (India). */
const DEFAULT_COUNTRY_CODE = "91";

export function phoneDigits(phone: string) {
  return phone.replace(/[^0-9+]/g, "");
}

export function telHref(phone: string) {
  return `tel:${phoneDigits(phone)}`;
}

export function whatsappHref(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (!phone.trim().startsWith("+") && digits.length === 10) digits = DEFAULT_COUNTRY_CODE + digits;
  return `https://wa.me/${digits}`;
}

export function instagramHref(handle: string) {
  return `https://www.instagram.com/${encodeURIComponent(handle.replace(/^@/, ""))}/`;
}
