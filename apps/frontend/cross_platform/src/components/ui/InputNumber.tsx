import React from 'react'
import { cn } from '../../lib/utils'

interface InputNumberProps {
  width?: string
  min?: number
  max?: number
  placeholder?: string
  className?: string
}

export function InputNumber({ 
  width = 'w-full', 
  min = 0, 
  max = 100, 
  placeholder = "1",
  className 
}: InputNumberProps) {
  return (
    <input 
      type="text" 
      placeholder={placeholder}
      className={cn(
        "h-8 px-2 text-right rounded-md bg-background border border-border",
        "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
        "transition-colors",
        width, 
        className
      )}
      min={min}
      max={max}
    />
  )
} 