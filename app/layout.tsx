import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "KREW — Find your people. Move together.",
    template: "%s · KREW",
  },
  description:
    "KREW matches you with people nearby who share your sports, fitness goals, level and schedule — so you always have someone to run, lift or play with.",
  applicationName: "KREW",
  openGraph: {
    type: "website",
    siteName: "KREW",
    title: "KREW — Find your people. Move together.",
    description: "Meet people nearby who share your sports, goals and schedule.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "KREW — Find your people. Move together.",
    description: "Meet people nearby who share your sports, goals and schedule.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-dvh font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-lime focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
