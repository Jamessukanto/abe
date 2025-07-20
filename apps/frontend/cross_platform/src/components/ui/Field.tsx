import React from 'react'

interface FieldProps {
  children: React.ReactNode
  className?: string
}

export function Field({ children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col space-y-2 py-3 ${className}`}>
      {children}
    </div>
  )
} 