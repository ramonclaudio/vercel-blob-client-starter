import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  const robotsTxt = `# Robots.txt for Vercel Blob Client Starter Kit
# https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt

User-agent: *
Allow: /

# Allow crawling of main pages
Allow: /
Allow: /upload
Allow: /gallery

# Disallow crawling of API routes
Disallow: /api/

# Disallow crawling of private files
Disallow: /_next/
Disallow: /.*

# Allow search engines to access static assets
Allow: /favicon.ico
Allow: /opengraph-image.png
Allow: /twitter-image.png

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