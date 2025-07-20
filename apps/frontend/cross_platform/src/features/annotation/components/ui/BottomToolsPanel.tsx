import React from 'react'
import { MousePointer2, Pen, Square, ChevronDown, Hand } from 'lucide-react'

export function BottomToolsPanel() {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <div className="bg-muted/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-4">
        {/* Pointer Tool with dropdown */}
        <div className="flex items-center">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <MousePointer2 className="h-5 w-5 text-foreground" />
          </button>
          <button className="p-1 hover:bg-accent rounded-sm transition-colors">
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {/* Hidden dropdown content - will contain Hand tool */}
          <div className="hidden">
            <Hand className="h-5 w-5" />
          </div>
        </div>

        {/* Pen Tool */}
        <div className="flex items-center">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Pen className="h-5 w-5 text-foreground" />
          </button>
          <button className="p-1 hover:bg-accent rounded-sm transition-colors">
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        {/* Rectangle Tool */}
        <div className="flex items-center">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Square className="h-5 w-5 text-foreground" />
          </button>
          <button className="p-1 hover:bg-accent rounded-sm transition-colors">
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
} 