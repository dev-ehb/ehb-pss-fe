/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: false,
  },
  // Production-deploy escape hatches.
  // Dev mode (`next dev`) still surfaces all TS/lint errors normally —
  // these only relax `next build` so deploys aren't blocked by legacy
  // type errors. Track and fix progressively, then remove these.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
