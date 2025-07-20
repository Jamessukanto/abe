import React from 'react'
import { cn } from '../../lib/utils'

interface TabProps {
  text: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function Tab({ text, active = false, onClick, className }: TabProps) {
  return (
    <div 
      className={cn(
        "flex flex-col cursor-pointer transition-colors flex-1",
        "hover:text-primary hover:border-primary",
        active && "text-primary border-primary",
        !active && "text-muted-foreground border-transparent",
        className
      )}
      onClick={onClick}
    >
      <span className="px-4 py-2 text-sm text-center">
        {text}
      </span>
      <div className={cn(
        "h-0.5 transition-colors",
        active ? "bg-primary" : "bg-border",
        "hover:border-primary",
      )} />
    </div>
  )
} 