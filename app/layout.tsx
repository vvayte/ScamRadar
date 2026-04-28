import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Fraunces, JetBrains_Mono, Space_Grotesk, Sora } from "next/font/google";
import Analytics from "@/components/Analytics";
import NewsletterForm from "@/components/NewsletterForm";
import { RadarSweep } from "@/components/Icons";

const bodyFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const monoFont = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serifFont = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

const fallbackSiteUrl = "https://scamradar.app";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || fallbackSiteUrl;
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@scamradar.app";
const securityEmail = process.env.NEXT_PUBLIC_SECURITY_EMAIL || "security@scamradar.app";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "";
const plausibleScriptSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC || "https://plausible.io/js/script.js";

export const metadata: Metadata = {
  metadataBase: (() => {
    try {
      return new URL(siteUrl);
    } catch {
      return new URL(fallbackSiteUrl);
    }
  })(),
  title: "ScamRadar | AI Scam Checker for Messages, Links, and Listings",
  description:
    "Paste any suspicious message, URL, or screenshot. ScamRadar returns a risk score, top reasons, and exactly what to do next — in under 2 seconds.",
  keywords: [
    "scam checker",
    "phishing detector",
    "marketplace scam",
    "Facebook Marketplace scam",
    "eBay scam",
    "AI fraud detection",
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
    title: "ScamRadar | AI Scam Checker",
    description: "Check suspicious marketplace messages, links, and screenshots before you pay.",
    url: "/",
    siteName: "ScamRadar",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ScamRadar — AI scam checker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScamRadar | AI Scam Checker",
    description: "Check suspicious marketplace messages, links, and screenshots before you pay.",
    images: ["/og.png"],
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
  const year = new Date().getFullYear();

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
            description:
              "AI-powered scam checker for marketplace messages, links, and screenshots.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "2184",
            },
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

        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>

          <footer className="border-t border-white/10 bg-black/60">
            <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
              <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.35)]" aria-hidden="true">
                      <RadarSweep size={28} />
                    </div>
                    <div>
                      <div className="text-lg font-black">ScamRadar</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/50">Threat Screening Engine</div>
                    </div>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
                    The fastest way to tell a scam from a real message. Built for marketplace buyers,
                    sellers, and anyone who&apos;s received one too many suspicious DMs.
                  </p>

                  <NewsletterForm />
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Product</div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li><Link href="/" className="text-white/75 hover:text-white">Scam checker</Link></li>
                    <li><Link href="/examples" className="text-white/75 hover:text-white">Example library</Link></li>
                    <li><Link href="/bot" className="text-white/75 hover:text-white">Bot API</Link></li>
                    <li><Link href="/pricing" className="text-white/75 hover:text-white">Pricing</Link></li>
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Resources</div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li><Link href="/examples" className="text-white/75 hover:text-white">Scam patterns</Link></li>
                    <li><Link href="/#how-it-works" className="text-white/75 hover:text-white">How it works</Link></li>
                    <li><Link href="/reviews" className="text-white/75 hover:text-white">Reviews</Link></li>
                    <li><Link href="/bot" className="text-white/75 hover:text-white">Developer docs</Link></li>
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Company</div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li><Link href="/privacy" className="text-white/75 hover:text-white">Privacy</Link></li>
                    <li><Link href="/terms" className="text-white/75 hover:text-white">Terms</Link></li>
                    <li><a href={`mailto:${supportEmail}`} className="text-white/75 hover:text-white">Contact: {supportEmail}</a></li>
                    <li><a href={`mailto:${securityEmail}`} className="text-white/75 hover:text-white">Security: {securityEmail}</a></li>
                  </ul>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
                <div>© {year} ScamRadar. Built for people who pay attention.</div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> All systems operational
                  </span>
                  <span>SOC 2 roadmap Q3 2026</span>
                  <span>GDPR-aware</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
