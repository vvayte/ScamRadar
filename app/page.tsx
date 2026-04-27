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
import { AlertIcon, BoltIcon, CameraIcon, CheckIcon, GlobeIcon, RadarSweep, ScanIcon, ShieldIcon, StarIcon, UploadIcon } from "@/components/Icons";

const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const ScamTypes = dynamic(() => import("@/components/ScamTypes"), { ssr: false });
const ComparisonTable = dynamic(() => import("@/components/ComparisonTable"), { ssr: false });
const ThreatFeed = dynamic(() => import("@/components/ThreatFeed"), { ssr: false });
const ForensicReport = dynamic(() => import("@/components/ForensicReport"), { ssr: false });
const WhyNotChatGPT = dynamic(() => import("@/components/WhyNotChatGPT"), { ssr: false });
const FollowUpChat = dynamic(() => import("@/components/FollowUpChat"), { ssr: false });
const FlashOffer = dynamic(() => import("@/components/FlashOffer"), { ssr: false });

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const HISTORY_STORAGE_KEY = "scamRadarHistory";
const WATCHLIST_STORAGE_KEY = "scamRadarWatchlist";
const AUTH_EMAIL_STORAGE_KEY = "scamRadarAuthEmail";
const AUTH_TOKEN_STORAGE_KEY = "scamRadarAuthToken";

