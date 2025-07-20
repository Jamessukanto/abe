import React from 'react'

interface FieldIconPairProps {
  children: React.ReactNode
  className?: string
}

export function FieldIconPair({ children, className = '' }: FieldIconPairProps) {
  return (
    <div className={`flex space-x-2 items-center justify-between ${className}`}>
      {children}
    </div>
  )
} 