'use client'

import Link from 'next/link'
import { useNavigationBlocker } from '@/contexts/navigation-blocker'
import { ComponentProps } from 'react'

interface SafeLinkProps extends ComponentProps<typeof Link> {
  children: React.ReactNode
  confirmMessage?: string
  bypassConfirmation?: boolean
}

export function SafeLink({
  children,
  confirmMessage,
  bypassConfirmation = false,
  ...props
}: SafeLinkProps) {
  const { isBlocked } = useNavigationBlocker()

  const handleNavigate = (e: { preventDefault: () => void }) => {
    if (!isBlocked || bypassConfirmation) {
      return
    }

    const message = confirmMessage || 'File deletion in progress. Are you sure you want to leave?'

    if (!window.confirm(message)) {
      e.preventDefault()
    }
  }

  return (
    <Link onNavigate={handleNavigate} {...props}>
      {children}
    </Link>
  )
}

export function useSafeNavigation() {
  const { isBlocked } = useNavigationBlocker()

  const confirmNavigation = (message?: string): boolean => {
    if (!isBlocked) return true

    const confirmMessage = message || 'File deletion in progress. Are you sure you want to leave?'

    return window.confirm(confirmMessage)
  }

  return { confirmNavigation, isBlocked }
}