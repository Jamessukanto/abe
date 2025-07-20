import React from 'react'

interface PaginatorProps {
  children: React.ReactNode
  className?: string
}

export function Paginator({ children, className = '' }: PaginatorProps) {
  return (
    <div className={`bg-card rounded-full space-x-4 px-2 h-12 flex items-center border border-border ${className}`}>
      {children}
    </div>
  )
} 