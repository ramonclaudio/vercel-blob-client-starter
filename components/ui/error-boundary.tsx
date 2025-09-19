'use client'

import React, { Component, ReactNode } from 'react'
import { ErrorDisplay } from './error-display'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  title?: string
  message?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.props.onError?.(error, errorInfo)

    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }

      return (
        <ErrorDisplay
          title={this.props.title}
          message={this.props.message}
          error={this.state.error}
          onRetry={this.retry}
        />
      )
    }

    return this.props.children
  }
}

export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)

    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }
}