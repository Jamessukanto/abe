import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps {
  text?: string
  onClick?: () => void
  className?: string
  variant?: 'fill' | 'outline'
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary'
}

export function Button({ 
  text = "Button",
  onClick,
  className,
  variant = 'fill',
  size = 'medium',
  color = 'primary'
}: ButtonProps) {
  const baseClasses = "font-medium transition-colors"
  
  const variantClasses = {
    fill: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary"
    },
    outline: {
      primary: "bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary",
      secondary: "bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground focus:ring-secondary"
    }
  }
  
  const sizeClasses = {
    small: "px-4 py-1.5 text-xs rounded-sm",
    medium: "px-6 py-2 text-sm rounded-sm",
    large: "px-8 py-3 text-base rounded-md"
  }
  
  return (
    <button 
      className={cn(
        baseClasses,
        variantClasses[variant][color],
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {text}
    </button>
  )
} 
