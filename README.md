# Vercel Blob Client-Side Starter

Complete client-side Vercel Blob starter with Next.js 15 & React 19. Features: drag & drop uploads, progress tracking, multipart support, advanced configuration, file gallery, copy/delete operations, professional SEO & social sharing, and 100% SDK compliance. Built with TypeScript, Tailwind CSS v4, and shadcn/ui components.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RMNCLDYO/vercel-blob-client-starter&env=BLOB_READ_WRITE_TOKEN&envDescription=Vercel%20Blob%20storage%20token&envLink=https://vercel.com/docs/storage/vercel-blob)

## ✨ Features

- **SDK Compliant** - Parity with official Vercel Blob documentation
- **Drag & Drop Upload** - Elegant upload interface with progress tracking
- **Multipart Support** - Automatic chunking for large files (>100MB)
- **Advanced Configuration** - Complete control over all upload options
- **File Gallery** - Preview, copy, delete, and manage all your blobs
- **Professional SEO** - Dynamic OpenGraph images, Twitter cards, and metadata
- **Social Sharing** - Auto-generated OG images with proper meta tags
- **Search Engine Ready** - Dynamic robots.txt and sitemap.xml generation
- **Responsive Design** - Works perfectly on all screen sizes
- **Modern UI** - Built with shadcn/ui and Tailwind CSS v4
- **Cancel Uploads** - Full abort signal support for all operations
- **Real-time Progress** - Live upload progress with detailed feedback
- **Type Safe** - Full TypeScript support with strict configuration

## 🛠 Tech Stack

- **Next.js 15** with App Router
- **React 19** with latest features
- **TypeScript** with strict configuration
- **Tailwind CSS v4** with custom theming
- **shadcn/ui** for all UI components
- **@vercel/blob v2.0** with full SDK compliance
- **Sonner** for toast notifications

## 🚀 Quick Start

### Deploy to Vercel

Deploy this template in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RMNCLDYO/vercel-blob-client-starter&env=BLOB_READ_WRITE_TOKEN&envDescription=Vercel%20Blob%20storage%20token&envLink=https://vercel.com/docs/storage/vercel-blob)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/RMNCLDYO/vercel-blob-client-starter.git my-blob-app
   cd my-blob-app
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Vercel Blob token to `.env.local`:
   ```env
   BLOB_READ_WRITE_TOKEN=your_blob_token_here
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Local Development with Upload Callbacks

For the `onUploadCompleted` callback to work during local development, you'll need to use a tunneling service like ngrok to expose your local server to the internet:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your development server:**
   ```bash
   pnpm dev
   ```

3. **In another terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL and add it to `.env.local`:**
   ```env
   VERCEL_BLOB_CALLBACK_URL=https://your-ngrok-id.ngrok-free.app
   ```

5. **Restart your development server** to pick up the new environment variable.

Now upload callbacks will work properly in your local development environment!

> **Note**: This is only needed for local development. When deployed to Vercel, the callback URL is automatically configured using Vercel's system environment variables.

## 📖 What You'll Learn

This starter demonstrates **every client-side Vercel Blob feature** with complete SDK compliance:

### Core Upload Features
- ✅ **Client-side uploads** using `upload()` from `@vercel/blob/client`
- ✅ **Progress tracking** with real-time `onUploadProgress` callbacks
- ✅ **Upload cancellation** using `AbortSignal` for user control
- ✅ **Multipart uploads** for large files with automatic chunking
- ✅ **File validation** (type, size, content restrictions)
- ✅ **Bulk upload support** with individual file error handling

### Advanced Configuration
- ✅ **Folder organization** via pathname prefixes (`uploads/images/file.jpg`)
- ✅ **Cache control settings** with custom max-age values
- ✅ **Random suffix control** for unique file naming
- ✅ **File overwrite permissions** with `allowOverwrite` option
- ✅ **Custom JSON metadata** payload support
- ✅ **Content type override** for specific MIME types

### File Management Operations
- ✅ **File duplication** using `copy()` from `@vercel/blob`
- ✅ **Blob metadata retrieval** using `head()` from `@vercel/blob`
- ✅ **Blob listing with pagination** using `list()` from `@vercel/blob`
- ✅ **Blob deletion** using `del()` from `@vercel/blob`
- ✅ **Comprehensive error handling** with `BlobAccessError` detection

### Performance & Caching
- ✅ **Multi-tier CDN caching** with Vercel-CDN-Cache-Control headers
- ✅ **Geo-adaptive optimization** - 2x cache times for optimal regions
- ✅ **Stale-while-revalidate** for instant responses with background updates
- ✅ **Static asset caching** - 1 year immutable cache for JS/CSS
- ✅ **Blob storage edge cache** - 90 days for uploaded content

### Image Optimization
- ✅ **Next.js Image component** for automatic optimization
- ✅ **WebP conversion** - 25-35% smaller than JPEG
- ✅ **4 responsive breakpoints** - Reduced to stay within 5K transformations/month
- ✅ **Lazy loading** with blur placeholder for smooth UX
- ✅ **Fixed quality (75)** - Consistent caching to minimize transformations
- ✅ **31-day cache TTL** - Vercel recommended maximum
- ✅ **Skip small images** - Unoptimized for files < 10KB
- ✅ **Single format** - WebP only to reduce transformation count by 50%

### SEO & Social Sharing
- ✅ **Dynamic OpenGraph images** using `next/og` with JSX and CSS
- ✅ **Twitter Card optimization** with custom 1200x600 images
- ✅ **Professional metadata** with comprehensive meta tags
- ✅ **Search engine verification** ready (Google, Bing, Yandex)
- ✅ **Dynamic robots.txt** with environment-aware configuration
- ✅ **Dynamic sitemap.xml** with automatic URL generation
- ✅ **Social media ready** for Facebook, LinkedIn, Twitter sharing
- ✅ **Extensionless image URLs** following NextJS 15 best practices

## 🏗 Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts        # Client upload token generation
│   │   ├── copy/route.ts          # Blob copy operations
│   │   ├── delete/route.ts        # Blob deletion
│   │   ├── metadata/route.ts      # Blob metadata retrieval
│   │   └── list/route.ts          # Blob listing with pagination
│   ├── upload/
│   │   ├── page.tsx               # Main upload interface
│   │   └── error.tsx              # Upload page error boundary
│   ├── gallery/
│   │   ├── page.tsx               # File gallery with all operations
│   │   └── error.tsx              # Gallery page error boundary
│   ├── robots.txt/route.ts        # Dynamic robots.txt generation
│   ├── sitemap.xml/route.ts       # Dynamic sitemap.xml generation
│   ├── opengraph-image.tsx        # Dynamic OpenGraph image (1200x630)
│   ├── twitter-image.tsx          # Dynamic Twitter card image (1200x600)
│   ├── global-error.tsx           # Global error boundary
│   ├── not-found.tsx              # Custom 404 page
│   ├── favicon.ico                # Site favicon
│   └── layout.tsx                 # Root layout with enhanced metadata
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── error-boundary.tsx     # Reusable error boundary component
│   │   └── error-display.tsx      # Error display with retry functionality
│   ├── upload/
│   │   ├── UploadZone.tsx         # Drag & drop component
│   │   └── AdvancedConfig.tsx     # Configuration panel
│   └── gallery/
│       └── FileGallery.tsx        # File management interface
├── hooks/
│   ├── useClientUpload.ts         # Upload logic with progress
│   ├── useDeleteBlob.ts           # Blob deletion with abort
│   ├── useCopyBlob.ts             # Blob duplication
│   ├── useBlobMetadata.ts         # Metadata retrieval
│   └── useListBlobs.ts            # Blob listing with pagination
├── lib/
│   ├── utils.ts                   # Utility functions
│   ├── image-optimization.ts      # Image optimization utilities
│   └── error-recovery.ts          # Advanced error recovery & retry logic
└── middleware.ts                  # Geo-adaptive caching & security headers
```

