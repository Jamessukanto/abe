import type { PointerEventData } from '../types'

/**
 * Convert React pointer event to PointerEventData
 */
export function createPointerEventData(
  event: React.PointerEvent,
  canvasRect: DOMRect | null
): PointerEventData {
  if (!canvasRect) {
    return {
      point: { x: 0, y: 0 },
      canvasPoint: { x: 0, y: 0 },
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      button: event.button
    }
  }

  const point = {
    x: event.clientX - canvasRect.left,
    y: event.clientY - canvasRect.top
  }

  return {
    point,
    canvasPoint: point,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
    button: event.button
  }
}

/**
 * Get canvas bounding rect safely
 */
export function getCanvasRect(canvasElement: HTMLCanvasElement | null): DOMRect | null {
  return canvasElement?.getBoundingClientRect() || null
} 