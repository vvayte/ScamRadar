import type { UrlInspectionResult } from "@/lib/urlInspector";
import type { ImageInspectionResult } from "@/lib/imageInspector";

/**
 * A forensic artifact represents something the backend ACTUALLY checked.
 * The UI must render only artifacts whose status is "checked" — never invent
 * domain age / WHOIS / wallet reputation / etc. that we did not compute.
 */
export type ArtifactStatus = "checked" | "not_checked" | "unavailable";

export type AnalysisArtifact = {
  type:
    | "url_scan"
    | "marketplace_match"
    | "image_text_extraction"
    | "image_visual_check"
    | "community_intel"
    | "trust_signals"
    | "no_artifacts";
  label: string;
  status: ArtifactStatus;
  value?: string;
  source?: string;
};

type BuildArtifactsInput = {
  urlInspection?: UrlInspectionResult | null;
  imageInspection?: ImageInspectionResult | null;
  communityHints?: string[];
  hasImage?: boolean;
};

/**
 * Build the artifact list from real analysis output. If a category was not
 * exercised (e.g. no URLs were submitted, no image uploaded), it is OMITTED
 * — we never emit fake "Live data · Shield" labels to fill space.
 */
export function buildAnalysisArtifacts(input: BuildArtifactsInput): AnalysisArtifact[] {
  const { urlInspection, imageInspection, communityHints, hasImage } = input;
  const artifacts: AnalysisArtifact[] = [];

  if (urlInspection && urlInspection.urls.length > 0) {
    artifacts.push({
      type: "url_scan",
      label: "URL inspection",
      status: "checked",
      value: `Inspected ${urlInspection.urls.length} URL${urlInspection.urls.length === 1 ? "" : "s"}: ${urlInspection.urls.slice(0, 3).join(", ")}`,
      source: "ScamRadar URL inspector",
    });

    if ((urlInspection.trustedMarketplaceHosts || []).length > 0) {
      artifacts.push({
        type: "marketplace_match",
        label: "Marketplace match",
        status: "checked",
        value: `Recognised marketplace host${urlInspection.trustedMarketplaceHosts.length === 1 ? "" : "s"}: ${urlInspection.trustedMarketplaceHosts.join(", ")}`,
        source: "Known marketplace registry",
      });
    }

    if ((urlInspection.trustSignals || []).length > 0) {
      artifacts.push({
        type: "trust_signals",
        label: "Trust signals from URL",
        status: "checked",
        value: urlInspection.trustSignals.slice(0, 3).join("; "),
        source: "URL inspector",
      });
    }
  }

  if (hasImage && imageInspection) {
    if (imageInspection.extractedText && imageInspection.extractedText.trim().length > 0) {
      const preview = imageInspection.extractedText.trim().slice(0, 220);
      artifacts.push({
        type: "image_text_extraction",
        label: "Image text extraction",
        status: "checked",
        value: preview,
        source: "OCR via vision model",
      });
    }
    artifacts.push({
      type: "image_visual_check",
      label: "Image visual analysis",
      status: "checked",
      value:
        imageInspection.riskHints.length > 0
          ? imageInspection.riskHints.slice(0, 2).join("; ")
          : "Reviewed image visually for scam cues; no strong visual red flags surfaced.",
      source: "Vision model heuristic",
    });
  }

  if (communityHints && communityHints.length > 0) {
    artifacts.push({
      type: "community_intel",
      label: "Community intel match",
      status: "checked",
      value: communityHints.slice(0, 2).join("; "),
      source: "ScamRadar community reports",
    });
  }

  if (artifacts.length === 0) {
    artifacts.push({
      type: "no_artifacts",
      label: "Forensic enrichment",
      status: "not_checked",
      value:
        "No external lookups were run for this submission (no URL, no image). Verdict is based on the message text alone.",
    });
  }

  return artifacts;
}