## 🎯 Key Implementation Highlights

### Two-Tab Interface
- **Standard Upload**: Simple drag & drop with sensible defaults
- **Advanced Configuration**: Complete control over all SDK parameters

### Enterprise-Grade Features
- **Professional UI/UX** with modern drag & drop interface
- **Comprehensive Error Handling** with user-friendly messages
- **State Management** using custom React hooks
- **Real-time Updates** with toast notifications
- **Responsive Design** that works on all devices

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Required: Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Optional: SEO & Search Engine Verification (for production)
GOOGLE_SITE_VERIFICATION=your_google_verification_code
YANDEX_VERIFICATION=your_yandex_verification_code
BING_SITE_VERIFICATION=your_bing_verification_code
```

**Required:**
- Get your Blob token from the [Vercel Storage Dashboard](https://vercel.com/dashboard/stores)

**Optional SEO Verification:**
- **Google**: [Google Search Console](https://search.google.com/search-console) → Property → Settings → Ownership verification
- **Bing**: [Bing Webmaster Tools](https://www.bing.com/webmasters) → Add Site → HTML Meta Tag method
- **Yandex**: [Yandex Webmaster](https://webmaster.yandex.com) → Add Site → HTML Meta Tag method

## 🧪 Testing SEO Features

### Generated Images & Metadata
```bash
# Build and start production server
npm run build
npm start

# Test generated images
curl -I http://localhost:3000/opengraph-image    # 1200x630 PNG
curl -I http://localhost:3000/twitter-image     # 1200x600 PNG

# Test SEO files
curl http://localhost:3000/robots.txt           # Dynamic robots.txt
curl http://localhost:3000/sitemap.xml          # Dynamic sitemap.xml
```

### Social Media Preview Tools
Test your OG images and metadata with these validators:
- **Twitter**: [Card Validator](https://cards-dev.twitter.com/validator)
- **Facebook**: [Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **LinkedIn**: [Post Inspector](https://www.linkedin.com/post-inspector/)
- **Discord**: Paste your URL in any Discord channel for preview

### Generated Meta Tags
View source on your deployed site to see the auto-generated meta tags:
```html
<meta property="og:image" content="https://your-domain.com/opengraph-image" />
<meta name="twitter:image" content="https://your-domain.com/twitter-image" />
<meta name="twitter:card" content="summary_large_image" />
<!-- + comprehensive SEO metadata -->
```

## 📚 Learn More

### Core Technologies
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Client-Side Uploads Guide](https://vercel.com/docs/storage/vercel-blob/client-uploads)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)

### SEO & Metadata
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [OpenGraph Image Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Dynamic OG Images with `next/og`](https://vercel.com/docs/og-image-generation)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [robots.txt Best Practices](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request [here](https://github.com/RMNCLDYO/vercel-blob-client-starter/pulls).

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.