/**
 * Utility functions for error recovery and retry logic
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      onRetry?.(attempt + 1, lastError)

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      )

      // Add some jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay
      await new Promise(resolve => setTimeout(resolve, delay + jitter))
    }
  }

  throw lastError!
}

/**
 * Check if an error is retriable
 */
export function isRetriableError(error: Error): boolean {
  // Network errors
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return true
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    return true
  }

  // Rate limiting
  if (error.message.includes('429') || error.message.includes('rate limit')) {
    return true
  }

  // Server errors (5xx)
  if (error.message.includes('500') || error.message.includes('502') ||
      error.message.includes('503') || error.message.includes('504')) {
    return true
  }

  return false
}

/**
 * Enhanced error information for better user feedback
 */
export interface EnhancedError extends Error {
  code?: string
  statusCode?: number
  retriable?: boolean
  userMessage?: string
}

export function enhanceError(error: Error | unknown): EnhancedError {
  if (!(error instanceof Error)) {
    return {
      name: 'UnknownError',
      message: String(error),
      userMessage: 'An unexpected error occurred',
      retriable: false,
    } as EnhancedError
  }

  const enhanced = error as EnhancedError

  // Add user-friendly messages based on error patterns
  if (error.name === 'AbortError') {
    enhanced.userMessage = 'Operation was cancelled'
    enhanced.retriable = false
  } else if (error.message.includes('network') || error.message.includes('fetch')) {
    enhanced.userMessage = 'Network connection failed. Please check your internet connection.'
    enhanced.retriable = true
  } else if (error.message.includes('403') || error.message.includes('unauthorized')) {
    enhanced.userMessage = 'Access denied. Please check your permissions.'
    enhanced.retriable = false
  } else if (error.message.includes('404')) {
    enhanced.userMessage = 'The requested resource was not found.'
    enhanced.retriable = false
  } else if (error.message.includes('429')) {
    enhanced.userMessage = 'Too many requests. Please wait a moment and try again.'
    enhanced.retriable = true
  } else if (error.message.includes('500') || error.message.includes('502') ||
             error.message.includes('503') || error.message.includes('504')) {
    enhanced.userMessage = 'Server error. Please try again in a moment.'
    enhanced.retriable = true
  } else {
    enhanced.userMessage = 'Something went wrong. Please try again.'
    enhanced.retriable = isRetriableError(error)
  }

  return enhanced
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private failureThreshold = 5,
    private resetTimeout = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.resetTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures++
    this.lastFailTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState() {
    return this.state
  }
}