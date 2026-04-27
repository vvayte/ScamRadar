import type { MetadataRoute } from "next";

const fallbackUrl = "https://scamradar.app";

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || fallbackUrl;
  try {
    return new URL(raw).origin;
  } catch {
    return fallbackUrl;
  }
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/success", "/cancel"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
