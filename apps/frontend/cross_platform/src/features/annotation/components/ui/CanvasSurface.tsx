import React, { forwardRef } from 'react'
import { createPointerEventData, getCanvasRect } from '../../lib/utils/pointerEventData'
import type { PointerEventData } from '../../lib/types'

interface CanvasSurfaceProps {
  onPointerDown: (event: PointerEventData, originalEvent?: React.PointerEvent) => void
  onPointerMove: (event: PointerEventData, originalEvent?: React.PointerEvent) => void
  onPointerUp: (event: PointerEventData, originalEvent?: React.PointerEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  cursorStyle: string
}

export const CanvasSurface = forwardRef<HTMLCanvasElement, CanvasSurfaceProps>(
  ({ onPointerDown, onPointerMove, onPointerUp, onMouseEnter, onMouseLeave, cursorStyle }, ref) => {
    const handlePointerDown = (event: React.PointerEvent) => {
      event.preventDefault()
      const canvasRect = getCanvasRect(event.currentTarget as HTMLCanvasElement)
      const pointerData = createPointerEventData(event, canvasRect)
      onPointerDown(pointerData, event)
    }

    const handlePointerMove = (event: React.PointerEvent) => {
      const canvasRect = getCanvasRect(event.currentTarget as HTMLCanvasElement)
      const pointerData = createPointerEventData(event, canvasRect)
      onPointerMove(pointerData, event)
    }

    const handlePointerUp = (event: React.PointerEvent) => {
      const canvasRect = getCanvasRect(event.currentTarget as HTMLCanvasElement)
      const pointerData = createPointerEventData(event, canvasRect)
      onPointerUp(pointerData, event)
    }

    return (
      <canvas
        ref={ref}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: cursorStyle }}
        width={800}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    )
  }
)

CanvasSurface.displayName = 'CanvasSurface' 