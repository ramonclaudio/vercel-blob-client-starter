// 'use cache'; // Enable for React 19 caching with Next.js canary + experimental.useCache: true

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/ui/skip-link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavigationBlockerProvider } from "@/contexts/navigation-blocker";
import type { SoftwareApplication, WithContext } from 'schema-dts';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  title: "Vercel Blob Client Starter Kit",
  description: "Comprehensive showcase of Vercel Blob client-side upload features built with Next.js 15, React 19, and shadcn/ui",
  keywords: ["vercel", "blob", "upload", "nextjs", "react", "shadcn", "tailwind", "typescript", "client-side", "file-upload", "drag-drop"],
  authors: [{ name: "Vercel" }],
  creator: "Vercel",
  publisher: "Vercel",
  applicationName: "Vercel Blob Client Starter Kit",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Vercel Blob Client Starter Kit",
    description: "Ultimate showcase of Vercel Blob client-side features with Next.js 15 and React 19",
    type: "website",
    url: "https://vercel-blob-client-starter.vercel.app",
    siteName: "Vercel Blob Client Starter Kit",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Vercel Blob Client Starter Kit - Complete client-side upload solution",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vercel Blob Client Starter Kit",
    description: "Complete client-side upload solution with Next.js 15, React 19, and modern UI components",
    creator: "@vercel",
    site: "@vercel",
    images: [
      {
        url: "/twitter-image",
        alt: "Vercel Blob Client Starter Kit",
        width: 1200,
        height: 600,
      },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.YANDEX_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION,
    } : undefined,
  },
  category: "Technology",
  classification: "Developer Tools",
  other: {
    'dns-prefetch-1': 'https://blob.vercel-storage.com',
    'dns-prefetch-2': 'https://public.blob.vercel-storage.com',
    'color-scheme': 'dark light',
    'format-detection': 'telephone=no',
  },
};

const jsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vercel Blob Client Starter',
  description: 'Complete client-side Vercel Blob starter with Next.js 15 & React 19. Features drag & drop uploads, progress tracking, multipart support, and advanced configuration.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  creator: {
    '@type': 'Organization',
    name: 'Vercel',
    url: 'https://vercel.com'
  },
  url: 'https://github.com/RMNCLDYO/vercel-blob-client-starter',
  featureList: [
    'Drag & Drop Upload',
    'Progress Tracking',
    'Multipart Support',
    'File Gallery Management',
    'Advanced Configuration',
    'Real-time Progress',
    'Cancel Uploads',
    'Professional SEO'
  ],
  downloadUrl: 'https://github.com/RMNCLDYO/vercel-blob-client-starter',
  installUrl: 'https://vercel.com/new/clone?repository-url=https://github.com/RMNCLDYO/vercel-blob-client-starter',
  screenshot: 'https://vercel-blob-client-starter.vercel.app/opengraph-image',
  softwareVersion: '1.0.1',
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
  inLanguage: 'en-US',
  license: 'https://opensource.org/licenses/MIT',
  keywords: 'vercel, blob, upload, nextjs, react, typescript, client-side, file-upload, drag-drop, shadcn'
};

export default async function RootLayout({ // async required for 'use cache'
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col overflow-x-hidden bg-background text-foreground`}
      >
        <SkipLink />
        <NavigationBlockerProvider>
          <Header />
          <main id="main-content" className="flex-1 container-wrapper scroll-mt-4">
            <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
              {children}
            </div>
          </main>
          <Footer />
          <Toaster />
        </NavigationBlockerProvider>
      </body>
    </html>
  );
}
