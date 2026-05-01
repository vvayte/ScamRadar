"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RadarSweep } from "@/components/Icons";

type NavLink = { href: string; label: string };

const NAV: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/checker", label: "Checker" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

type Usage = {
  premium: boolean;
  credits: number;
  count: number;
  freeLimit: number;
};

export default function DashboardSidebar({
  email,
  usage,
}: {
  email: string;
  usage: Usage;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);

  const remainingFree = Math.max(0, usage.freeLimit - usage.count);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-500/15">
            <RadarSweep size={18} />
          </span>
          <span className="text-sm font-bold">ScamRadar</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} border-b border-white/8 bg-[#070d14] md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r`}
      >
        <div className="hidden items-center gap-2.5 px-5 py-5 md:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-500/15">
            <RadarSweep size={20} />
          </span>
          <span className="text-base font-bold text-white">ScamRadar</span>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-2 md:flex-1">
          {NAV.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-white/[0.06] text-white"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 px-3 py-4">
          <div className="rounded-lg bg-white/[0.03] px-3 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Usage</div>
            <div className="mt-1 text-sm font-semibold text-white">
              {usage.premium
                ? "Shield active"
                : usage.credits > 0
                  ? `${usage.credits} paid check${usage.credits === 1 ? "" : "s"}`
                  : `${remainingFree} / ${usage.freeLimit} free`}
            </div>
            {!usage.premium && (
              <Link
                href="/dashboard/billing"
                className="mt-3 block rounded-md bg-white px-3 py-2 text-center text-xs font-semibold text-[#04080d] hover:bg-white/90"
              >
                Upgrade
              </Link>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 px-2 text-xs">
            <span className="truncate text-white/60" title={email}>
              {email}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-white/12 px-2 py-1 text-white/65 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
