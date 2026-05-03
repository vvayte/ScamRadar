/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Force apex (scamradar.pro) -> www.scamradar.pro so the canonical URL is
  // consistent regardless of how a user typed the address. Belt-and-suspenders
  // on top of the Vercel domain UI redirect.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "scamradar.pro" }],
        destination: "https://www.scamradar.pro/:path*",
        permanent: true,
      },
      // Redirect any leftover /ru/* links from the bilingual era back to root.
      { source: "/ru", destination: "/", permanent: true },
      { source: "/ru/:path*", destination: "/:path*", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

module.exports = nextConfig;
