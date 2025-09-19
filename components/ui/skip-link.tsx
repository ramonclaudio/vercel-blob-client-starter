export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only fixed left-1/2 top-4 z-[9999] -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}