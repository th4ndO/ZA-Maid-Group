import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// Vercel's preview toolbar needs vercel.live; production doesn't.
const isPreview = process.env.VERCEL_ENV === "preview";
const vercelLive = isPreview ? " https://vercel.live" : "";
const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ofbitzqczupdobofuosh.supabase.co").origin;

// Pages are pre-built (static), so nonces aren't possible; Next's small inline bootstrap
// scripts and the inlined CSS need 'unsafe-inline'. Everything else is locked to the
// services the site actually uses.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://nominatim.openstreetmap.org ${supabase}${vercelLive}`,
  `frame-src https://www.google.com https://calendar.google.com${vercelLive}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    // Ship the (small, ~10 KB) stylesheet inside the HTML so first-time visitors on slow
    // connections don't wait for a separate CSS request before anything appears.
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Not "no-referrer": OpenStreetMap's usage policy needs a Referer from browsers.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // geolocation is used by "Use my current location" in the booking form.
            value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
