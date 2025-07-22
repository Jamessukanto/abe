import type { PointerEventData } from '../types'

/**
 * Creates a pointer event handler that routes events based on a condition.
 */
export function createPointerHandler(
  condition: boolean,
  panHandler: (event: React.PointerEvent) => void,
  toolHandler: (event: PointerEventData, canvas: any) => void,
  canvas: any
) {
  return (event: PointerEventData, originalEvent?: React.PointerEvent) => {
    if (condition) {
      panHandler(originalEvent!)
    } else {
      toolHandler(event, canvas)
    }
  }
} 