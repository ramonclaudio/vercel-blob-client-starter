import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      }
    ],
    minimumCacheTTL: 2678400,

    deviceSizes: [640, 1080, 1920, 2048],

    imageSizes: [32, 64, 128, 256],

    formats: ['image/webp'],

    qualities: [75],

    dangerouslyAllowSVG: false,

    disableStaticImages: false,
    unoptimized: false,
  },

  compress: true,
  poweredByHeader: false,

  experimental: {
    scrollRestoration: true,
    webpackMemoryOptimizations: true,

    // React 19 caching features (Next.js 16 canary)
    // This enables: use cache, cacheLife, cacheTag, and PPR
    // To use PPR on specific routes, add: export const experimental_ppr = true
    cacheComponents: true,

    // Enable source maps for prerendering (useful for debugging)
    enablePrerenderSourceMaps: true,

    // Enable Runtime Data Cache for navigations (performance optimization)
    rdcForNavigations: true,

    // Turbopack filesystem caching for faster dev restarts (used by all Vercel apps)
    turbopackFileSystemCacheForDev: true,

    // Client-side route segment caching for improved navigation performance
    clientSegmentCache: true,

    // Note: inlineCss disabled due to CSP conflicts with style-src 'unsafe-inline'
    // inlineCss: true,

    // Fine-tune stale times for dynamic and static content
    staleTimes: {
      dynamic: 30,  // 30 seconds for dynamic content
      static: 180,  // 3 minutes for static content
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
