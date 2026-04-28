import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Analytics from "@/components/Analytics";
import { Logo } from "@/components/ui/Logo";

const sansFont = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const displayFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-display",
  display: "swap",
});
const monoFont = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const fallbackSiteUrl = "https://scamradar.app";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || fallbackSiteUrl;
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
  themeColor: "#F7F8FA",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable}`}>
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

        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              background: "rgba(247,248,250,0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <div
              className="container"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 68,
              }}
            >
              <Link href="/" style={{ display: "inline-flex" }}>
                <Logo />
              </Link>
              <nav className="hidden md:flex" style={{ gap: 28, alignItems: "center" }}>
                <a href="/#product" style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 500 }}>Product</a>
                <a href="/#how-it-works" style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 500 }}>How it works</a>
                <Link href="/pricing" style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 500 }}>Pricing</Link>
                <Link href="/bot" style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 500 }}>API</Link>
              </nav>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link href="/account" className="btn btn-ghost btn-sm hidden sm:inline-flex">Sign in</Link>
                <a href="/#checker-card" className="btn btn-primary btn-sm">Run free check</a>
              </div>
            </div>
          </header>

          <main style={{ flex: 1 }}>{children}</main>

          <footer style={{ background: "var(--bg)", padding: "56px 0 32px" }}>
            <div
              className="container"
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                gap: 32,
                marginBottom: 40,
              }}
            >
              <div>
                <Logo />
                <p className="t-body-sm" style={{ marginTop: 16, maxWidth: 280 }}>
                  A scam check in 2 seconds. Paste, analyze, decide.
                </p>
              </div>

              <div>
                <div className="t-label" style={{ marginBottom: 12 }}>Product</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link href="/" style={{ color: "var(--ink-2)", fontSize: 14 }}>Checker</Link>
                  <Link href="/bot" style={{ color: "var(--ink-2)", fontSize: 14 }}>Bot API</Link>
                  <Link href="/pricing" style={{ color: "var(--ink-2)", fontSize: 14 }}>Pricing</Link>
                  <Link href="/examples" style={{ color: "var(--ink-2)", fontSize: 14 }}>Examples</Link>
                </div>
              </div>

              <div>
                <div className="t-label" style={{ marginBottom: 12 }}>Resources</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a href="/#how-it-works" style={{ color: "var(--ink-2)", fontSize: 14 }}>How it works</a>
                  <Link href="/examples" style={{ color: "var(--ink-2)", fontSize: 14 }}>Scam patterns</Link>
                  <a href="/#faq" style={{ color: "var(--ink-2)", fontSize: 14 }}>FAQ</a>
                  <Link href="/bot" style={{ color: "var(--ink-2)", fontSize: 14 }}>Developer docs</Link>
                </div>
              </div>

              <div>
                <div className="t-label" style={{ marginBottom: 12 }}>Company</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link href="/privacy" style={{ color: "var(--ink-2)", fontSize: 14 }}>Privacy</Link>
                  <Link href="/terms" style={{ color: "var(--ink-2)", fontSize: 14 }}>Terms</Link>
                  <a href="mailto:hello@scamradar.app" style={{ color: "var(--ink-2)", fontSize: 14 }}>Contact</a>
                  <a href="mailto:security@scamradar.app" style={{ color: "var(--ink-2)", fontSize: 14 }}>Security</a>
                </div>
              </div>
            </div>

            <div
              className="container"
              style={{
                borderTop: "1px solid var(--hairline)",
                paddingTop: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div className="t-body-sm">© {year} ScamRadar. All rights reserved.</div>
              <div className="t-body-sm">Built for safer transactions.</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
