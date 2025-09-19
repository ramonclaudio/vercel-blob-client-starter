'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RotateCcw, Images, Home } from 'lucide-react'
import Link from 'next/link'

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Gallery page error:', error)

  // In production, you could send this to an error reporting service
  // Example: Sentry.captureException(error, { tags: { page: 'gallery' } })

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-destructive/10 p-3 rounded-full">
              <AlertTriangle className="size-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl">Gallery Error</CardTitle>
          <CardDescription>
            An error occurred while loading the gallery page. This could be due to a temporary issue with the file listing system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono text-muted-foreground">
                <strong>Error:</strong> {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What you can try:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Refresh the page to reload the gallery</li>
              <li>• Clear your browser cache</li>
              <li>• Try uploading some files first</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RotateCcw className="size-4 mr-2" />
              Try Again
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="size-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/upload">
                  <Images className="size-4 mr-2" />
                  Upload
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}