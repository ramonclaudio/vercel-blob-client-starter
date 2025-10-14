import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Next.js 16: headers() must be awaited
  const headers = await request.headers
  const host = headers.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  const robotsTxt = `# Robots.txt for Vercel Blob Client Starter Kit
# https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt

User-agent: *
Allow: /

# Allow crawling of main pages
Allow: /upload
Allow: /gallery

# Disallow crawling of API routes
Disallow: /api/

# Disallow crawling of Next.js internal files
Disallow: /_next/

# Allow search engines to access static assets
Allow: /favicon.ico
Allow: /opengraph-image
Allow: /twitter-image

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional, in seconds)
Crawl-delay: 1
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}