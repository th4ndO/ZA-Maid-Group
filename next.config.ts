import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Ship the (small, ~10 KB) stylesheet inside the HTML so first-time visitors on slow
    // connections don't wait for a separate CSS request before anything appears.
    inlineCss: true,
  },
};

export default nextConfig;
