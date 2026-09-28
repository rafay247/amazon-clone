import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/deals", destination: "/s?deals=1&sort=featured", permanent: false }];
  },
  images: {
    // Catalog images are already-sized webp from the DummyJSON CDN; skip the optimizer
    // so we don't burn the Vercel image quota.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.dummyjson.com" }],
  },
};

export default nextConfig;
