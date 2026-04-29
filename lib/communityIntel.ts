import db from "@/lib/db";

function extractDomainFromValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    if (/^https?:\/\//i.test(trimmed)) return new URL(trimmed).hostname.toLowerCase();
    return new URL(`https://${trimmed}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export async function getCommunityRiskHintsForUrls(urls: string[]): Promise<string[]> {
  const domains = Array.from(new Set(urls.map((url) => extractDomainFromValue(url)).filter(Boolean)));
  if (domains.length === 0) return [];

  const reports = await db.threatReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 3000,
    select: { indicatorValue: true },
  });

  const hints: string[] = [];
  for (const domain of domains) {
    const count = reports.filter((report) => extractDomainFromValue(report.indicatorValue) === domain).length;
    if (count > 0) {
      hints.push(`Community reports mention this domain (${domain}) ${count} time${count === 1 ? "" : "s"}`);
    }
  }

  return hints.slice(0, 3);
}

export async function submitThreatReport(input: {
  indicatorType?: string;
  indicatorValue: string;
  platform?: string;
  notes?: string;
  reporterEmail?: string;
}) {
  const indicatorType =
    input.indicatorType === "url" ||
    input.indicatorType === "domain" ||
    input.indicatorType === "seller"
      ? input.indicatorType
      : "other";

  return db.threatReport.create({
    data: {
      indicatorType,
      indicatorValue: String(input.indicatorValue || "").trim().slice(0, 400),
      platform: String(input.platform || "").trim().slice(0, 120) || null,
      notes: String(input.notes || "").trim().slice(0, 1200) || null,
      reporterEmail: input.reporterEmail ? String(input.reporterEmail).trim().toLowerCase().slice(0, 254) : null,
    },
  });
}
