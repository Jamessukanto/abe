'use client'

import React, { useState } from 'react'
import { LucideIcon, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TreeGroupRowProps {
  icon: LucideIcon
  name: string
  indent?: number
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function TreeGroupRow({ 
  icon: Icon, 
  name, 
  indent = 0, 
  children, 
  defaultExpanded = false,
  className 
}: TreeGroupRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Limit nesting to 5 levels
  const maxIndent = 5
  const currentIndent = Math.min(indent, maxIndent)

  return (
    <div>
      <div 
        className={cn(
          "flex items-center py-3 hover:bg-muted rounded-lg cursor-pointer transition-colors",
          className
        )}
        style={{ paddingLeft: `${currentIndent * 24}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center w-4">
          <ChevronRight className={cn(
              "h-3 w-3  transition-transform",
              isExpanded && "rotate-90"
            )} 
          />
        </div>
        <Icon className="h-4 w-4 mr-2" />
        <span className="text-sm text-muted-foreground">{name}</span>
      </div>
      
      {isExpanded && (
        <div className="overflow-hidden">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Clone the child and add the indent prop, but limit to maxIndent
              return React.cloneElement(child, {
                ...child.props,
                indent: Math.min(currentIndent + 1, maxIndent)
              })
            }
            return child
          })}
        </div>
      )}
    </div>
  )
} 