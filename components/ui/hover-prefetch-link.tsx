'use client'

import { useState } from 'react'
import Link from 'next/link'

export function HoverPrefetchLink({
  href,
  children,
  className,
  ...props
}: {
  href: string
  children: React.ReactNode
  className?: string
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'prefetch'>) {
  const [active, setActive] = useState(false)

  return (
    <Link
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
      className={className}
      {...props}
    >
      {children}
    </Link>
  )
}