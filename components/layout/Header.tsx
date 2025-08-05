'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">VB</span>
            </div>
            <span className="font-bold text-xl">Vercel Blob</span>
          </Link>

          {/* Navigation */}
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === '/' && 'bg-accent text-accent-foreground'
                    )}
                  >
                    Home
                  </Link>
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
                  <Link
                    href="/gallery"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === '/gallery' && 'bg-accent text-accent-foreground'
                    )}
                  >
                    Gallery
                  </Link>
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
        </div>
      </div>
    </header>
  );
}

const ListItem = ({
  className,
  title,
  children,
  href,
  external = false,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  external?: boolean;
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
      <Link href={href}>{content}</Link>
    </NavigationMenuLink>
  );
};