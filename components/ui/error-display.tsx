import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorDisplayProps {
  title?: string
  message?: string
  error?: Error | string | null
  onRetry?: () => void
  retryLabel?: string
  showRetry?: boolean
  children?: React.ReactNode
  className?: string
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  retryLabel = 'Try Again',
  showRetry = true,
  children,
  className = '',
}: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : null

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-destructive/10 p-3 rounded-full">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {children}

        {showRetry && onRetry && (
          <Button onClick={onRetry} className="w-full">
            <RotateCcw className="size-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface LoadingErrorProps extends Omit<ErrorDisplayProps, 'onRetry'> {
  isLoading?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function LoadingError({
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  title = 'Failed to load data',
  message = 'There was a problem loading the requested data.',
  ...props
}: LoadingErrorProps) {
  if (isLoading) {
    return null
  }

  return (
    <ErrorDisplay
      {...props}
      title={title}
      message={message}
      onRetry={onRefresh}
      retryLabel={isRefreshing ? 'Refreshing...' : 'Refresh'}
      showRetry={!!onRefresh}
    >
      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          This is usually a temporary issue. Try refreshing the page or check your internet connection.
        </p>
      </div>
    </ErrorDisplay>
  )
}