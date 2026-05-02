"use client";

import Link from "next/link";
import { RadarSweep } from "./Icons";
import { LanguageToggle, useT } from "@/lib/i18n";

export default function PublicHeader() {
  const { t } = useT();
  return (
    <header className="border-b border-white/8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-500/15">
            <RadarSweep size={20} />
          </span>
          <span className="text-base font-bold tracking-tight">ScamRadar</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-3">
          <LanguageToggle className="mr-1" />
          <Link
            href="/pricing"
            className="hidden rounded-lg px-3 py-2 text-sm text-white/70 transition hover:text-white sm:inline-flex"
          >
            {t("nav.pricing")}
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:text-white"
          >
            {t("nav.login")}
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#04080d] transition hover:bg-white/90"
          >
            {t("nav.signup")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
