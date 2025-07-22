import { useMemo } from 'react'

/**
 * Custom hook for managing canvas cursor style.
 * Combines navigation state (panning) with tool state (current cursor).
 */
export function useCanvasCursor(
  isPanning: boolean,
  getCurrentCursor: () => string
) {
  const cursorStyle = useMemo(() => {
    if (isPanning) {
      return 'grabbing'
    }
    return getCurrentCursor()
  }, [isPanning, getCurrentCursor])

  return cursorStyle
} 