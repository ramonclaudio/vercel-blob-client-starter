# Vercel Blob Client-Side Starter

I wanted to learn the full surface area of Next.js 16 while it was still in canary. Vercel Blob was the vehicle. I tried to integrate every optimization I could at the time: React 19 hooks, multi-tier CDN caching, image optimization, the full `@vercel/blob` SDK, dynamic OG/sitemap/robots, WCAG accessibility. This is what I ended up with.

Next.js 16 + React 19 starter exercising every client-side Vercel Blob SDK feature.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ramonclaudio/vercel-blob-client-starter&env=BLOB_READ_WRITE_TOKEN&envDescription=Vercel%20Blob%20storage%20token&envLink=https://vercel.com/docs/storage/vercel-blob)

## Stack

- Next.js 16 (App Router)
- React 19 (`useOptimistic`, `useReducer`, `useId`, `startTransition`)
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui
- `@vercel/blob` v2

## Install

```bash
git clone https://github.com/ramonclaudio/vercel-blob-client-starter.git my-blob-app
cd my-blob-app
pnpm install
cp .env.example .env.local
```

In `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

Get a token from the [Vercel Storage Dashboard](https://vercel.com/dashboard/stores). Then:

```bash
pnpm dev
```

## Upload callbacks in local dev

For `onUploadCompleted` to fire during local dev, you need a public URL. Expose localhost with ngrok:

```bash
npm install -g ngrok
ngrok http 3000
```

Add the ngrok URL to `.env.local`:

```env
VERCEL_BLOB_CALLBACK_URL=https://your-ngrok-id.ngrok-free.app
```

Restart the dev server. In production on Vercel the callback URL is auto-configured.

## SEO verification (optional)

```env
GOOGLE_SITE_VERIFICATION=your_code
BING_SITE_VERIFICATION=your_code
YANDEX_VERIFICATION=your_code
```

Get codes from [Google Search Console](https://search.google.com/search-console), [Bing Webmaster](https://www.bing.com/webmasters), [Yandex Webmaster](https://webmaster.yandex.com).

## What's wired

**Upload**: `upload()` with `onUploadProgress`, `AbortSignal` for cancellation, automatic multipart for large files, bulk support with per-file error handling.

**Config**: folder pathnames, cache-control max-age, random suffix, overwrite permissions, custom metadata, content-type overrides.

**Management**: `copy()`, `head()`, `list()` with pagination, `del()`, `BlobAccessError` handling.

**Caching**: multi-tier CDN cache-control, geo-adaptive 2x cache for optimal regions, stale-while-revalidate, 1-year static asset cache.

**Images**: Next.js Image with WebP output, 4 responsive breakpoints, fixed quality 75, 31-day TTL, skip optimization below 10KB.

**SEO**: dynamic `opengraph-image.tsx` and `twitter-image.tsx`, dynamic `robots.txt` and `sitemap.xml` via App Router route handlers.

**Accessibility**: WCAG 2.1, skip links, semantic HTML, 44px touch targets, `prefers-reduced-motion`, navigation-blocker to prevent data loss during uploads.

**Errors**: global and per-page error boundaries, retry with exponential backoff, custom 404.

## React 19 cache (Next.js canary)

`'use cache'` wiring is in place but commented out for stable Next.js. To enable:

1. `pnpm add next@canary`
2. In `next.config.ts`: `experimental: { useCache: true, cacheComponents: true }`
3. Uncomment cache directives in `app/layout.tsx`, `lib/cached-utils.ts`, `lib/cache-config.ts`, `lib/cache-tags.ts`, `lib/cache-invalidation.ts`
4. Restart dev server

## License

MIT
