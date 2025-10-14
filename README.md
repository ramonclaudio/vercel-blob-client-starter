# Vercel Blob Client-Side Starter

Complete client-side Vercel Blob starter with Next.js 16 & React 19. Features: drag & drop uploads, progress tracking, multipart support, advanced configuration, file gallery, copy/delete operations, professional SEO & social sharing, and 100% SDK compliance. Built with TypeScript, Tailwind CSS v4, and shadcn/ui components.

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
- **React 19 Optimized** - Advanced hooks patterns and state management
- **Accessibility First** - Full WCAG compliance with skip links and screen reader support
- **Error Resilience** - Comprehensive error boundaries and recovery system
- **Navigation Safety** - Protected navigation with data loss prevention

## 🛠 Tech Stack

- **Next.js 16** with App Router
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

### React 19 Cache Features (Next.js Canary)

This project includes comprehensive React 19 `'use cache'` implementation that's ready to activate:

1. **Upgrade to Next.js canary** (optional):
   ```bash
   pnpm add next@canary
   ```

2. **Enable experimental caching in `next.config.ts`**:
   ```typescript
   experimental: {
     useCache: true,
     cacheComponents: true,
   }
   ```

3. **Uncomment cache directives** in these files:
   - `app/layout.tsx` - File-level caching
   - `lib/cached-utils.ts` - Function-level caching
   - `lib/cache-config.ts` - Cache lifecycle management
   - `lib/cache-tags.ts` - Cache tagging for invalidation
   - `lib/cache-invalidation.ts` - Server actions for cache control

4. **Restart development server** to enable caching features.

> **Note**: Cache features work with stable Next.js but are commented out for compatibility. Uncomment when using Next.js canary with experimental flags enabled.

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

### React 19 Advanced Features
- ✅ **useReducer State Management** - Complex state consolidation with predictable transitions
- ✅ **useOptimistic Instant Feedback** - Zero-latency UI updates with automatic rollback
- ✅ **startTransition Non-blocking** - Smooth updates that maintain UI responsiveness
- ✅ **useId Accessibility** - Dynamic ID generation for form elements and ARIA compliance
- ✅ **useMemo Performance** - Memoized expensive calculations (formatBytes, formatDuration)
- ✅ **useCallback Optimization** - Optimized callbacks to prevent unnecessary re-renders
- ✅ **'use cache' Directive** - React 19 function-level caching (ready for Next.js canary)

### Accessibility & Navigation
- ✅ **WCAG Compliance** - Full Web Content Accessibility Guidelines adherence
- ✅ **Skip to Content** - Keyboard navigation with proper focus management
- ✅ **Screen Reader Support** - Semantic HTML and ARIA attributes throughout
- ✅ **Navigation Protection** - Prevent accidental data loss during uploads
- ✅ **Safe Link Components** - Optimized internal navigation with prefetching
- ✅ **Mobile Touch Targets** - 44px minimum touch targets for accessibility
- ✅ **Motion Preferences** - Respects `prefers-reduced-motion` for accessibility

