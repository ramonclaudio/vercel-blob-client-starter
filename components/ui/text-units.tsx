import { ReactNode } from 'react'

interface TextWithUnitsProps {
  children: ReactNode
  className?: string
}

export function TextWithUnits({ children, className }: TextWithUnitsProps) {
  return (
    <span className={`no-break ${className || ''}`}>
      {children}
    </span>
  )
}

export function withNonBreakingSpaces(text: string): string {
  return text.replace(/ /g, '\u00A0')
}

export const TextUnits = {
  fileSize: (size: number, unit: string) => (
    <TextWithUnits>{size}&nbsp;{unit}</TextWithUnits>
  ),

  shortcut: (keys: string) => (
    <TextWithUnits>{keys.replace(/ /g, '\u00A0')}</TextWithUnits>
  ),

  brand: (name: string) => (
    <TextWithUnits>{name.replace(/ /g, '\u00A0')}</TextWithUnits>
  ),
}