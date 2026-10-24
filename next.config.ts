import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: { root: process.cwd() },
  // The footer's "Last updated" date: the day this build ran, so every deploy refreshes it.
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10) },
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', has: [{ type: 'query', key: 'view', value: 'quick' }], destination: '/quick' }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
