"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ClipboardEvent } from "react";
import PaywallModal from "@/components/PaywallModal";
import ResultCard from "@/components/ResultCard";
import type { ScamResult } from "@/components/ResultCard";
import LiveStats from "@/components/LiveStats";
import ScamExamples from "@/components/ScamExamples";
import TrustStrip from "@/components/TrustStrip";
import AuthModal from "@/components/AuthModal";
import HeroDemo from "@/components/HeroDemo";
import { AlertIcon, BoltIcon, CameraIcon, CheckIcon, CloseIcon, GlobeIcon, MenuIcon, RadarSweep, ScanIcon, ShieldIcon, StarIcon, UploadIcon } from "@/components/Icons";

const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const ScamTypes = dynamic(() => import("@/components/ScamTypes"), { ssr: false });
const ComparisonTable = dynamic(() => import("@/components/ComparisonTable"), { ssr: false });
const ThreatFeed = dynamic(() => import("@/components/ThreatFeed"), { ssr: false });
const ForensicReport = dynamic(() => import("@/components/ForensicReport"), { ssr: false });
const WhyNotChatGPT = dynamic(() => import("@/components/WhyNotChatGPT"), { ssr: false });
const FollowUpChat = dynamic(() => import("@/components/FollowUpChat"), { ssr: false });
const FlashOffer = dynamic(() => import("@/components/FlashOffer"), { ssr: false });

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const FREE_CHECK_LIMIT = 2;
const HISTORY_STORAGE_KEY = "scamRadarHistory";
const WATCHLIST_STORAGE_KEY = "scamRadarWatchlist";

type HistoryItem = {
  id: string;
  createdAt: string;
  input: string;
  result: ScamResult;
  hasImage: boolean;
};

type DbHistoryItem = {
  id: string;
  createdAt: string;
  input: string;
  score: number;
  level: string;
  reasons?: string[];
  advice: string;
  hasImage?: boolean;
};

type DbUser = {
  id: string;
  email: string;
  name: string | null;
  premium: boolean;
  credits: number;
  count: number;
  history?: DbHistoryItem[];
  watchlist?: string[];
};

