import React from 'react'
import { cn } from '../../lib/utils'

interface TabsProps {
  children: React.ReactNode
  className?: string
}

export function Tabs({ children, className }: TabsProps) {
  return (
    <div className={cn("flex w-full py-1", className)}>
      {children}
    </div>
  )
} 