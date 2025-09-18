import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

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

  const pathname = request.nextUrl.pathname;

  const country = request.headers.get('x-vercel-ip-country');
  const continent = request.headers.get('x-vercel-ip-continent');

  let cacheMultiplier = 1;

  const isOptimalRegion =
    continent === 'NA' || // North America
    continent === 'EU' || // Europe
    (continent === 'AS' && ['JP', 'SG', 'IN', 'KR'].includes(country || '')) || // Major Asian hubs
    country === 'AU' || // Australia
    country === 'BR'; // Brazil

  if (isOptimalRegion) {
    cacheMultiplier = 2;
  }

  if (pathname === '/' || pathname === '/upload' || pathname === '/gallery') {
    const baseMaxAge = 60;
    const baseSWR = 3600;

    response.headers.set('Cache-Control', `public, s-maxage=${baseMaxAge * cacheMultiplier}, stale-while-revalidate=${baseSWR * cacheMultiplier}`);
    response.headers.set('CDN-Cache-Control', `public, max-age=${baseMaxAge * 5 * cacheMultiplier}, stale-while-revalidate=${baseSWR * cacheMultiplier}`);
    response.headers.set('Vary', 'X-Vercel-IP-Continent');
  }

  response.headers.set('Link', '<https://*.public.blob.vercel-storage.com>; rel=dns-prefetch');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};