'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface InputDropdownProps {
  title: string
  options: string[]
  width?: string
  className?: string
  onSelect?: (option: string) => void
  label?: string
}

export function InputDropdown({ 
  title, 
  options, 
  width = "w-full", 
  className,
  onSelect,
  label
}: InputDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(options[0] || '')

  const handleSelect = (option: string) => {
    setSelectedOption(option)
    setIsOpen(false)
    onSelect?.(option)
  }

  return (
    <div className={cn("relative", width, className)}>

      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        className="h-8 text-left rounded-md bg-card border border-border px-4 w-full flex items-center justify-between hover:bg-muted transition-colors"
      >
        <span className="text-sm text-muted-foreground">{selectedOption || title}</span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 