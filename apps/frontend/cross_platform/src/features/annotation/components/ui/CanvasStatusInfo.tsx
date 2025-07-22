import React from 'react'
import { useAppSelector } from '../../../../store/clientHooks'
import { selectCanvas, selectShapesArray } from '../../../../store/selectors'

interface CanvasStatusInfoProps {
  isSpacePressed?: boolean
  className?: string
}

export function CanvasStatusInfo({ isSpacePressed = false, className = "" }: CanvasStatusInfoProps) {
  const canvas = useAppSelector(selectCanvas)
  const shapes = useAppSelector(selectShapesArray)

  return (
    <div className={`absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1 ${className}`}>
      Zoom: {Math.round(canvas.zoom * 100)}% | Shapes: {shapes.length}
      {isSpacePressed && ' | Pan Mode'}
    </div>
  )
} 