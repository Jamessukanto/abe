import React, { forwardRef } from 'react'

interface CanvasAnnotationProps {
  className?: string
}

export const CanvasAnnotation = forwardRef<SVGSVGElement, CanvasAnnotationProps>(
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

CanvasAnnotation.displayName = 'CanvasAnnotation' 