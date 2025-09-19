'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { HoverPrefetchLink } from '@/components/ui/hover-prefetch-link';
import { SafeLink } from '@/components/ui/safe-link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
        <div className="flex h-16 items-center justify-between">
          <SafeLink href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">VB</span>
            </div>
            <span className="font-bold text-xl">Vercel Blob</span>
          </SafeLink>

          <NavigationMenu viewport={false} className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <SafeLink
                    href="/"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === '/' && 'bg-accent text-accent-foreground'
                    )}
                  >
                    Home
                  </SafeLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    pathname.startsWith('/upload') && 'bg-accent text-accent-foreground'
                  )}
                >
                  Upload
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-64 p-3">
                    <ListItem href="/upload" title="Standard Upload">
                      Simple drag & drop with sensible defaults
                    </ListItem>
                    <ListItem href="/upload?tab=advanced" title="Advanced Configuration">
                      Complete control over all SDK parameters
                    </ListItem>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <HoverPrefetchLink
                    href="/gallery"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === '/gallery' && 'bg-accent text-accent-foreground'
                    )}
                  >
                    Gallery
                  </HoverPrefetchLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent className="-translate-x-full">
                  <div className="w-56 p-3">
                    <ListItem
                      href="https://vercel.com/docs/storage/vercel-blob"
                      title="Documentation"
                      external
                    >
                      Official Vercel Blob docs
                    </ListItem>
                    <ListItem
                      href="https://github.com/RMNCLDYO/vercel-blob-client-starter"
                      title="GitHub"
                      external
                    >
                      View source and contribute
                    </ListItem>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-3">
                <MobileNavItem
                  href="/"
                  isActive={pathname === '/'}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </MobileNavItem>
                
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground px-3 py-2">Upload</span>
                  <MobileNavItem
                    href="/upload?tab=standard"
                    isActive={pathname === '/upload' && (typeof window === 'undefined' || !window.location.search.includes('tab=advanced'))}
                    onClick={() => setIsOpen(false)}
                    className="ml-3"
                  >
                    Standard Upload
                  </MobileNavItem>
                  <MobileNavItem
                    href="/upload?tab=advanced"
                    isActive={pathname === '/upload' && typeof window !== 'undefined' && window.location.search.includes('tab=advanced')}
                    onClick={() => setIsOpen(false)}
                    className="ml-3"
                  >
                    Advanced Configuration
                  </MobileNavItem>
                </div>

                <HoverPrefetchLink
                  href="/gallery"
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    pathname === '/gallery' && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Gallery
                </HoverPrefetchLink>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground px-3 py-2">Resources</span>
                  <MobileNavItem
                    href="https://vercel.com/docs/storage/vercel-blob"
                    onClick={() => setIsOpen(false)}
                    external
                    className="ml-3"
                  >
                    Documentation
                  </MobileNavItem>
                  <MobileNavItem
                    href="https://github.com/RMNCLDYO/vercel-blob-client-starter"
                    onClick={() => setIsOpen(false)}
                    external
                    className="ml-3"
                  >
                    GitHub
                  </MobileNavItem>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const MobileNavItem = ({
  href,
  children,
  isActive = false,
  external = false,
  onClick,
  className,
  prefetch,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  external?: boolean;
  onClick?: () => void;
  className?: string;
  prefetch?: false | null | undefined;
}) => {
  const baseClasses = cn(
    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
    isActive && 'bg-accent text-accent-foreground',
    className
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <SafeLink href={href} className={baseClasses} onClick={onClick} prefetch={prefetch}>
      {children}
    </SafeLink>
  );
};

const ListItem = ({
  className,
  title,
  children,
  href,
  external = false,
  prefetch,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  external?: boolean;
  prefetch?: false | null | undefined;
}) => {
  const content = (
    <div
      className={cn(
        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className
      )}
      {...props}
    >
      <div className="text-sm font-medium leading-none">{title}</div>
      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
        {children}
      </p>
    </div>
  );

  if (external) {
    return (
      <NavigationMenuLink asChild>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      </NavigationMenuLink>
    );
  }

  return (
    <NavigationMenuLink asChild>
      <SafeLink href={href} prefetch={prefetch}>{content}</SafeLink>
    </NavigationMenuLink>
  );
};