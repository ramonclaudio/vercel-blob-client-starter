'use client'

import { useState } from 'react'
import { SafeLink } from '@/components/ui/safe-link'

export function HoverPrefetchLink({
  href,
  children,
  className,
  ...props
}: {
  href: string
  children: React.ReactNode
  className?: string
} & Omit<React.ComponentProps<typeof SafeLink>, 'href' | 'prefetch'>) {
  const [active, setActive] = useState(false)

  return (
    <SafeLink
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
      className={className}
      {...props}
    >
      {children}
    </SafeLink>
  )
}