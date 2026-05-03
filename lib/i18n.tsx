"use client";

import { createContext, useContext, type ReactNode } from "react";

// English-only after the May 2026 i18n simplification.
// Russian was removed; the LanguageToggle is kept as a no-op export so any
// lingering imports keep compiling, but it renders nothing.
export type Lang = "en";

type Dict = Record<string, string>;

const DICT: Dict = {
  // Header
  "nav.pricing": "Pricing",
  "nav.login": "Log in",
  "nav.signup": "Sign up",

  // Hero
  "hero.badge": "AI-assisted scam screening",
  "hero.title.1": "Check suspicious messages",
  "hero.title.2": "before you click or pay.",
  "hero.subtitle":
    "Paste a message, link, or screenshot. ScamRadar highlights warning signs and gives you a clear next step.",
  "hero.cta.signup": "Sign up free",
  "hero.cta.login": "Log in",
  "hero.note": "Includes limited free checks. AI-assisted analysis, not a guarantee.",

  // Demo card
  "demo.window": "scamradar - sample",
  "demo.message":
    "\"DHL: your package is held at customs. Pay the GBP 2.99 release fee within 24h: dhl-pay-uk-secure.co/release\"",
  "demo.risk": "Risk",
  "demo.high": "High",
  "demo.signal.1": "Look-alike domain - not the real DHL host",
  "demo.signal.2": "Time pressure (within 24h) is a manipulation tactic",
  "demo.signal.3": "Asks you to pay via an unfamiliar URL",
  "demo.next": "Next step",
  "demo.next.body":
    "Don't pay. Open dhl.com directly and check the tracking number, then delete the message.",
  "demo.disclaimer": "Illustration only. AI-assisted analysis - not a guarantee.",

  // Sections
  "what.kicker": "What you get",
  "what.title": "A second opinion in seconds",
  "what.1.t": "Message, link & screenshot checks",
  "what.1.b": "Paste text, drop a URL, or upload a screenshot. ScamRadar reads them all.",
  "what.2.t": "Plain-English risk explanations",
  "what.2.b": "No jargon. Just what looks off, and why it matters for your next step.",
  "what.3.t": "History & watchlist in your dashboard",
  "what.3.b": "Your past checks and flagged senders, kept in your account.",

  "how.kicker": "How it works",
  "how.title": "Three steps to your next deal",
  "how.1.t": "Create an account",
  "how.1.b": "Free to start. Email and password - that's it.",
  "how.2.t": "Paste a message, link, or screenshot",
  "how.2.b": "Inside your dashboard, the checker takes any of the three.",
  "how.3.t": "Get risk signals and safer next steps",
  "how.3.b": "Plain-English breakdown plus what to do next.",

  "pricing.kicker": "Pricing",
  "pricing.title": "Start free. Upgrade when you need more.",
  "pricing.free.k": "Free",
  "pricing.free.v": "2 checks",
  "pricing.free.b": "Limited free checks to try the product. No card needed.",
  "pricing.monthly.k": "Shield Monthly",
  "pricing.monthly.b": "Unlimited checks, full forensic breakdown, history & watchlist.",
  "pricing.yearly.k": "Shield Yearly",
  "pricing.yearly.b": "Same as monthly, billed once a year.",
  "pricing.see": "See full pricing ->",
  "pricing.per.mo": "/mo",
  "pricing.per.yr": "/yr",

  "final.title": "Ready to check suspicious messages safely?",
  "final.create": "Create account",

  // Login page
  "login.title": "Welcome back",
  "login.subtitle": "Sign in to your ScamRadar account.",
  "login.email": "Email",
  "login.password": "Password",
  "login.submit": "Sign in",
  "login.submitting": "Signing in...",
  "login.failed": "Login failed. Please try again.",
  "login.no_account": "Don't have an account?",
  "login.create": "Create one",
  "login.forgot": "Forgot password?",

  // Signup page
  "signup.title": "Create your account",
  "signup.subtitle": "Free to start. Limited free checks included.",
  "signup.email": "Email",
  "signup.password": "Password",
  "signup.confirm": "Confirm password",
  "signup.mismatch": "Passwords don't match.",
  "signup.submit": "Create account",
  "signup.submitting": "Creating...",
  "signup.failed": "Registration failed. Please try again.",
  "signup.terms": "By signing up you agree to our",
  "signup.and": "and",
  "signup.have_account": "Already have an account?",
  "signup.signin": "Sign in",

  // Pricing page
  "pp.kicker": "Pricing",
  "pp.title.1": "Simple plans.",
  "pp.title.2": "Cancel anytime.",
  "pp.subtitle": "Start free. Upgrade when you need more. Promo codes accepted at checkout.",
  // Lifetime (replaces the legacy single-check tier)
  "pp.lifetime.k": "Shield Lifetime",
  "pp.lifetime.tag": "Pay once",
  "pp.lifetime.b": "One payment. Unlimited checks forever - no renewals, no surprises.",
  "pp.lifetime.cta": "Get Lifetime",
  "pp.monthly.k": "Shield Monthly",
  "pp.monthly.tag": "Most popular",
  "pp.monthly.b": "Unlimited checks, full forensic breakdown, history & watchlist.",
  "pp.monthly.cta": "Subscribe monthly",
  "pp.yearly.k": "Shield Yearly",
  "pp.yearly.tag": "Best value",
  "pp.yearly.b": "Same as monthly, billed once a year. Save vs paying monthly.",
  "pp.yearly.cta": "Subscribe yearly",
  "pp.feat.unlimited": "Unlimited full checks",
  "pp.feat.forensic": "Forensic report unlocked",
  "pp.feat.history": "History & watchlist",
  "pp.feat.priority": "Priority support",
  "pp.feat.promo": "Promo codes at checkout",
  "pp.feat.score": "Risk score with full reasons",
  "pp.feat.advice": "Action advice included",
  "pp.feat.lifetime": "Lifetime access - no renewals",
  "pp.note":
    "Stripe handles payment securely. Subscriptions renew automatically at the listed price unless cancelled.",
  "pp.error": "Unable to start checkout. Please try again.",
  "pp.redirecting": "Redirecting...",
  "pp.per.mo": "/mo",
  "pp.per.yr": "/yr",
  "pp.once": "one-time",

  // Dashboard sidebar
  "side.dashboard": "Dashboard",
  "side.checker": "Checker",
  "side.history": "History",
  "side.watchlist": "Watchlist",
  "side.billing": "Billing",
  "side.settings": "Settings",
  "side.signout": "Sign out",
  "side.usage": "Usage",
  "side.unlimited": "Unlimited",
  "side.checks_left": "checks left",
  "side.upgrade": "Upgrade",

  // Footer
  "footer.disclaimer":
    "ScamRadar provides AI-assisted risk analysis, not a guarantee. Verify through official channels before sending money or personal data.",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.contact": "Contact",
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const value: Ctx = {
    lang: "en",
    setLang: () => {},
    t: (key) => DICT[key] ?? String(key),
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      lang: "en" as Lang,
      setLang: () => {},
      t: (key: keyof typeof DICT) => DICT[key] ?? String(key),
    };
  }
  return ctx;
}

/**
 * No-op kept so existing imports keep compiling. Russian was removed in May
 * 2026, so there is no longer a language to toggle. Safe to delete every
 * <LanguageToggle /> usage when convenient.
 */
export function LanguageToggle(_props: { className?: string }) {
  return null;
}