type HistoryItem = {
  id: string;
  createdAt: string;
  input: string;
  result: ScamResult;
  hasImage: boolean;
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
  const [authEmail, setAuthEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [magicEmailInput, setMagicEmailInput] = useState("");
  const [magicTokenInput, setMagicTokenInput] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [devMagicLink, setDevMagicLink] = useState("");
  const [appOrigin, setAppOrigin] = useState("https://scamradar.app");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"correct" | "wrong" | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dbUser, setDbUser] = useState<{ id: string; email: string; name: string | null; premium: boolean; credits: number; count: number } | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const inputSectionRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    const storedAuthEmail = localStorage.getItem(AUTH_EMAIL_STORAGE_KEY) || "";
    const storedAuthToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";

    setCount(Number.isNaN(storedCount) ? 0 : storedCount);
    setPremium(storedPremium);
    setCredits(Number.isNaN(storedCredits) ? 0 : storedCredits);
    setHistory(Array.isArray(storedHistory) ? storedHistory.slice(0, 20) : []);
    setWatchlist(Array.isArray(storedWatchlist) ? storedWatchlist.slice(0, 50) : []);
    setAuthEmail(storedAuthEmail);
    setAuthToken(storedAuthToken);
    setMagicEmailInput(storedAuthEmail);
    setAppOrigin(window.location.origin || "https://scamradar.app");

    // load DB session
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d?.user) setDbUser(d.user);
    }).catch(() => {});

    const tokenFromUrl = new URL(window.location.href).searchParams.get("magic_token");
    if (tokenFromUrl) {
      setMagicTokenInput(tokenFromUrl);
      setAuthStatus("Magic token detected. Press Verify token to sign in.");
    }
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
    const freeLeft = Math.max(0, 1 - count);
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

  const requestMagicLink = async () => {
    const email = magicEmailInput.trim().toLowerCase();
    if (!email) {
      setAuthStatus("Enter your email first.");
      return;
    }
    setAuthStatus("Requesting magic link...");
    setDevMagicLink("");
    try {
      const response = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origin: appOrigin }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthStatus(data?.error || "Failed to request magic link.");
        return;
      }
      setAuthStatus(
        data?.delivered
          ? "Magic link sent. Check your email."
          : "Magic link generated (dev mode). Paste token below or open the link."
      );
      if (data?.magicLink) {
        setDevMagicLink(data.magicLink);
        const tokenFromLink = new URL(data.magicLink).searchParams.get("magic_token");
        if (tokenFromLink) setMagicTokenInput(tokenFromLink);
      }
    } catch {
      setAuthStatus("Network error while requesting magic link.");
    }
  };

  const syncToCloud = async (overrides?: {
    premium?: boolean;
    credits?: number;
    count?: number;
    history?: HistoryItem[];
    watchlist?: string[];
  }) => {
    if (!authToken) return;
    try {
      await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          premium: overrides?.premium ?? premium,
          credits: overrides?.credits ?? credits,
          count: overrides?.count ?? count,
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
    } catch {}
  };

  const loadFromCloud = async (tokenParam?: string) => {
    const token = tokenParam || authToken;
    if (!token) return;
    const response = await fetch("/api/account", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok || !data?.profile) throw new Error(data?.error || "Failed to load cloud profile.");
    const profile = data.profile;
    setPremium(Boolean(profile.premium));
    setCredits(Math.max(0, Number(profile.credits) || 0));
    setCount(Math.max(0, Number(profile.count) || 0));
    persistState(Number(profile.count) || 0, Boolean(profile.premium), Number(profile.credits) || 0);
    const cloudHistory: HistoryItem[] = Array.isArray(profile.history)
      ? profile.history.slice(0, 20).map((item: any) => ({
          id: String(item?.id || crypto.randomUUID()),
          createdAt: String(item?.createdAt || new Date().toISOString()),
          input: String(item?.input || ""),
          hasImage: Boolean(item?.hasImage),
          result: {
            score: Number(item?.score) || 0,
            level: String(item?.level || "Low"),
            reasons: Array.isArray(item?.reasons) ? item.reasons.slice(0, 3).map((r: any) => String(r)) : [],
            advice: String(item?.advice || ""),
          },
        }))
      : [];
    setHistory(cloudHistory);
    persistHistory(cloudHistory);
    const cloudWatchlist = Array.isArray(profile.watchlist)
      ? profile.watchlist.slice(0, 50).map((entry: any) => String(entry))
      : [];
    setWatchlist(cloudWatchlist);
    persistWatchlist(cloudWatchlist);
  };

  const verifyMagicToken = async () => {
    const token = magicTokenInput.trim();
    if (!token) {
      setAuthStatus("Paste token first.");
      return;
    }
    setAuthStatus("Verifying token...");
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok || !data?.sessionToken || !data?.profile?.email) {
        setAuthStatus(data?.error || "Token is invalid or expired.");
        return;
      }
      setAuthToken(String(data.sessionToken));
      setAuthEmail(String(data.profile.email));
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, String(data.sessionToken));
      localStorage.setItem(AUTH_EMAIL_STORAGE_KEY, String(data.profile.email));
      setAuthStatus("Signed in. Cloud sync is active.");
      setMagicTokenInput("");
      setMagicEmailInput(String(data.profile.email));
      await loadFromCloud(String(data.sessionToken));
    } catch {
      setAuthStatus("Verification failed. Please try again.");
    }
  };

  const signOut = () => {
    setAuthToken("");
    setAuthEmail("");
    setMagicEmailInput("");
    setMagicTokenInput("");
    setAuthStatus("Signed out.");
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_EMAIL_STORAGE_KEY);
  };

  const addWatchlistEntry = () => {
    const normalized = watchlistInput.trim().toLowerCase();
    if (!normalized) return;
    const next = Array.from(new Set([normalized, ...watchlist])).slice(0, 50);
    setWatchlist(next);
    persistWatchlist(next);
    setWatchlistInput("");
    void syncToCloud({ watchlist: next });
  };

  const removeWatchlistEntry = (entry: string) => {
    const next = watchlist.filter((item) => item !== entry);
    setWatchlist(next);
    persistWatchlist(next);
    void syncToCloud({ watchlist: next });
  };

  const clearHistory = () => {
    setHistory([]);
    persistHistory([]);
    void syncToCloud({ history: [] });
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
          reporterEmail: authEmail || "",
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
    link.click();
    URL.revokeObjectURL(url);
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
        if (!response.ok) setError(data?.error || "Analysis failed. Please try again.");
        else if (data && typeof data.score === "number") {
          currentResult = data;
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
      let newCount = count;
      let newCredits = credits;
      const newPremium = premium;
      if (!newPremium) {
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
      if (!newPremium && newCredits === 0 && newCount >= 1) setShowPaywall(true);
      void syncToCloud({ premium: newPremium, credits: newCredits, count: newCount, history: nextHistory });
    }
    setLoading(false);
  };

  const isPartial = !premium && credits === 0 && count >= 1;

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
            <a href="#trust" className="text-sm text-white/70 transition hover:text-white">Reviews</a>
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
            className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-black/75 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2 text-sm">
              <a onClick={() => setMobileMenuOpen(false)} href="#examples" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Examples</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#types" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Scams we catch</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#trust" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Reviews</a>
              <Link onClick={() => setMobileMenuOpen(false)} href="/bot" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Bot API</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Pricing</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="#checker" className="rounded-lg bg-cyan-500 px-3 py-2 font-bold text-white">Check now — free</Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* HERO + INPUT */}
      <section id="checker" ref={inputSectionRef} className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-14 lg:grid-cols-[1.2fr_0.9fr]">
        <div>
          <div className="fade-in-up inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 chip-glow">
            <span className="pulse-danger h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Trusted by 38,000+ people across 47 countries
          </div>

          <h1 className="font-serif-display fade-in-up mt-5 max-w-4xl text-4xl font-black leading-[0.95] md:text-7xl">
            Catch a <span className="gradient-text">scam</span> in 2 seconds —
            <br className="hidden md:block" /> before it costs you real money.
          </h1>

          <p className="fade-in-up mt-5 max-w-3xl text-lg leading-8 soft-muted md:text-xl">
            Paste a suspicious message, URL, or screenshot. ScamRadar blends rule-based signals, URL
            inspection, image analysis, and AI to return a clear risk score with real next steps.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/85">2 checks free — no signup</span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/85">Text · link · screenshot</span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/85">Community intel</span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">Avg. 1.8s response</span>
          </div>

          <div className="fade-in-up mt-8 gradient-border p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Run instant scam check</h2>
                <p className="mt-1 text-sm text-white/55">Paste first. Pay second. Protect always.</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Current access</div>
                <div className="mono-readout mt-1 text-sm font-semibold text-white">{checksLeft}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-3 md:p-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onPaste={onTextareaPaste}
                  aria-label="Suspicious message, URL, or pasted screenshot"
                  maxLength={12000}
                  placeholder="Paste suspicious message or listing URL. Tip: you can paste a screenshot directly with Ctrl+V."
                  className="input-field h-56 w-full resize-none rounded-2xl border border-white/10 bg-[#06141d] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-cyan-300/50 focus-ring"
                />
                {loading ? <div className="scan-overlay rounded-2xl" /> : null}
                <div className="absolute bottom-3 right-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[10px] text-white/55">
                  <span>{text.length} / 12,000</span>
                  <span className="hidden sm:inline mono-readout">⌘ + Enter</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="touch-manipulation inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-500/18 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/28"
                    >
                      <CameraIcon size={16} />
                      Take photo
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="touch-manipulation inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
                    >
                      <UploadIcon size={16} />
                      Upload photo
                    </button>
                  </div>
                  <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onImageChange} />

                  <div className="text-xs text-white/65">
                    {imageFile ? (
                      <span className="mono-readout">Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    ) : (
                      "No image selected"
                    )}
                  </div>
                </div>

                {imagePreviewUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/15 bg-black/30">
                    <Image src={imagePreviewUrl} alt="Listing preview" width={1200} height={900} unoptimized className="max-h-56 w-full object-cover" />
                  </div>
                ) : null}

                {imageFile ? (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="touch-manipulation min-h-10 rounded-lg border border-cyan-300/35 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : null}

                <p className="mt-3 text-xs text-white/50">
                  Supports JPG/PNG/WEBP up to 8MB. Best for listing screenshots, seller chats, and payment instructions.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleCheck}
                  disabled={loading}
                  className="primary-cta press touch-manipulation flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Analyzing...
                    </span>
                  ) : (
                    <>
                      <BoltIcon size={18} />
                      Analyze risk
                    </>
                  )}
                </button>
                <Link
                  href="/pricing"
                  className="touch-manipulation inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white/95 transition hover:bg-white/[0.1]"
                >
                  View Plans
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/50">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">SMS / DM</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Marketplace chat</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Email body</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Suspicious links</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Listing screenshots</span>
              </div>
            </div>

            {watchlistAlert ? (
              <div className="mt-4 rounded-2xl border border-amber-300/35 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">{watchlistAlert}</div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-cyan-300/35 bg-cyan-500/15 px-4 py-3 text-sm text-cyan-100">{error}</div>
            ) : null}

            {loading && !result ? (
              <div className="mt-6 space-y-3" aria-live="polite" aria-label="Analyzing">
                <div className="skeleton h-8 w-2/3" />
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
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={shareReport} className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
                      Share report
                    </button>
                    <button onClick={exportReport} className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
                      Export .txt
                    </button>
                    <button onClick={() => setShowReportForm((prev) => !prev)} className="rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25">
                      Report scammer
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>Was this correct?</span>
                    <button
                      onClick={() => setFeedbackGiven("correct")}
                      className={`rounded-full border px-2.5 py-1 transition ${feedbackGiven === "correct" ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200" : "border-white/15 hover:bg-white/10"}`}
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => setFeedbackGiven("wrong")}
                      className={`rounded-full border px-2.5 py-1 transition ${feedbackGiven === "wrong" ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200" : "border-white/15 hover:bg-white/10"}`}
                    >
                      👎 No
                    </button>
                  </div>
                </div>

                {feedbackGiven ? (
                  <div className="mt-2 text-xs text-white/60">
                    Thanks! Your feedback improves future detections.
                  </div>
                ) : null}

                {shareStatus ? <div className="mt-2 text-xs text-white/70">{shareStatus}</div> : null}
                {reportStatus ? <div className="mt-2 text-xs text-white/70">{reportStatus}</div> : null}

                {showReportForm ? (
                  <div className="mt-3 space-y-2">
                    <input
                      value={reportPlatform}
                      onChange={(event) => setReportPlatform(event.target.value)}
                      placeholder="Platform (optional): eBay / Facebook Marketplace / Avito"
                      className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <textarea
                      value={reportNotes}
                      onChange={(event) => setReportNotes(event.target.value)}
                      placeholder="Extra details (optional)"
                      className="h-20 w-full resize-none rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <button onClick={submitReport} className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-400">
                      Submit report
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <HeroDemo />

          <div className="fade-in-up grid grid-cols-3 gap-2 text-[11px]">
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

          <div className="fade-in-up rounded-2xl border border-white/10 bg-black/35 p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">What we inspect</div>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                12 signals
              </span>
            </div>
            <ul className="mt-4 grid gap-3 text-sm">
              {[
                { icon: <GlobeIcon size={16} className="text-cyan-300" />, title: "Domain & WHOIS lookup", desc: "Age, registrar, country, SSL chain" },
                { icon: <AlertIcon size={16} className="text-rose-300" />, title: "Lookalike character analysis", desc: "Homoglyphs, digit-letter swaps, IDN" },
                { icon: <ScanIcon size={16} className="text-amber-300" />, title: "Payment-flow patterns", desc: "Off-platform asks, wire/crypto pressure" },
                { icon: <CameraIcon size={16} className="text-cyan-300" />, title: "Image OCR & reverse search", desc: "Stolen listing photos, fake screenshots" },
                { icon: <ShieldIcon size={16} className="text-emerald-300" />, title: "Community intel", desc: "Cross-checked with 38k+ user reports" },
              ].map((row) => (
                <li key={row.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    {row.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-white/90">{row.title}</div>
                    <div className="text-xs text-white/55">{row.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="fade-in-up overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-black/40 to-black/60 p-5">
            <div className="flex items-center gap-1 text-amber-300">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} size={14} />
              ))}
              <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Verified buyer</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/85">
              &ldquo;Was about to send €380 to a &lsquo;courier&rsquo; before I pasted the message here. Score 91, full
              breakdown of why. Saved me a month&apos;s rent.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xs font-black text-white">
                MK
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Marta K.</div>
                <div className="text-[11px] text-white/50">Wallapop seller · Barcelona</div>
              </div>
              <div className="ml-auto rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                €380 saved
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6"><div className="section-divider" /></div>

      {/* THREAT FEED — full-width strip */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <ThreatFeed />
      </section>

      {/* WATCHLIST + ACCOUNT — pro tools */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-panel rounded-3xl p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Watchlist</div>
            <p className="mt-2 text-xs text-white/65">Track risky domains or seller keywords and get instant matches.</p>
            <div className="mt-3 flex gap-2">
              <input
                value={watchlistInput}
                onChange={(event) => setWatchlistInput(event.target.value)}
                placeholder="domain.com or seller name"
                className="flex-1 rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button onClick={addWatchlistEntry} className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
                Add
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {watchlist.length === 0 ? (
                <div className="text-xs text-white/50">No watchlist entries yet.</div>
              ) : (
                watchlist.slice(0, 8).map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs">
                    <span className="mono-readout text-white/80">{item}</span>
                    <button onClick={() => removeWatchlistEntry(item)} className="text-cyan-200 transition hover:text-cyan-100">
                      remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Sync across devices</div>
            <p className="mt-2 text-xs text-white/65">Sign in to sync credits, history, and watchlist. Use magic link or email + password.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dbUser ? (
                <Link href="/account" className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-400">
                  Open account
                </Link>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-400">
                  Sign in / Register
                </button>
              )}
              {authToken ? (
                <button onClick={signOut} className="rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-2.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25">
                  Sign out (legacy)
                </button>
              ) : null}
            </div>
            {authStatus ? <div className="mt-3 text-xs text-white/55">{authStatus}</div> : null}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <TrustStrip />
      </section>

      {/* LIVE STATS */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="mb-6 max-w-2xl">
          <div className="text-xs uppercase tracking-[0.22em] text-white/50">Impact at a glance</div>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Scam prevention, measured.</h2>
        </div>
        <LiveStats />
      </section>

      {/* SCAM EXAMPLES */}
      <section id="examples" className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <ScamExamples onTry={tryExample} />
      </section>

      {/* SCAM TYPES */}
      <section id="types" className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <ScamTypes />
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="glass-panel rounded-[32px] p-6 md:p-8">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">How it works</div>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Three steps between you and a scam</h2>
            <p className="mt-3 soft-muted">
              Designed for speed under stress. No account required to start. Paste, evaluate, and decide with better
              confidence.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Paste message / URL / image", "ScamRadar inspects text, links, and screenshots in one flow."],
              ["02", "Get risk + reasons instantly", "You see priority risk signals and recommended next action."],
              ["03", "Share, report, and monitor", "Export reports, report scammers, and track risky indicators."],
            ].map(([num, title, body]) => (
              <div key={num} className="hover-lift rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="mono-readout mb-4 inline-flex rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-3 py-2 text-sm font-bold text-cyan-100">
                  {num}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="trust" className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <Testimonials />
      </section>

      {/* WHY NOT CHATGPT */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <WhyNotChatGPT />
      </section>

      {/* COMPARISON TABLE */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <ComparisonTable />
      </section>

      {/* HISTORY */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <div className="glass-panel rounded-[32px] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">History & Reports</div>
              <h2 className="mt-2 text-2xl font-black md:text-3xl">Recent checks</h2>
            </div>
            <button onClick={clearHistory} className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
              Clear history
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/55">
                No checks yet. Your analysis history will appear here.
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => applyHistoryItem(item)}
                  className="text-left rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="mono-readout text-xs text-white/50">{new Date(item.createdAt).toLocaleString()}</div>
                    <div className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      String(item.result.level).toLowerCase().includes("high")
                        ? "bg-cyan-500/20 text-cyan-200"
                        : String(item.result.level).toLowerCase().includes("medium")
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-emerald-500/20 text-emerald-200"
                    }`}>
                      {item.result.level}
                    </div>
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm text-white/80">{item.input}</div>
                  <div className="mt-2 text-xs text-white/55">
                    Score {item.result.score} • {item.hasImage ? "With image" : "Text/URL"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="glass-panel rounded-[32px] p-6 md:p-8">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Frequently asked</div>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Common questions</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["How accurate is the score?", "Scores combine rule-based signals, URL/marketplace extraction, image analysis, and AI interpretation. Treat high-risk results as a strong warning and verify independently. Our false-positive rate on human-reviewed cases sits under 4%."],
              ["Can I check screenshots from mobile?", "Yes. Upload from gallery or capture from camera on iOS and Android directly in the app — no install required."],
              ["How does watchlist monitoring work?", "Add risky domains or seller keywords to your watchlist. ScamRadar alerts you instantly when your new analysis matches tracked items."],
              ["Do you have bot integration?", "Yes — use the Bot API endpoint for Telegram/WhatsApp bots, or share checks via quick links. Details on the Bot API page."],
              ["Is my data private?", "We do not sell or share analysis data. Local storage keeps things on your device by default; cloud sync is opt-in via magic link."],
              ["What happens after my free check?", "You can unlock more with a single $0.99 pass, Shield Monthly ($4.99/mo with 3-day free trial), or Shield Yearly ($29.99/yr — 50% off). All plans are cancel-anytime."],
              ["What languages do you support?", "Analysis works across English, Russian, Spanish, German, Portuguese, and more. The UI is currently English; localized UI is on our Q3 roadmap."],
              ["Can I integrate ScamRadar into my app?", "Absolutely. Our Bot API accepts a payload and returns a risk score. Rate limits apply per plan. See the Bot API page for docs."],
            ].map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20">
                <summary className="cursor-pointer text-sm font-semibold">{q}</summary>
                <p className="mt-2 text-sm leading-6 text-white/70">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6"><div className="section-divider" /></div>

      {/* FINAL CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pt-14">
        <div className="relative overflow-hidden rounded-[32px] border border-cyan-300/30 bg-gradient-to-br from-cyan-500/25 via-cyan-900/20 to-black p-8 md:p-12">
          <div className="absolute -top-24 right-10 hidden h-64 w-64 rounded-full bg-cyan-500/30 blur-3xl md:block" />
          <div className="absolute -bottom-24 left-10 hidden h-64 w-64 rounded-full bg-orange-500/20 blur-3xl md:block" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100">
                One paste could save thousands
              </div>
              <h2 className="mt-4 text-4xl font-black leading-[0.95] md:text-6xl">
                Don&apos;t guess. <span className="gradient-text">Scan it.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
                Every day, real people lose money to messages they suspected were fake but couldn&apos;t
                prove in the moment. ScamRadar gives you proof — in seconds.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#checker" className="rounded-2xl bg-cyan-500 px-6 py-4 text-base font-black text-white transition hover:bg-cyan-400 glow-red">
                  Run your first check — free
                </Link>
                <Link href="/pricing" className="rounded-2xl border border-white/15 bg-white/[0.05] px-6 py-4 text-base font-semibold text-white transition hover:bg-white/[0.12]">
                  Compare plans
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-black/55 p-5 md:bg-black/35 md:backdrop-blur">
                <div className="mono-readout text-4xl font-black text-white">$47M+</div>
                <div className="mt-1 text-sm text-white/70">Losses prevented across community reports.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/55 p-5 md:bg-black/35 md:backdrop-blur">
                <div className="mono-readout text-4xl font-black text-white">1.8s</div>
                <div className="mt-1 text-sm text-white/70">Average response time — faster than reading twice.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/55 p-5 md:bg-black/35 md:backdrop-blur">
                <div className="mono-readout text-4xl font-black text-white">47</div>
                <div className="mt-1 text-sm text-white/70">Countries with active users and watchlists.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHARE + BOT */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-panel rounded-3xl p-6">
            <div className="mono-readout text-3xl font-black text-white">Bot-ready</div>
            <div className="mt-2 text-lg font-bold">Telegram / WhatsApp entry</div>
            <div className="mt-1 text-sm text-white/65">Connect bot workflows via API or quick-share links.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={telegramShareLink} target="_blank" rel="noreferrer" className="rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
                Telegram share
              </a>
              <a href={whatsappShareLink} target="_blank" rel="noreferrer" className="rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
                WhatsApp share
              </a>
              <Link href="/bot" className="rounded-lg border border-cyan-300/30 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/30">
                Bot API docs
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <div className="mono-readout text-3xl font-black text-white">History + Export</div>
            <div className="mt-2 text-lg font-bold">Decision trail</div>
            <div className="mt-1 text-sm text-white/65">Keep recent checks, reuse inputs, and export proof in one click.</div>
          </div>

          <div className="rounded-3xl border border-cyan-300/35 bg-cyan-500/15 p-6">
            <div className="mono-readout text-3xl font-black text-cyan-100">Community Intel</div>
            <div className="mt-2 text-lg font-bold">Crowd-powered warnings</div>
            <div className="mt-1 text-sm text-white/80">Report suspicious domains/sellers and strengthen future risk detection.</div>
          </div>
        </div>
      </section>

      {/* Mobile floating CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden">
        <a
          href="#checker"
          className="flex items-center justify-center rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-white shadow-[0_20px_60px_-15px_rgba(255,54,71,0.75)]"
        >
          ⚡ Run a free check
        </a>
      </div>

      <PaywallModal show={showPaywall} onClose={() => setShowPaywall(false)} />
      <FlashOffer premium={premium || (dbUser?.premium ?? false)} />
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setDbUser(user);
          if (user.premium) setPremium(true);
          if (user.credits > 0) setCredits(user.credits);
        }}
      />
    </main>
  );
}