type UsageSnapshot = {
  authenticated: boolean;
  premium: boolean;
  credits: number;
  count: number;
  freeLimit: number;
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function extractFirstUrl(input: string): string {
  const match = input.match(/https?:\/\/[^\s<>"')\]]+/i);
  return match?.[0] || "";
}

function reportTextFromAnalysis(params: {
  input: string;
  result: ScamResult;
  createdAt: string;
}): string {
  return [
    "ScamRadar Analysis Report",
    "========================",
    `Generated: ${new Date(params.createdAt).toISOString()}`,
    "",
    "Submitted Input:",
    params.input || "(no text)",
    "",
    "Risk Summary:",
    `Score: ${params.result.score}`,
    `Level: ${params.result.level}`,
    "",
    "Reasons:",
    ...(params.result.reasons || []).map((r, i) => `${i + 1}. ${r}`),
    "",
    "Advice:",
    params.result.advice || "No advice provided.",
  ].join("\n");
}

export default function HomePage() {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [premium, setPremium] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistInput, setWatchlistInput] = useState("");
  const [watchlistAlert, setWatchlistAlert] = useState("");
  const [lastAnalysisInput, setLastAnalysisInput] = useState("");
  const [lastAnalysisAt, setLastAnalysisAt] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportPlatform, setReportPlatform] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [appOrigin, setAppOrigin] = useState("https://scamradar.app");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"correct" | "wrong" | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const inputSectionRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const hydrateDbUser = (user: DbUser) => {
    setDbUser(user);
    setPremium(Boolean(user.premium));
    setCredits(Math.max(0, Number(user.credits) || 0));
    setCount(Math.max(0, Number(user.count) || 0));
    persistState(Math.max(0, Number(user.count) || 0), Boolean(user.premium), Math.max(0, Number(user.credits) || 0));

    if (Array.isArray(user.history)) {
      const cloudHistory: HistoryItem[] = user.history.slice(0, 20).map((item) => ({
        id: String(item.id || crypto.randomUUID()),
        createdAt: String(item.createdAt || new Date().toISOString()),
        input: String(item.input || ""),
        hasImage: Boolean(item.hasImage),
        result: {
          score: Number(item.score) || 0,
          level: String(item.level || "Low"),
          reasons: Array.isArray(item.reasons) ? item.reasons.slice(0, 3).map(String) : [],
          advice: String(item.advice || ""),
        },
      }));
      setHistory(cloudHistory);
      persistHistory(cloudHistory);
    }

    if (Array.isArray(user.watchlist)) {
      const cloudWatchlist = user.watchlist.slice(0, 50).map((entry) => String(entry));
      setWatchlist(cloudWatchlist);
      persistWatchlist(cloudWatchlist);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setHeaderScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCount = parseInt(localStorage.getItem("scamRadarCount") ?? "0");
    const storedPremium = localStorage.getItem("scamRadarPremium") === "true";
    const storedCredits = parseInt(localStorage.getItem("scamRadarCredits") ?? "0");
    const storedHistory = safeParse<HistoryItem[]>(localStorage.getItem(HISTORY_STORAGE_KEY), []);
    const storedWatchlist = safeParse<string[]>(localStorage.getItem(WATCHLIST_STORAGE_KEY), []);

    setCount(Number.isNaN(storedCount) ? 0 : storedCount);
    setPremium(storedPremium);
    setCredits(Number.isNaN(storedCredits) ? 0 : storedCredits);
    setHistory(Array.isArray(storedHistory) ? storedHistory.slice(0, 20) : []);
    setWatchlist(Array.isArray(storedWatchlist) ? storedWatchlist.slice(0, 50) : []);
    setAppOrigin(window.location.origin || "https://scamradar.app");

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user?: DbUser | null }) => {
        if (d?.user) hydrateDbUser(d.user);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCheck();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, imageFile, count, credits, premium, history, watchlist]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const persistState = (newCount: number, newPremium: boolean, newCredits: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("scamRadarCount", newCount.toString());
    localStorage.setItem("scamRadarPremium", newPremium ? "true" : "false");
    localStorage.setItem("scamRadarCredits", newCredits.toString());
  };

  const persistHistory = (items: HistoryItem[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
  };

  const persistWatchlist = (items: string[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  };

  const checksLeft = useMemo(() => {
    if (premium) return "Unlimited checks";
    if (credits > 0) return `${credits} paid check${credits === 1 ? "" : "s"}`;
    const freeLeft = Math.max(0, FREE_CHECK_LIMIT - count);
    return `${freeLeft} free check${freeLeft === 1 ? "" : "s"} left`;
  }, [count, credits, premium]);

  const latestHistoryItem = useMemo(() => {
    if (history.length > 0) return history[0];
    if (!result || !lastAnalysisAt) return null;
    return {
      id: "current",
      createdAt: lastAnalysisAt,
      input: lastAnalysisInput,
      result,
      hasImage: Boolean(imageFile),
    } as HistoryItem;
  }, [history, result, lastAnalysisAt, lastAnalysisInput, imageFile]);

  const clearImageSelection = () => {
    setImageFile(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const acceptImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please paste/upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Image is too large. Max supported size is 8MB.");
      return;
    }
    setError("");
    setImageFile(file);
  };

  const onTextareaPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          acceptImageFile(file);
          return;
        }
      }
    }
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      clearImageSelection();
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Image is too large. Max supported size is 8MB.");
      clearImageSelection();
      event.target.value = "";
      return;
    }
    setError("");
    setImageFile(file);
  };

  const syncToDbAccount = async (overrides?: {
    history?: HistoryItem[];
    watchlist?: string[];
  }) => {
    if (!dbUser) return;
    try {
      const response = await fetch("/api/account/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: (overrides?.history ?? history).map((item) => ({
            id: item.id,
            createdAt: item.createdAt,
            input: item.input,
            score: item.result.score,
            level: item.result.level,
            reasons: item.result.reasons,
            advice: item.result.advice,
            hasImage: item.hasImage,
          })),
          watchlist: overrides?.watchlist ?? watchlist,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { user?: DbUser };
      if (response.ok && data?.user) setDbUser(data.user);
    } catch {
      // Local mode remains fully usable when cloud sync is unavailable.
    }
  };

  const addWatchlistEntry = () => {
    const normalized = watchlistInput.trim().toLowerCase();
    if (!normalized) return;
    const next = Array.from(new Set([normalized, ...watchlist])).slice(0, 50);
    setWatchlist(next);
    persistWatchlist(next);
    setWatchlistInput("");
    void syncToDbAccount({ watchlist: next });
  };

  const removeWatchlistEntry = (entry: string) => {
    const next = watchlist.filter((item) => item !== entry);
    setWatchlist(next);
    persistWatchlist(next);
    void syncToDbAccount({ watchlist: next });
  };

  const clearHistory = () => {
    setHistory([]);
    persistHistory([]);
    void syncToDbAccount({ history: [] });
  };

  const submitReport = async () => {
    if (!latestHistoryItem) return;
    const indicatorValue = extractFirstUrl(latestHistoryItem.input) || latestHistoryItem.input.slice(0, 300);
    if (!indicatorValue) {
      setReportStatus("No indicator found to report.");
      return;
    }
    setReportStatus("Submitting report...");
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicatorType: indicatorValue.startsWith("http") ? "url" : "other",
          indicatorValue,
          platform: reportPlatform,
          notes: reportNotes,
          reporterEmail: dbUser?.email || "",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setReportStatus(data?.error || "Failed to submit report.");
        return;
      }
      setReportStatus("Thanks. Report submitted to community intel.");
      setReportNotes("");
      setReportPlatform("");
      setShowReportForm(false);
    } catch {
      setReportStatus("Network error while submitting report.");
    }
  };

  const shareReport = async () => {
    if (!latestHistoryItem) return;
    const reportText = reportTextFromAnalysis({
      input: latestHistoryItem.input,
      result: latestHistoryItem.result,
      createdAt: latestHistoryItem.createdAt,
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: "ScamRadar Risk Report", text: reportText.slice(0, 2800) });
        setShareStatus("Report shared.");
      } else {
        await navigator.clipboard.writeText(reportText);
        setShareStatus("Report copied to clipboard.");
      }
    } catch {
      setShareStatus("Sharing cancelled.");
    }
  };

  const exportReport = () => {
    if (!latestHistoryItem) return;
    const reportText = reportTextFromAnalysis({
      input: latestHistoryItem.input,
      result: latestHistoryItem.result,
      createdAt: latestHistoryItem.createdAt,
    });
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scamradar-report-${new Date(latestHistoryItem.createdAt).toISOString().replace(/[:.]/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setShareStatus("Report exported.");
  };

  const applyHistoryItem = (item: HistoryItem) => {
    setText(item.input);
    setResult(item.result);
    setLastAnalysisInput(item.input);
    setLastAnalysisAt(item.createdAt);
    setWatchlistAlert("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tryExample = (exampleText: string) => {
    setText(exampleText);
    setResult(null);
    setImageFile(null);
    setFeedbackGiven(null);
    inputSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => textareaRef.current?.focus(), 400);
  };

  const handleCheck = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imageFile) return;

    setLoading(true);
    setShowPaywall(false);
    setResult(null);
    setError("");
    setShareStatus("");
    setWatchlistAlert("");
    setFeedbackGiven(null);

    let cache: Record<string, ScamResult> = {};
    try {
      cache = safeParse<Record<string, ScamResult>>(localStorage.getItem("scamRadarCache"), {});
    } catch {
      cache = {};
    }

    let currentResult: ScamResult | null = null;
    let responseUsage: UsageSnapshot | null = null;
    const canUseCache = Boolean(trimmed) && !imageFile;

    if (canUseCache && cache[trimmed]) {
      currentResult = cache[trimmed];
    } else {
      try {
        let response: Response;
        if (imageFile) {
          const formData = new FormData();
          formData.append("text", trimmed);
          formData.append("image", imageFile);
          response = await fetch("/api/check", { method: "POST", body: formData });
        } else {
          response = await fetch("/api/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: trimmed }),
          });
        }
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 402 || data?.code === "PAYWALL_REQUIRED") {
            setShowPaywall(true);
          }
          if (data?.usage) {
            responseUsage = data.usage;
            setPremium(Boolean(data.usage.premium));
            setCredits(Math.max(0, Number(data.usage.credits) || 0));
            setCount(Math.max(0, Number(data.usage.count) || 0));
            persistState(
              Math.max(0, Number(data.usage.count) || 0),
              Boolean(data.usage.premium),
              Math.max(0, Number(data.usage.credits) || 0)
            );
          }
          setError(data?.error || "Analysis failed. Please try again.");
        } else if (data && typeof data.score === "number") {
          currentResult = data;
          responseUsage = data.usage || null;
          if (canUseCache) {
            cache[trimmed] = data;
            localStorage.setItem("scamRadarCache", JSON.stringify(cache));
          }
        } else {
          setError("No result returned.");
        }
      } catch {
        setError("Network error. Please try again.");
      }
    }

    if (currentResult) {
      let newCount = responseUsage ? Math.max(0, Number(responseUsage.count) || 0) : count;
      let newCredits = responseUsage ? Math.max(0, Number(responseUsage.credits) || 0) : credits;
      const newPremium = responseUsage ? Boolean(responseUsage.premium) : premium;
      if (!responseUsage && !newPremium) {
        if (newCredits > 0) newCredits -= 1;
        else newCount += 1;
      }
      const createdAt = new Date().toISOString();
      const nextHistory: HistoryItem[] = [
        {
          id: crypto.randomUUID(),
          createdAt,
          input: trimmed || "[Image-only analysis]",
          result: currentResult,
          hasImage: Boolean(imageFile),
        },
        ...history,
      ].slice(0, 20);
      setResult(currentResult);
      setLastAnalysisInput(trimmed);
      setLastAnalysisAt(createdAt);
      setHistory(nextHistory);
      persistHistory(nextHistory);
      setCount(newCount);
      setCredits(newCredits);
      setPremium(newPremium);
      persistState(newCount, newPremium, newCredits);
      const watchHits = watchlist.filter((item) =>
        `${trimmed} ${currentResult.reasons.join(" ")} ${currentResult.advice}`.toLowerCase().includes(item)
      );
      if (watchHits.length > 0) setWatchlistAlert(`Watchlist match: ${watchHits.slice(0, 3).join(", ")}`);
      void syncToDbAccount({ history: nextHistory });
    }
    setLoading(false);
  };

  const isPartial = false;

  const telegramShareLink = `https://t.me/share/url?url=${encodeURIComponent(appOrigin)}&text=${encodeURIComponent(
    "Check this suspicious listing with ScamRadar:"
  )}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(`Check suspicious listings here: ${appOrigin}`)}`;

  return (
    <main className="site-shell min-h-screen text-white">
      <header data-scrolled={headerScrolled ? "true" : "false"} className="sticky top-0 z-40 transition-colors duration-200 bg-[#04080d]/80 md:bg-transparent">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
              <RadarSweep size={28} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">ScamRadar</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/45">Threat Screening Engine</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#examples" className="text-sm text-white/70 transition hover:text-white">Examples</a>
            <a href="#types" className="text-sm text-white/70 transition hover:text-white">Scams we catch</a>
            <Link href="/reviews" className="text-sm text-white/70 transition hover:text-white">Reviews</Link>
            <Link href="/bot" className="text-sm text-white/70 transition hover:text-white">Bot API</Link>
            <Link href="/pricing" className="text-sm text-white/70 transition hover:text-white">Pricing</Link>
            {dbUser ? (
              <Link href="/account" className="text-sm text-cyan-300 transition hover:text-cyan-200 font-semibold">
                {dbUser.name || dbUser.email.split("@")[0]}
              </Link>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-sm text-white/70 transition hover:text-white">
                Sign in
              </button>
            )}
            <Link
              href="#checker"
              className="press rounded-xl border border-cyan-300/30 bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-400 glow-accent"
            >
              Check now — free
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-black/75 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2 text-sm">
              <a onClick={() => setMobileMenuOpen(false)} href="#examples" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Examples</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#types" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Scams we catch</a>
              <Link onClick={() => setMobileMenuOpen(false)} href="/reviews" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Reviews</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/bot" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Bot API</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Pricing</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="#checker" className="rounded-lg bg-cyan-500 px-3 py-2 font-bold text-white">Check now — free</Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* HERO + INPUT (input now on the right) */}
      <section
        id="checker"
        ref={inputSectionRef}
        className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-10 pt-8 md:gap-10 md:px-6 md:pb-14 md:pt-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14"
      >
        {/* LEFT — headline + value props */}
        <div className="hero-left">
          <div className="fade-in-up inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 chip-glow md:px-4 md:py-2 md:text-sm">
            <span className="pulse-danger h-2 w-2 rounded-full bg-cyan-400" />
            Public beta - text, links, and screenshots
          </div>

          <h1 className="font-serif-display fade-in-up mt-5 text-4xl font-black leading-[1] md:mt-6 md:text-6xl lg:text-7xl">
            Catch a <span className="gradient-text">scam</span>
            <br />
            in 2 seconds.
          </h1>

          <p className="fade-in-up mt-4 max-w-md text-base leading-7 soft-muted md:mt-5 md:text-lg md:leading-8">
            Paste a message, link, or screenshot. Get a clear risk score with the reasons — before it costs you real money.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs md:mt-6 md:text-sm">
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/85">2 free checks</span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/85">No signup</span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">~1.8s avg</span>
          </div>

          {/* Risk legend — desktop only here, balances height */}
          <div className="mt-6 hidden max-w-sm grid-cols-3 gap-2 text-[11px] lg:grid">
            <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5">
              <div className="font-bold text-rose-200">High</div>
              <div className="mono-readout mt-0.5 text-rose-200/80">70–100</div>
            </div>
            <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2.5">
              <div className="font-bold text-amber-200">Medium</div>
              <div className="mono-readout mt-0.5 text-amber-200/80">40–69</div>
            </div>
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2.5">
              <div className="font-bold text-emerald-200">Low</div>
              <div className="mono-readout mt-0.5 text-emerald-200/80">0–39</div>
            </div>
          </div>
        </div>

        {/* RIGHT — input panel */}
        <div className="fade-in-up gradient-border p-3 md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Run instant check</div>
              <h2 className="mt-0.5 text-base font-black md:text-lg">Paste. Analyze. Decide.</h2>
            </div>
            <div className="shrink-0 rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-3 py-1.5 text-right">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/45">Access</div>
              <div className="mono-readout text-[11px] font-semibold text-white">{checksLeft}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onPaste={onTextareaPaste}
                aria-label="Suspicious message, URL, or pasted screenshot"
                maxLength={12000}
                placeholder="Paste a suspicious message or URL here. Tip: Ctrl+V also pastes screenshots."
                className="input-field h-44 w-full resize-none rounded-xl border border-white/10 bg-[#06141d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-300/50 focus-ring md:h-48 md:text-base"
              />
              {loading ? <div className="scan-overlay rounded-xl" /> : null}
              <div className="absolute bottom-2 right-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] text-white/55">
                <span>{text.length} / 12,000</span>
                <span className="hidden sm:inline mono-readout">⌘+Enter</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="touch-manipulation inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
                >
                  <CameraIcon size={13} />
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="touch-manipulation inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.12]"
                >
                  <UploadIcon size={13} />
                  Upload
                </button>
              </div>
              <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onImageChange} />
              <div className="text-[11px] text-white/55">
                {imageFile ? (
                  <span className="mono-readout">
                    {imageFile.name.length > 18 ? imageFile.name.slice(0, 16) + "…" : imageFile.name}
                    {" · "}{(imageFile.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                ) : (
                  "JPG / PNG / WEBP · 8 MB max"
                )}
              </div>
            </div>

            {imagePreviewUrl ? (
              <div className="mt-2 overflow-hidden rounded-xl border border-white/15 bg-black/30">
                <Image src={imagePreviewUrl} alt="Listing preview" width={1200} height={900} unoptimized className="max-h-40 w-full object-cover" />
                <div className="flex justify-end p-2">
                  <button
                    type="button"
                    onClick={clearImageSelection}
                    className="touch-manipulation min-h-8 rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleCheck}
              disabled={loading}
              className="primary-cta press touch-manipulation mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing...
                </span>
              ) : (
                <>
                  <BoltIcon size={16} />
                  Analyze risk
                </>
              )}
            </button>
          </div>

          {watchlistAlert ? (
            <div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">{watchlistAlert}</div>
          ) : null}
          {error ? (
            <div className="mt-3 rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-3 py-2 text-xs text-cyan-100">{error}</div>
          ) : null}

          {loading && !result ? (
            <div className="mt-4 space-y-3" aria-live="polite" aria-label="Analyzing">
              <div className="skeleton h-6 w-2/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>
          ) : null}

          {result ? <ResultCard result={result} partial={isPartial} /> : null}

          {result ? (
            <>
              <ForensicReport result={result} input={lastAnalysisInput} partial={isPartial} />
              <FollowUpChat input={lastAnalysisInput} result={result} locked={isPartial} />
            </>
          ) : null}

          {result && latestHistoryItem ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={shareReport} className="rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.12]">
                    Share
                  </button>
                  <button onClick={exportReport} className="rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.12]">
                    Export
                  </button>
                  <button onClick={() => setShowReportForm((prev) => !prev)} className="rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-500/25">
                    Report
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/65">
                  <span>Correct?</span>
                  <button
                    onClick={() => setFeedbackGiven("correct")}
                    className={`rounded-full border px-2 py-0.5 transition ${feedbackGiven === "correct" ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200" : "border-white/15 hover:bg-white/10"}`}
                    aria-label="Mark feedback as correct"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setFeedbackGiven("wrong")}
                    className={`rounded-full border px-2 py-0.5 transition ${feedbackGiven === "wrong" ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200" : "border-white/15 hover:bg-white/10"}`}
                    aria-label="Mark feedback as wrong"
                  >
                    👎
                  </button>
                </div>
              </div>

              {feedbackGiven ? (
                <div className="mt-2 text-[11px] text-white/55">Thanks — feedback improves future detections.</div>
              ) : null}
              {shareStatus ? <div className="mt-1.5 text-[11px] text-white/65">{shareStatus}</div> : null}
              {reportStatus ? <div className="mt-1.5 text-[11px] text-white/65">{reportStatus}</div> : null}

              {showReportForm ? (
                <div className="mt-2.5 space-y-2">
                  <input
                    value={reportPlatform}
                    onChange={(event) => setReportPlatform(event.target.value)}
                    placeholder="Platform (optional): eBay / Facebook Marketplace / Avito"
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40"
                  />
                  <textarea
                    value={reportNotes}
                    onChange={(event) => setReportNotes(event.target.value)}
                    placeholder="Extra details (optional)"
                    className="h-16 w-full resize-none rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40"
                  />
                  <button onClick={submitReport} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-400">
                    Submit report
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Risk legend — mobile/tablet only here */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] lg:hidden">
            <div className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-2 py-1.5 text-center">
              <div className="font-bold text-rose-200">High</div>
              <div className="mono-readout mt-0.5 text-rose-200/80">70–100</div>
            </div>
            <div className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-2 py-1.5 text-center">
              <div className="font-bold text-amber-200">Medium</div>
              <div className="mono-readout mt-0.5 text-amber-200/80">40–69</div>
            </div>
            <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-2 py-1.5 text-center">
              <div className="font-bold text-emerald-200">Low</div>
              <div className="mono-readout mt-0.5 text-emerald-200/80">0–39</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6"><div className="section-divider" /></div>

      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 md:px-6 md:pb-10">
        <TrustStrip />
      </section>

      {/* LIVE DEMO — moved here from hero aside */}
      <section id="demo" className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 md:px-6 md:pb-14">
        <div className="mb-5 max-w-2xl md:mb-7">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-xs">Watch it work</div>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">A real scam, broken down in under 2 seconds.</h2>
        </div>
        <HeroDemo />
      </section>

      {/* THREAT FEED — atmospheric strip */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-12">
        <ThreatFeed />
      </section>

      {/* SCAM EXAMPLES — try a sample */}
      <section id="examples" className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <ScamExamples onTry={tryExample} />
      </section>

      <section id="types" className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <ScamTypes />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <LiveStats />
      </section>

      <section id="trust" className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <Testimonials />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <WhyNotChatGPT />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <ComparisonTable />
      </section>

      <section id="workspace" className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-3xl p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-xs">Your case desk</div>
                <h2 className="mt-2 text-2xl font-black md:text-3xl">History, watchlist, and quick sharing.</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                <ShieldIcon size={14} />
                {dbUser ? "Cloud sync on" : "Local-first"}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                  <ScanIcon size={14} />
                  Checks
                </div>
                <div className="mono-readout mt-2 text-2xl font-black text-white">{history.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                  <AlertIcon size={14} />
                  Watchlist
                </div>
                <div className="mono-readout mt-2 text-2xl font-black text-white">{watchlist.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                  <StarIcon size={14} />
                  Access
                </div>
                <div className="mt-2 text-sm font-bold text-white">{checksLeft}</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold text-white">Recent checks</div>
                <button
                  type="button"
                  onClick={clearHistory}
                  disabled={history.length === 0}
                  className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/65 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
              <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
                {history.length > 0 ? (
                  history.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyHistoryItem(item)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono-readout text-[10px] text-white/45">{new Date(item.createdAt).toLocaleString()}</span>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                          {item.result.level} · {item.result.score}
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm text-white/80">{item.input}</div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/50">
                    Run a check and it will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-xs">
                <GlobeIcon size={14} />
                Watchlist
              </div>
              <div className="mt-2 text-xl font-black">Flag repeat domains, handles, or phrases.</div>
              <div className="mt-4 flex gap-2">
                <input
                  value={watchlistInput}
                  onChange={(event) => setWatchlistInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addWatchlistEntry();
                  }}
                  maxLength={120}
                  placeholder="seller handle, domain, wallet, phrase"
                  className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/50"
                />
                <button
                  type="button"
                  onClick={addWatchlistEntry}
                  disabled={!watchlistInput.trim()}
                  className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-auto">
                {watchlist.length > 0 ? (
                  watchlist.map((entry) => (
                    <span key={entry} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] py-1 pl-3 pr-1 text-xs text-white/80">
                      <span className="mono-readout max-w-[180px] truncate">{entry}</span>
                      <button
                        type="button"
                        onClick={() => removeWatchlistEntry(entry)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                        aria-label={`Remove ${entry} from watchlist`}
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <div className="text-sm text-white/50">Add terms you want ScamRadar to flag in future checks.</div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 md:p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-xs">
                <CheckIcon size={14} />
                Account
              </div>
              {dbUser ? (
                <>
                  <div className="mt-2 text-xl font-black">Signed in as {dbUser.name || dbUser.email.split("@")[0]}</div>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Your history and watchlist sync to your ScamRadar account on this browser.
                  </p>
                  <Link
                    href="/account"
                    className="mt-4 inline-flex rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/25"
                  >
                    Open account
                  </Link>
                </>
              ) : (
                <>
                  <div className="mt-2 text-xl font-black">Keep checks across devices.</div>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Sign in when you want cloud history, watchlist sync, and Shield plan access.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-black text-white transition hover:bg-cyan-400"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            <div className="glass-panel rounded-3xl p-5 md:p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-xs">Share ScamRadar</div>
              <div className="mt-2 text-xl font-black">Send the checker before someone pays.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={telegramShareLink} target="_blank" rel="noreferrer" className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]">
                  Telegram
                </a>
                <a href={whatsappShareLink} target="_blank" rel="noreferrer" className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]">
                  WhatsApp
                </a>
                <Link href="/bot" className="rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25">
                  Bot API
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — compact 3-step */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="glass-panel rounded-3xl p-5 md:p-8">
          <div className="max-w-2xl">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-xs">How it works</div>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">Three steps. Two seconds.</h2>
          </div>
          <div className="mt-6 grid gap-3 md:mt-7 md:grid-cols-3 md:gap-4">
            {[
              ["01", "Paste it", "Drop a message, link, or screenshot. No signup required."],
              ["02", "We analyze", "URL inspection, OCR, lookalike checks, and AI patterns."],
              ["03", "You decide", "Risk score, top reasons, and a clear next step."],
            ].map(([num, title, body]) => (
              <div key={num} className="hover-lift rounded-2xl border border-white/10 bg-black/30 p-4 md:p-5">
                <div className="mono-readout mb-3 inline-flex rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-100">
                  {num}
                </div>
                <h3 className="text-base font-bold md:text-lg">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-white/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — single column, compact */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 md:text-xs">FAQ</div>
        <h2 className="mt-2 text-2xl font-black md:text-3xl">Common questions</h2>
        <div className="mt-5 space-y-2 md:mt-6">
          {[
            ["How accurate is the score?", "Scores combine rule-based signals, URL/marketplace extraction, image analysis, and AI interpretation. Treat high-risk results as a strong warning. False-positive rate sits under 4% in human review."],
            ["Can I check screenshots from mobile?", "Yes — upload from gallery or capture from camera on iOS and Android directly in the browser. No install required."],
            ["Is my data private?", "We don't sell or share analysis data. Local-first storage is the default; cloud sync is opt-in when you create an account."],
            ["What happens after my free checks?", "Unlock more with a $0.99 single pass, Shield Monthly ($4.99/mo with 3-day free trial), or Shield Yearly ($29.99/yr — 50% off). Cancel anytime."],
            ["Do you offer a bot or API?", "Yes — connect Telegram or WhatsApp bots via our Bot API. See the Bot API docs for details."],
          ].map(([q, a]) => (
            <details key={q} className="group rounded-xl border border-white/10 bg-black/25 p-3.5 transition hover:border-white/20 md:p-4">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold list-none [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <span className="mono-readout shrink-0 text-base text-cyan-300 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-6 text-white/70">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA — compact with stats */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-2 md:px-6 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-500/15 via-cyan-900/10 to-black p-6 md:rounded-[32px] md:p-10">
          <div className="absolute -top-20 right-10 hidden h-48 w-48 rounded-full bg-cyan-500/25 blur-3xl md:block" />
          <div className="relative grid gap-6 md:gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black leading-[1] md:text-5xl">
                Don&apos;t guess. <span className="gradient-text">Scan it.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/70 md:mt-4 md:text-base md:leading-8">
                One paste. Two seconds. Real proof — before you lose money.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5 md:mt-6">
                <Link href="#checker" className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-400 glow-accent md:text-base">
                  Run free check
                </Link>
                <Link href="/pricing" className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12] md:text-base">
                  See plans
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/35 p-3 md:p-4">
                <div className="mono-readout text-xl font-black text-white md:text-3xl">2</div>
                <div className="mt-0.5 text-[11px] text-white/65 md:text-xs">Free checks</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/35 p-3 md:p-4">
                <div className="mono-readout text-xl font-black text-white md:text-3xl">8MB</div>
                <div className="mt-0.5 text-[11px] text-white/65 md:text-xs">Image upload</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/35 p-3 md:p-4">
                <div className="mono-readout text-xl font-black text-white md:text-3xl">3</div>
                <div className="mt-0.5 text-[11px] text-white/65 md:text-xs">Input types</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Mobile floating CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden">
        <a
          href="#checker"
          className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-white shadow-[0_20px_60px_-15px_rgba(34,211,238,0.75)]"
        >
          <BoltIcon size={16} />
          Run a free check
        </a>
      </div>

      <PaywallModal show={showPaywall} onClose={() => setShowPaywall(false)} />
      <FlashOffer premium={premium || (dbUser?.premium ?? false)} />
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          hydrateDbUser(user);
        }}
      />
    </main>
  );
}
