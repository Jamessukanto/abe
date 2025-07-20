'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TreeRowProps {
  icon: LucideIcon
  name: string
  indent?: number
  onClick?: () => void
  className?: string
}

export function TreeRow({ icon: Icon, name, indent = 0, onClick, className }: TreeRowProps) {
  // Limit nesting to 5 levels
  const maxIndent = 5
  const currentIndent = Math.min(indent, maxIndent)
  
  return (
    <div 
      className={cn(
        "flex items-center py-3 hover:bg-muted rounded-lg cursor-pointer transition-colors",
        className
      )}
      style={{ paddingLeft: `${currentIndent * 24}px` }}
      onClick={onClick}
    >
      {/* Empty space to align with TreeGroupRow chevron */}
      <div className="flex items-center w-4" />
      <Icon className="h-4 w-4 mr-2 text-m" />
      <span className="text-sm text-muted-foreground">{name}</span>
    </div>
  )
} 