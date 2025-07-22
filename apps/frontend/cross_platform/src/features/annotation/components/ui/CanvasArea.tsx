'use client'

import React, { useRef, useMemo, useCallback } from 'react'
import { useCanvasNavigations } from '../../lib/hooks/useCanvasNavigations'
import { useCanvasTools } from '../../lib/hooks/useCanvasTools'
import { useRenderer } from '../../lib/hooks/useRenderer'
import { CanvasSurface } from './CanvasSurface'
import { CanvasAnnotation } from './CanvasAnnotation'
import { CanvasStatusInfo } from './CanvasStatusInfo'
import { useAppSelector } from '../../../../store/clientHooks'
import { selectCanvas } from '../../../../store/selectors'
import type { PointerEventData } from '../../lib/types'

export function CanvasArea() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Redux state
  const canvas = useAppSelector(selectCanvas)
  
  // Custom hooks
  const {
    isPanning,
    onNavMouseEnterCanvas,
    onNavMouseLeaveCanvas,
    onNavPanStart,
    onNavPanMove,
    onNavPanEnd
  } = useCanvasNavigations()
  
  const {
    onToolPointerDown,
    onToolPointerMove,
    onToolPointerUp,
    getCurrentCursor
  } = useCanvasTools()
  
  // Initialize renderer
  useRenderer(canvasRef, svgRef)

  // Higher-order function to create pointer handlers
  const createPointerHandler = useCallback((
    panHandler: (event: React.PointerEvent) => void,
    toolHandler: (event: PointerEventData, canvas: any) => void
  ) => {
    return (event: PointerEventData, originalEvent?: React.PointerEvent) => {
      if (isPanning) {
        // Route to pan/zoom logic
        panHandler(originalEvent!)
      } else {
        // Route to tool logic
        toolHandler(event, canvas)
      }
    }
  }, [isPanning, canvas])

  // Event handlers for CanvasSurface
  // These handlers route pointer events to either pan/zoom logic or tool logic
  // - If the user is holding spacebar (isPanning), we handle panning
  // - Otherwise, we route the event to the active tool (draw, select, etc.)
  const handleCanvasPointerDown = createPointerHandler(onNavPanStart, onToolPointerDown)
  const handleCanvasPointerMove = createPointerHandler(onNavPanMove, onToolPointerMove)
  const handleCanvasPointerUp = createPointerHandler(onNavPanEnd, onToolPointerUp)

  // Get cursor style from active tool or panning state
  const cursorStyle = useMemo(() => {
    if (isPanning) {
      return 'grabbing'
    }
    return getCurrentCursor()
  }, [isPanning, getCurrentCursor])

  return (
    <div className="relative flex-1 w-full h-full bg-[hsl(var(--canvas-background))] overflow-hidden">

      <CanvasSurface
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onMouseEnter={onNavMouseEnterCanvas}
        onMouseLeave={onNavMouseLeaveCanvas}
        cursorStyle={cursorStyle}
      />
      
      <CanvasAnnotation ref={svgRef} />
      
      <CanvasStatusInfo isSpacePressed={isPanning} />
    </div>
  )
} 