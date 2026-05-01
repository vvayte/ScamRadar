import Link from "next/link";

export default function PublicFooter() {
  const year = new Date().getFullYear();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@scamradar.app";

  return (
    <footer className="mt-20 border-t border-white/8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-white/55 md:flex-row md:items-center md:justify-between md:px-8">
        <div>© {year} ScamRadar</div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <a href={`mailto:${supportEmail}`} className="hover:text-white">Contact</a>
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 pb-10 text-xs text-white/40 md:px-8">
        ScamRadar provides AI-assisted risk analysis, not a guarantee. Verify through official channels before sending money or personal data.
      </div>
    </footer>
  );
}
