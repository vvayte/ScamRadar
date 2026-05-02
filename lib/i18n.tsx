"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ru";

type Dict = Record<string, { en: string; ru: string }>;

const DICT: Dict = {
  // Header
  "nav.pricing": { en: "Pricing", ru: "Цены" },
  "nav.login": { en: "Log in", ru: "Войти" },
  "nav.signup": { en: "Sign up", ru: "Регистрация" },

  // Hero
  "hero.badge": { en: "AI-assisted scam screening", ru: "AI-проверка мошенничества" },
  "hero.title.1": { en: "Check suspicious messages", ru: "Проверяй подозрительные сообщения" },
  "hero.title.2": { en: "before you click or pay.", ru: "до клика и оплаты." },
  "hero.subtitle": {
    en: "Paste a message, link, or screenshot. ScamRadar highlights warning signs and gives you a clear next step.",
    ru: "Вставь сообщение, ссылку или скриншот — ScamRadar подсветит тревожные сигналы и подскажет, что делать.",
  },
  "hero.cta.signup": { en: "Sign up free", ru: "Начать бесплатно" },
  "hero.cta.login": { en: "Log in", ru: "Войти" },
  "hero.note": {
    en: "Includes limited free checks. AI-assisted analysis, not a guarantee.",
    ru: "Бесплатные проверки включены. AI-анализ — не гарантия.",
  },

  // Demo card
  "demo.window": { en: "scamradar — sample", ru: "scamradar — пример" },
  "demo.message": {
    en: "“DHL: your package is held at customs. Pay the £2.99 release fee within 24h: dhl-pay-uk-secure.co/release”",
    ru: "«DHL: посылка на таможне. Оплати £2.99 за выпуск в течение 24ч: dhl-pay-uk-secure.co/release»",
  },
  "demo.risk": { en: "Risk", ru: "Риск" },
  "demo.high": { en: "High", ru: "Высокий" },
  "demo.signal.1": { en: "Look-alike domain — not the real DHL host", ru: "Домен-подделка — это не настоящий DHL" },
  "demo.signal.2": { en: "Time pressure (“within 24h”) is a manipulation tactic", ru: "Давление временем («24ч») — манипуляция" },
  "demo.signal.3": { en: "Asks you to pay via an unfamiliar URL", ru: "Просит оплатить по незнакомой ссылке" },
  "demo.next": { en: "Next step", ru: "Что делать" },
  "demo.next.body": {
    en: "Don’t pay. Open dhl.com directly and check the tracking number, then delete the message.",
    ru: "Не плати. Открой dhl.com напрямую, проверь трек и удали сообщение.",
  },
  "demo.disclaimer": {
    en: "Illustration only. AI-assisted analysis — not a guarantee.",
    ru: "Только пример. AI-анализ — не гарантия.",
  },

  // Sections
  "what.kicker": { en: "What you get", ru: "Что внутри" },
  "what.title": { en: "A second opinion in seconds", ru: "Второе мнение за секунды" },
  "what.1.t": { en: "Message, link & screenshot checks", ru: "Текст, ссылка или скриншот" },
  "what.1.b": { en: "Paste text, drop a URL, or upload a screenshot. ScamRadar reads them all.", ru: "Вставь текст, ссылку или загрузи скриншот — ScamRadar разберёт всё." },
  "what.2.t": { en: "Plain-English risk explanations", ru: "Объяснения простыми словами" },
  "what.2.b": { en: "No jargon. Just what looks off, and why it matters for your next step.", ru: "Без жаргона. Что подозрительно и почему это важно." },
  "what.3.t": { en: "History & watchlist in your dashboard", ru: "История и список наблюдения" },
  "what.3.b": { en: "Your past checks and flagged senders, kept in your account.", ru: "Прошлые проверки и помеченные отправители — в твоём аккаунте." },

  "how.kicker": { en: "How it works", ru: "Как это работает" },
  "how.title": { en: "Three steps to your next deal", ru: "Три шага до спокойной сделки" },
  "how.1.t": { en: "Create an account", ru: "Создай аккаунт" },
  "how.1.b": { en: "Free to start. Email and password — that’s it.", ru: "Старт бесплатный. Email и пароль — всё." },
  "how.2.t": { en: "Paste a message, link, or screenshot", ru: "Вставь сообщение, ссылку или скриншот" },
  "how.2.b": { en: "Inside your dashboard, the checker takes any of the three.", ru: "В кабинете чекер принимает любой из трёх форматов." },
  "how.3.t": { en: "Get risk signals and safer next steps", ru: "Получи сигналы и безопасный план" },
  "how.3.b": { en: "Plain-English breakdown plus what to do next.", ru: "Простой разбор плюс что делать дальше." },

  "pricing.kicker": { en: "Pricing", ru: "Цены" },
  "pricing.title": { en: "Start free. Upgrade when you need more.", ru: "Начни бесплатно. Расширяй когда нужно." },
  "pricing.free.k": { en: "Free", ru: "Бесплатно" },
  "pricing.free.v": { en: "2 checks", ru: "2 проверки" },
  "pricing.free.b": { en: "Limited free checks to try the product. No card needed.", ru: "Бесплатные проверки чтобы попробовать. Карта не нужна." },
  "pricing.monthly.k": { en: "Shield Monthly", ru: "Shield Месяц" },
  "pricing.monthly.b": { en: "Unlimited checks, full forensic breakdown, history & watchlist.", ru: "Безлимит проверок, полный разбор, история и наблюдение." },
  "pricing.yearly.k": { en: "Shield Yearly", ru: "Shield Год" },
  "pricing.yearly.b": { en: "Same as monthly, billed once a year.", ru: "То же что и месячный, но раз в год." },
  "pricing.see": { en: "See full pricing →", ru: "Все тарифы →" },
  "pricing.per.mo": { en: "/mo", ru: "/мес" },
  "pricing.per.yr": { en: "/yr", ru: "/год" },

  "final.title": { en: "Ready to check suspicious messages safely?", ru: "Готов проверять подозрительные сообщения?" },
  "final.create": { en: "Create account", ru: "Создать аккаунт" },

  // Login page
  "login.title": { en: "Welcome back", ru: "С возвращением" },
  "login.subtitle": { en: "Sign in to your ScamRadar account.", ru: "Войди в свой аккаунт ScamRadar." },
  "login.email": { en: "Email", ru: "Email" },
  "login.password": { en: "Password", ru: "Пароль" },
  "login.submit": { en: "Sign in", ru: "Войти" },
  "login.submitting": { en: "Signing in…", ru: "Входим…" },
  "login.failed": { en: "Login failed. Please try again.", ru: "Не удалось войти. Попробуй ещё раз." },
  "login.no_account": { en: "Don’t have an account?", ru: "Нет аккаунта?" },
  "login.create": { en: "Create one", ru: "Создать" },
  "login.forgot": { en: "Forgot password?", ru: "Забыл пароль?" },

  // Signup page
  "signup.title": { en: "Create your account", ru: "Создание аккаунта" },
  "signup.subtitle": { en: "Free to start. Limited free checks included.", ru: "Старт бесплатный. Бесплатные проверки включены." },
  "signup.email": { en: "Email", ru: "Email" },
  "signup.password": { en: "Password", ru: "Пароль" },
  "signup.confirm": { en: "Confirm password", ru: "Подтверди пароль" },
  "signup.mismatch": { en: "Passwords don’t match.", ru: "Пароли не совпадают." },
  "signup.submit": { en: "Create account", ru: "Создать аккаунт" },
  "signup.submitting": { en: "Creating…", ru: "Создаём…" },
  "signup.failed": { en: "Registration failed. Please try again.", ru: "Не удалось создать аккаунт. Попробуй ещё раз." },
  "signup.terms": { en: "By signing up you agree to our", ru: "Регистрируясь, ты соглашаешься с" },
  "signup.and": { en: "and", ru: "и" },
  "signup.have_account": { en: "Already have an account?", ru: "Уже есть аккаунт?" },
  "signup.signin": { en: "Sign in", ru: "Войти" },

  // Pricing page
  "pp.kicker": { en: "Pricing", ru: "Цены" },
  "pp.title.1": { en: "Simple plans.", ru: "Простые тарифы." },
  "pp.title.2": { en: "Cancel anytime.", ru: "Отмена в любой момент." },
  "pp.subtitle": {
    en: "Start free. Upgrade when you need more. Promo codes accepted at checkout.",
    ru: "Старт бесплатный. Апгрейд — когда нужно больше. Промокоды на оплате.",
  },
  "pp.single.k": { en: "Single check", ru: "Одна проверка" },
  "pp.single.b": { en: "One urgent answer when you need it now. No subscription.", ru: "Одна срочная проверка. Без подписки." },
  "pp.single.cta": { en: "Buy single check", ru: "Купить проверку" },
  "pp.monthly.k": { en: "Shield Monthly", ru: "Shield Месяц" },
  "pp.monthly.tag": { en: "Most popular", ru: "Популярный" },
  "pp.monthly.b": { en: "Unlimited checks, full forensic breakdown, history & watchlist.", ru: "Безлимит проверок, полный разбор, история и наблюдение." },
  "pp.monthly.cta": { en: "Subscribe monthly", ru: "Подписка на месяц" },
  "pp.yearly.k": { en: "Shield Yearly", ru: "Shield Год" },
  "pp.yearly.tag": { en: "Best value", ru: "Выгодно" },
  "pp.yearly.b": { en: "Same as monthly, billed once a year. Save vs paying monthly.", ru: "То же, но раз в год. Дешевле, чем платить помесячно." },
  "pp.yearly.cta": { en: "Subscribe yearly", ru: "Подписка на год" },
  "pp.feat.unlimited": { en: "Unlimited full checks", ru: "Безлимит полных проверок" },
  "pp.feat.forensic": { en: "Forensic report unlocked", ru: "Полный разбор" },
  "pp.feat.history": { en: "History & watchlist", ru: "История и наблюдение" },
  "pp.feat.priority": { en: "Priority support", ru: "Приоритетная поддержка" },
  "pp.feat.promo": { en: "Promo codes at checkout", ru: "Промокоды на оплате" },
  "pp.feat.score": { en: "Risk score with full reasons", ru: "Оценка риска с пояснением" },
  "pp.feat.advice": { en: "Action advice included", ru: "Советы что делать" },
  "pp.note": {
    en: "Stripe handles payment securely. Subscriptions renew automatically at the listed price unless cancelled.",
    ru: "Stripe обрабатывает оплату безопасно. Подписка продлевается автоматически, пока не отменишь.",
  },
  "pp.error": { en: "Unable to start checkout. Please try again.", ru: "Не удалось открыть оплату. Попробуй ещё раз." },
  "pp.redirecting": { en: "Redirecting…", ru: "Перенаправляем…" },
  "pp.per.mo": { en: "/mo", ru: "/мес" },
  "pp.per.yr": { en: "/yr", ru: "/год" },

  // Dashboard sidebar
  "side.dashboard": { en: "Dashboard", ru: "Главная" },
  "side.checker": { en: "Checker", ru: "Проверка" },
  "side.history": { en: "History", ru: "История" },
  "side.watchlist": { en: "Watchlist", ru: "Наблюдение" },
  "side.billing": { en: "Billing", ru: "Оплата" },
  "side.settings": { en: "Settings", ru: "Настройки" },
  "side.signout": { en: "Sign out", ru: "Выйти" },
  "side.usage": { en: "Usage", ru: "Использование" },
  "side.unlimited": { en: "Unlimited", ru: "Безлимит" },
  "side.checks_left": { en: "checks left", ru: "проверок осталось" },
  "side.upgrade": { en: "Upgrade", ru: "Тариф" },

  // Footer
  "footer.disclaimer": {
    en: "ScamRadar provides AI-assisted risk analysis, not a guarantee. Verify through official channels before sending money or personal data.",
    ru: "ScamRadar даёт AI-оценку риска, а не гарантию. Проверяй через официальные каналы прежде чем переводить деньги или личные данные.",
  },
  "footer.privacy": { en: "Privacy", ru: "Конфиденциальность" },
  "footer.terms": { en: "Terms", ru: "Условия" },
  "footer.contact": { en: "Contact", ru: "Контакты" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sr_lang") as Lang | null;
      if (saved === "en" || saved === "ru") {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("sr_lang", l);
      document.documentElement.lang = l;
    } catch {}
  };

  const t = (key: keyof typeof DICT) => DICT[key]?.[lang] ?? String(key);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback when used outside provider — return english
    return {
      lang: "en" as Lang,
      setLang: () => {},
      t: (key: keyof typeof DICT) => DICT[key]?.en ?? String(key),
    };
  }
  return ctx;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-white/12 bg-white/[0.04] p-0.5 text-xs font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-md px-2.5 py-1 transition ${
          lang === "en" ? "bg-white text-[#04080d]" : "text-white/65 hover:text-white"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ru")}
        className={`rounded-md px-2.5 py-1 transition ${
          lang === "ru" ? "bg-white text-[#04080d]" : "text-white/65 hover:text-white"
        }`}
        aria-pressed={lang === "ru"}
      >
        RU
      </button>
    </div>
  );
}
