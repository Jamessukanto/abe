'use client'

import React, { useRef, useMemo } from 'react'
import { useCanvasNavigations } from '../../lib/hooks/useCanvasNavigations'
import { useCanvasTools } from '../../lib/hooks/useCanvasTools'
import { useRenderer } from '../../lib/hooks/useRenderer'
import { CanvasSurface } from './CanvasSurface'
import { CanvasAnnotation } from './CanvasAnnotation'
import { CanvasStatusInfo } from './CanvasStatusInfo'
import { useAppSelector } from '../../../../store/clientHooks'
import { selectCanvas } from '../../../../store/selectors'
import { createPointerHandler } from '../../lib/utils/pointerEventHandlers'
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

  // Event handlers for CanvasSurface
  const handleCanvasPointerDown = createPointerHandler(isPanning, onNavPanStart, onToolPointerDown, canvas)
  const handleCanvasPointerMove = createPointerHandler(isPanning, onNavPanMove, onToolPointerMove, canvas)
  const handleCanvasPointerUp = createPointerHandler(isPanning, onNavPanEnd, onToolPointerUp, canvas)

  // Get cursor style
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