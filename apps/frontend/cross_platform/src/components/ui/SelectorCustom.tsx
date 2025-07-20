import React from 'react'

interface SelectorCustomProps {
  children: React.ReactNode
  className?: string
}

export function SelectorCustom({ children, className = '' }: SelectorCustomProps) {
  return (
    <div className={`text-sm text-muted-foreground flex items-center space-x-2 ${className}`}>
      {children}
    </div>
  )
} 