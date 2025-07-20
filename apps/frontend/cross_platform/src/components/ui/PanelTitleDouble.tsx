import React from 'react'

interface PanelTitleDoubleProps {
  title: string
  subtitle: string
  className?: string
}

export function PanelTitleDouble({ title, subtitle, className = '' }: PanelTitleDoubleProps) {
  return (
    <div className={`flex flex-col space-y-0.5 ${className}`}>
      <span className="text-xs text-muted-foreground">{title}</span>
      <span className="text-sm text-foreground">{subtitle}</span>
    </div>
  )
} 
// 