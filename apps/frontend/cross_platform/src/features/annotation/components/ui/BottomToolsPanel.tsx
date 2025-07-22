'use client'

import React from 'react'
import { MousePointer2, Pen, Square, ChevronDown, Hand } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { setActiveTool } from '../../../../store/annotationSlice'
import { selectActiveTool } from '../../../../store/selectors'

export function BottomToolsPanel() {
  const dispatch = useAppDispatch()
  const activeTool = useAppSelector(selectActiveTool)

  const tools = [
    {
      type: 'select',
      icon: MousePointer2,
      label: 'Select',
      disabled: true // Will implement in Phase 4
    },
    {
      type: 'rectangle',
      icon: Square,
      label: 'Rectangle',
      disabled: false
    },
    {
      type: 'polygon',
      icon: Pen,
      label: 'Polygon',
      disabled: false
    }
  ]

  const handleToolSelect = (toolType: string) => {
    if (toolType === 'select') return // Not implemented yet
    dispatch(setActiveTool(toolType as any))
  }

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <div className="bg-muted/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-2">
        {tools.map((tool) => (
          <div key={tool.type} className="flex items-center">
            <button
              className={`p-2 rounded-lg transition-colors ${
                activeTool === tool.type
                  ? 'bg-primary text-primary-foreground'
                  : tool.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-accent text-foreground'
              }`}
              onClick={() => handleToolSelect(tool.type)}
              disabled={tool.disabled}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </button>
            
            {/* Dropdown indicator - future feature */}
            <button 
              className="p-1 hover:bg-accent rounded-sm transition-colors opacity-30"
              disabled
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        ))}
        
        {/* Tool info */}
        <div className="ml-4 text-xs text-muted-foreground">
          {activeTool === 'rectangle' && 'Draw rectangles'}
          {activeTool === 'polygon' && 'Draw polygons'}
          {activeTool === 'select' && 'Select shapes'}
        </div>
      </div>
    </div>
  )
} 