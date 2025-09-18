import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  title: "Vercel Blob Client Starter Kit",
  description: "Comprehensive showcase of Vercel Blob client-side upload features built with Next.js 15, React 19, and shadcn/ui",
  keywords: ["vercel", "blob", "upload", "nextjs", "react", "shadcn", "tailwind"],
  authors: [{ name: "Vercel" }],
  creator: "Vercel",
  openGraph: {
    title: "Vercel Blob Client Starter Kit",
    description: "Ultimate showcase of Vercel Blob client-side features",
    type: "website",
  },
  other: {
    'dns-prefetch-1': 'https://blob.vercel-storage.com',
    'dns-prefetch-2': 'https://public.blob.vercel-storage.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col overflow-x-hidden bg-background text-foreground`}
      >
        <Header />
        <main className="flex-1 container-wrapper">
          <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
            {children}
          </div>
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
