import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HoverPrefetchLink } from "@/components/ui/hover-prefetch-link";
import { Upload, FileText, Images } from "lucide-react";
import type { WebApplication, WithContext } from 'schema-dts';
import { FeaturesShowcase } from "@/components/home/FeaturesShowcase";
import { DemoModes } from "@/components/home/DemoModes";
import { ModernTechnologies } from "@/components/home/ModernTechnologies";
import { DeployToVercel } from "@/components/home/DeployToVercel";

export default async function Home() {
  // Static URL for schema.org - compatible with PPR and caching
  const currentUrl = 'https://vercel-blob-client-starter.vercel.app';

  const webAppSchema: WithContext<WebApplication> = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Vercel Blob Upload Demo',
    description: 'Interactive demo showcasing Vercel Blob client-side upload capabilities with drag & drop interface',
    url: currentUrl,
    applicationCategory: 'BusinessApplication',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    operatingSystem: 'Web Browser',
    featureList: [
      'Drag & Drop File Upload',
      'Real-time Progress Tracking',
      'Gallery Management',
      'Advanced Upload Configuration',
      'Multi-format Support',
      'Copy & Delete Operations'
    ],
    screenshot: `${currentUrl}/opengraph-image`,
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
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    accessibilityAPI: ['ARIA'],
    accessibilityControl: ['fullKeyboardControl', 'fullMouseControl', 'fullTouchControl']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema).replace(/</g, '\\u003c'),
        }}
      />
      <section className="pt-12 lg:pt-20 pb-8 lg:pb-12">
        <div className="text-center mb-8 lg:mb-10">
          <div className="flex flex-col md:flex-row items-center justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full mb-4 md:mb-0 md:mr-4">
              <Upload className="size-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Vercel Blob Client Starter
            </h1>
          </div>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            The ultimate showcase of Vercel Blob client-side upload features. 
            Built with Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/upload">
                <Upload className="size-5 mr-2" />
                Try Upload Demo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <HoverPrefetchLink href="/gallery">
                <Images className="size-5 mr-2" />
                Browse Gallery
              </HoverPrefetchLink>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <a href="https://vercel.com/docs/storage/vercel-blob" target="_blank" rel="noopener noreferrer">
                <FileText className="size-5 mr-2" />
                Documentation
              </a>
            </Button>
          </div>
        </div>

      </section>

      <FeaturesShowcase />

      <DemoModes />

      <ModernTechnologies />

      <DeployToVercel />

    </div>
  );
}
