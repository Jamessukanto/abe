import React, { forwardRef } from 'react'

interface CanvasOverlayProps {
  className?: string
}

export const CanvasOverlay = forwardRef<SVGSVGElement, CanvasOverlayProps>(
  ({ className = "absolute inset-0 w-full h-full pointer-events-none" }, ref) => {
    return (
      <svg
        ref={ref}
        className={className}
        viewBox="0 0 800 600"
      />
    )
  }
)

CanvasOverlay.displayName = 'CanvasOverlay' 