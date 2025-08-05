'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function Footer() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string; isLast?: boolean }> = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Format segment for display
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
        {/* Breadcrumbs */}
        <div className="py-4 border-b border-border/20">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Footer Content */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden">
          {/* About Section */}
          <div className="space-y-4 min-w-0">
            <h3 className="text-lg font-semibold break-words">Vercel Blob Client Starter</h3>
            <p className="text-sm text-muted-foreground leading-relaxed break-words">
              A complete demonstration of every client-side and management feature 
              available in the @vercel/blob package. Achieve 100% SDK compliance 
              with enterprise-grade enhancements.
            </p>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">VB</span>
              </div>
              <span className="text-sm font-medium">100% SDK Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 min-w-0">
            <h3 className="text-lg font-semibold break-words">Quick Links</h3>
            <div className="space-y-2">
              <Link 
                href="/upload" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Upload Files
              </Link>
              <Link 
                href="/gallery" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                File Gallery
              </Link>
              <a 
                href="https://vercel.com/docs/storage/vercel-blob" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </a>
              <a 
                href="https://github.com/vercel/blob" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 min-w-0">
            <h3 className="text-lg font-semibold break-words">Features</h3>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                ✓ Client Uploads with Progress Tracking
              </div>
              <div className="text-sm text-muted-foreground">
                ✓ Multipart Uploads for Large Files
              </div>
              <div className="text-sm text-muted-foreground">
                ✓ Complete Blob Management (Copy, Delete, List)
              </div>
              <div className="text-sm text-muted-foreground">
                ✓ Advanced Configuration Options
              </div>
              <div className="text-sm text-muted-foreground">
                ✓ Modern UI with shadcn/ui Components
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-4 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 Vercel Blob Client Starter Kit
          </div>
          <div className="flex items-center space-x-2">
            <a 
              href="https://github.com/RMNCLDYO" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Created by Ray
            </a>
            <span className="text-muted-foreground">|</span>
            <a 
              href="https://vercel.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Powered by Vercel
            </a>
            <span className="text-muted-foreground">|</span>
            <a 
              href="https://nextjs.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Built with Next.js
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}