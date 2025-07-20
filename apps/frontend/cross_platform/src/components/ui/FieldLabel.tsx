import React from 'react'

interface FieldLabelProps {
  label: string
  className?: string
}

export function FieldLabel({ label, className = '' }: FieldLabelProps) {
  return (
    <label className={`text-sm font-small text-muted-foreground ${className}`}>
      {label}
    </label>
  )
} 