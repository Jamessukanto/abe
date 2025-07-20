import React from 'react'
import { LucideIcon } from 'lucide-react'

interface SelectorButtonProps {
  icon: LucideIcon
  onClick?: () => void
  className?: string
}

export function SelectorButton({ icon: Icon, onClick, className = '' }: SelectorButtonProps) {
  return (
    <button 
      className={`bg-card hover:bg-muted px-4 py-2 rounded-full transition-colors ${className}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
    </button>
  )
} 