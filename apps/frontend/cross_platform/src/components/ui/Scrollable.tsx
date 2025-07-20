'use client'

import React from 'react'
import { cn } from '../../lib/utils'

interface ScrollableProps {
  children: React.ReactNode
  className?: string
}

export function Scrollable({ children, className }: ScrollableProps) {
  return (
    <div 
      className={cn("flex-1 overflow-hidden overflow-y-auto h-full custom-scrollbar", className)}
    >
      {children}
    </div>
  )
} 