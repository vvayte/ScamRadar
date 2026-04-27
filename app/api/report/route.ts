import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getClientIp } from "@/lib/requestGuard";
import { submitThreatReport } from "@/lib/platformDataStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const rate = consumeRateLimit(getClientIp(req.headers), 2);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const indicatorValue = String(body?.indicatorValue || "").trim();
    if (!indicatorValue) {
      return NextResponse.json({ error: "Indicator value is required." }, { status: 400 });
    }

    const report = submitThreatReport({
      indicatorType: body?.indicatorType,
      indicatorValue,
      platform: String(body?.platform || ""),
      notes: String(body?.notes || ""),
      reporterEmail: String(body?.reporterEmail || ""),
    });

    return NextResponse.json({ ok: true, reportId: report.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }
}