### Error Handling & Resilience
- ✅ **Global Error Boundary** - Application-wide error catching and recovery
- ✅ **Page-specific Boundaries** - Isolated error handling for upload and gallery pages
- ✅ **Retry Mechanisms** - Automatic and manual retry for failed operations
- ✅ **Advanced Recovery** - Smart error recovery with exponential backoff
- ✅ **User-friendly Messages** - Clear error communication with actionable guidance
- ✅ **Custom 404 Page** - Enhanced not-found experience with navigation

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
│   │   ├── page.tsx               # Main upload interface with React 19 hooks
│   │   ├── error.tsx              # Upload page error boundary
│   │   └── loading.tsx            # Upload page loading states
│   ├── gallery/
│   │   ├── page.tsx               # File gallery with optimistic updates
│   │   ├── error.tsx              # Gallery page error boundary
│   │   └── loading.tsx            # Gallery page loading states
│   ├── robots.txt/route.ts        # Dynamic robots.txt generation
│   ├── sitemap.xml/route.ts       # Dynamic sitemap.xml generation
│   ├── opengraph-image.tsx        # Dynamic OpenGraph image (1200x630)
│   ├── twitter-image.tsx          # Dynamic Twitter card image (1200x600)
│   ├── global-error.tsx           # Global error boundary
│   ├── not-found.tsx              # Custom 404 page
│   ├── viewport.ts                # Viewport configuration
│   ├── favicon.ico                # Site favicon
│   └── layout.tsx                 # Root layout with React 19 cache directives
├── components/
│   ├── ui/                        # shadcn/ui components (22 components)
│   │   ├── error-boundary.tsx     # Reusable error boundary component
│   │   ├── error-display.tsx      # Error display with retry functionality
│   │   ├── skip-link.tsx          # Accessibility skip navigation
│   │   ├── safe-link.tsx          # Safe internal navigation component
│   │   ├── hover-prefetch-link.tsx # Performance-optimized navigation
│   │   ├── search-button.tsx      # Next.js Form integration
│   │   ├── text-units.tsx         # Screen reader text utilities
│   │   └── skeleton.tsx           # Loading state component
│   ├── layout/
│   │   ├── Header.tsx             # Navigation with accessibility features
│   │   └── Footer.tsx             # Footer with safe navigation
│   ├── home/                      # React 19 cached components
│   │   ├── FeaturesShowcase.tsx   # Cached features display
│   │   ├── DemoModes.tsx          # Cached demo sections
│   │   ├── ModernTechnologies.tsx # Cached tech stack
│   │   └── DeployToVercel.tsx     # Cached deployment section
│   ├── upload/
│   │   ├── UploadZone.tsx         # Drag & drop with useOptimistic
│   │   └── AdvancedConfig.tsx     # useReducer state management
│   └── gallery/
│       ├── FileGallery.tsx        # File management with optimistic updates
│       └── MetadataDialog.tsx     # File metadata display
├── contexts/
│   └── navigation-blocker.tsx     # Navigation protection context
├── hooks/
│   ├── useClientUpload.ts         # Upload with startTransition optimization
│   ├── useDeleteBlob.ts           # Blob deletion with abort signals
│   ├── useCopyBlob.ts             # Optimistic blob duplication
│   ├── useBlobMetadata.ts         # Metadata retrieval with error recovery
│   └── useListBlobs.ts            # Paginated listing with performance hooks
├── lib/
│   ├── utils.ts                   # Core utility functions
│   ├── image-optimization.ts      # Next.js Image optimization utilities
│   ├── error-recovery.ts          # Advanced error recovery & retry logic
│   ├── cached-utils.ts            # React 19 cached utility functions
│   ├── cache-config.ts            # Cache lifecycle management
│   ├── cache-tags.ts              # Cache tagging for invalidation
│   └── cache-invalidation.ts      # Server actions for cache management
└── middleware.ts                  # Geo-adaptive caching & CSP security headers
```

## 🎯 Key Implementation Highlights

### Two-Tab Interface
- **Standard Upload**: Simple drag & drop with sensible defaults
- **Advanced Configuration**: Complete control over all SDK parameters

### React 19 Advanced Patterns
- **useReducer Architecture** - Complex state management with predictable transitions
- **useOptimistic Updates** - Zero-latency UI feedback for delete/copy operations
- **startTransition Performance** - Non-blocking state updates for smooth UX
- **'use cache' Implementation** - Function-level caching ready for Next.js canary
- **Performance Hooks** - useMemo and useCallback optimization throughout
- **Dynamic ID Generation** - useId for accessibility-compliant form elements

### Accessibility & Navigation Excellence
- **WCAG 2.1 Compliance** - Full accessibility standards implementation
- **Skip Navigation** - Keyboard users can jump directly to main content
- **Navigation Protection** - Prevent data loss during uploads with blocker context
- **Screen Reader Support** - Comprehensive ARIA labels and semantic HTML
- **Mobile Accessibility** - 44px touch targets and optimized mobile experience
- **Motion Preferences** - Respects user's reduced motion settings

### Enterprise-Grade Features
- **Professional UI/UX** with modern drag & drop interface
- **Comprehensive Error Handling** with user-friendly messages and retry mechanisms
- **State Management** using React 19 optimized custom hooks
- **Real-time Updates** with toast notifications and optimistic feedback
- **Responsive Design** that works on all devices with accessibility focus

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
- [React 19 Documentation](https://react.dev/blog/2024/04/25/react-19)
- [React Hooks Reference](https://react.dev/reference/react/hooks)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)

### SEO & Metadata
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [OpenGraph Image Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Dynamic OG Images with `next/og`](https://vercel.com/docs/og-image-generation)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [robots.txt Best Practices](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)

### React 19 & Performance
- [React 19 useOptimistic Hook](https://react.dev/reference/react/useOptimistic)
- [React 19 startTransition](https://react.dev/reference/react/startTransition)
- [React 19 useReducer Guide](https://react.dev/reference/react/useReducer)
- [React 19 'use cache' Directive](https://react.dev/reference/rsc/use-cache)
- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)

### Accessibility & UX
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Next.js Accessibility Features](https://nextjs.org/docs/app/building-your-application/optimizing/accessibility)
- [React Accessibility Documentation](https://react.dev/learn/accessibility)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request [here](https://github.com/RMNCLDYO/vercel-blob-client-starter/pulls).

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
