'use client'

import React, { useRef, useMemo } from 'react'
import { useCanvasZoomPan } from '../../lib/hooks/useCanvasZoomPan'
import { useToolManager } from '../../lib/hooks/useToolManager'
import { useRenderer } from '../../lib/hooks/useRenderer'
import { CanvasSurface } from './CanvasSurface'
import { CanvasOverlay } from './CanvasOverlay'
import { CanvasStatusInfo } from './CanvasStatusInfo'
import { useAppSelector } from '../../../../store/clientHooks'
import { selectCanvas } from '../../../../store/selectors'

export function CanvasArea() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Redux state
  const canvas = useAppSelector(selectCanvas)
  
  // Custom hooks
  const {
    isSpacePressed,
    isPanning,
    handleMouseEnter,
    handleMouseLeave,
    handlePanStart,
    handlePanMove,
    handlePanEnd
  } = useCanvasZoomPan()
  
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
    getCurrentCursor
  } = useToolManager()
  
  // Initialize renderer
  useRenderer(canvasRef, svgRef)

  // Event handlers
  const handleCanvasPointerDown = (event: any, originalEvent?: React.PointerEvent) => {
    if (isSpacePressed) {
      // For panning, we need the original React.PointerEvent
      handlePanStart(originalEvent || event)
    } else {
      handlePointerDown(event, canvas)
    }
  }

  const handleCanvasPointerMove = (event: any, originalEvent?: React.PointerEvent) => {
    if (isPanning) {
      // For panning, we need the original React.PointerEvent
      handlePanMove(originalEvent || event)
    } else {
      handlePointerMove(event, canvas)
    }
  }

  const handleCanvasPointerUp = (event: any, originalEvent?: React.PointerEvent) => {
    if (isPanning) {
      // For panning, we need the original React.PointerEvent
      handlePanEnd(originalEvent || event)
    } else {
      handlePointerUp(event, canvas)
    }
  }

  // Get cursor style from active tool or panning state
  const cursorStyle = useMemo(() => {
    if (isSpacePressed) {
      return isPanning ? 'grabbing' : 'grab'
    }
    return getCurrentCursor()
  }, [isSpacePressed, isPanning, getCurrentCursor])

  return (
    <div className="relative flex-1 w-full h-full bg-[hsl(var(--canvas-background))] overflow-hidden">
      {/* Canvas for shape rendering */}
      <CanvasSurface
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        cursorStyle={cursorStyle}
      />
      
      {/* SVG overlay for selection handles and guides */}
      <CanvasOverlay ref={svgRef} />
      
      {/* Status info */}
      <CanvasStatusInfo isSpacePressed={isSpacePressed} />
    </div>
  )
} 