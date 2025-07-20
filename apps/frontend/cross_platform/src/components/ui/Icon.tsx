'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface IconProps {
  icon?: LucideIcon | null
  size?: 'sm' | 'md' | 'lg'
  color?: 'muted' | 'primary'
  onClick?: () => void
  className?: string
}

export function Icon({ 
  icon: IconComponent, 
  size = 'md', 
  color = 'muted',
  onClick,
  className 
}: IconProps) {
  const sizeButton = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  }
  const sizeIcon = {
    sm: 'px-2 py-2',
    md: 'px-2 py-2',
    lg: 'px-2 py-2'
  }
  const colorClasses = {
    muted: 'bg-background hover:bg-muted',
    primary: 'bg-primary hover:bg-primary/80'
  }

  // Calculate total button dimensions for spacer
  const spacerSizes = {
    sm: 'h-10 w-10', 
    md: 'h-8 w-10', 
    lg: 'h-10 w-10' 
  }

  // If no icon prop provided at all, render nothing
  if (IconComponent === undefined) {
    return null
  }

  // If icon is null, render invisible spacer with total button dimensions
  if (IconComponent === null) {
    return (
      <div
        className={cn(
          "pointer-events-none invisible",
          spacerSizes[size],
          className
        )}
      />
    )
  }

  // If icon is provided, render button with icon
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md transition-colors",
        sizeIcon[size],
        colorClasses[color],
        className
      )}
    >
      <IconComponent 
        className={cn(
          'bg-transparent',
          sizeButton[size],
        )} 
      />
    </button>
  )
} 