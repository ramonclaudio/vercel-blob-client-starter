'use client'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function SearchButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Search className="w-4 h-4" />
      )}
      <span className="sr-only">
        {pending ? 'Searching...' : 'Search'}
      </span>
    </Button>
  )
}