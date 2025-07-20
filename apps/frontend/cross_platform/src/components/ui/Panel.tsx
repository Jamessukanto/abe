import React from 'react'
import { cn } from '../../lib/utils'

interface PanelProps {
  children: React.ReactNode
  className?: string
  height?: string
}

export function Panel({ children, className, height = "h-60" }: PanelProps) {
  return (
    <div className={cn("flex flex-col px-5 pt-5 pb-1 text-muted-foreground border-b border-border", className, height)}>
      {children}
    </div>
  )
} 