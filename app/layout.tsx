import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, JetBrains_Mono, Space_Grotesk, Sora } from "next/font/google";
import Analytics from "@/components/Analytics";
import { I18nProvider } from "@/lib/i18n";

const bodyFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const monoFont = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serifFont = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

// Hardcoded absolute production URL so social link previews and canonicals
// always resolve correctly, regardless of any NEXT_PUBLIC_APP_URL drift.
const PROD_URL = "https://www.scamradar.pro";
const OG_IMAGE = `${PROD_URL}/og-image.png`;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "";
const plausibleScriptSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC || "https://plausible.io/js/script.js";

const ogTitle = "ScamRadar - AI scam checker for links & screenshots";
const ogDescription =
  "Check suspicious messages, links, and screenshots before you click or pay. Paste it. Score it. Decide before you pay.";

export const metadata: Metadata = {
  metadataBase: new URL(PROD_URL),
  title: {
    default: ogTitle,
    template: "%s | ScamRadar",
  },
  description: ogDescription,
  keywords: [
    "scam checker",
    "phishing detector",
    "marketplace scam",
    "AI fraud detection",
    "message safety",
    "link checker",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "ScamRadar",
    title: ogTitle,
    description: ogDescription,
    url: PROD_URL,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        secureUrl: OG_IMAGE,
        type: "image/png",
        width: 1200,
        height: 630,
        alt: "ScamRadar - AI scam checker. Risk score 94/100, HIGH RISK.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScamRadar - AI scam checker",
    description: ogDescription,
    images: [
      {
        url: OG_IMAGE,
        alt: "ScamRadar - AI scam checker. Risk score 94/100, HIGH RISK.",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#04080d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} ${serifFont.variable}`}>
      <body>
        <Script id="org-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ScamRadar",
            applicationCategory: "SecurityApplication",
            operatingSystem: "Web",
            url: PROD_URL,
            description:
              "AI-assisted scam checker for suspicious messages, links, and screenshots.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          })}
        </Script>

        {gaMeasurementId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { send_page_view: false });
              `}
            </Script>
            <Analytics />
          </>
        ) : null}

        {plausibleDomain ? (
          <Script defer data-domain={plausibleDomain} src={plausibleScriptSrc} strategy="afterInteractive" />
        ) : null}

        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
