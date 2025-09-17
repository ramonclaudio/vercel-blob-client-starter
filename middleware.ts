import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to add security headers and implement adaptive caching
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers to page responses (not API routes)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Content Security Policy for XSS protection
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https://*.blob.vercel-storage.com https://*.public.blob.vercel-storage.com; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.blob.vercel-storage.com https://*.public.blob.vercel-storage.com https://vercel.live; " +
    "media-src 'self' blob: https://*.blob.vercel-storage.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  // Cache static pages (home, upload, gallery) with SWR pattern
  const pathname = request.nextUrl.pathname;

  // Geo-based adaptive cache optimization
  const country = request.headers.get('x-vercel-ip-country');
  const continent = request.headers.get('x-vercel-ip-continent');

  // Determine cache strategy based on geographic proximity to edge locations
  // Users closer to major edge locations get longer cache times
  let cacheMultiplier = 1;

  // Major edge regions with higher cache optimization
  // Based on Vercel's global edge network distribution
  const isOptimalRegion =
    continent === 'NA' || // North America
    continent === 'EU' || // Europe
    (continent === 'AS' && ['JP', 'SG', 'IN', 'KR'].includes(country || '')) || // Major Asian hubs
    country === 'AU' || // Australia
    country === 'BR'; // Brazil

  if (isOptimalRegion) {
    cacheMultiplier = 2; // Double cache times for optimal regions
  }

  if (pathname === '/' || pathname === '/upload' || pathname === '/gallery') {
    // Adaptive cache based on user's geographic location
    const baseMaxAge = 60;
    const baseSWR = 3600;

    response.headers.set('Cache-Control', `public, s-maxage=${baseMaxAge * cacheMultiplier}, stale-while-revalidate=${baseSWR * cacheMultiplier}`);
    response.headers.set('CDN-Cache-Control', `public, max-age=${baseMaxAge * 5 * cacheMultiplier}, stale-while-revalidate=${baseSWR * cacheMultiplier}`);
    response.headers.set('Vary', 'X-Vercel-IP-Continent');
  }

  // Add prefetch hints for blob storage domains
  response.headers.set('Link', '<https://*.public.blob.vercel-storage.com>; rel=dns-prefetch');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};