'use client'

import React, { useState } from 'react'
import { cn } from '../../lib/utils'

interface InputTextProps {
  placeholder?: string
  value?: string
  width?: string
  className?: string
  onChange?: (value: string) => void
  label?: string
}

export function InputText({ 
  placeholder = "Enter text...", 
  value: initialValue = "", 
  width = "w-full", 
  className,
  onChange,
  label
}: InputTextProps) {
  const [value, setValue] = useState(initialValue)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className={cn("relative", width, className)}>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-24 rounded-md bg-card border border-border px-4 py-2 w-full text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors resize-none"
        style={{ verticalAlign: 'top' }}
      />
    </div>
  )
} 