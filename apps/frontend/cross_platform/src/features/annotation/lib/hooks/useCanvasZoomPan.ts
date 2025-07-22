import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/clientHooks'
import { selectCanvas } from '../../../../store/selectors'
import { setCanvas } from '../../../../store/annotationSlice'
import { shouldAllowWheelInScrollable, isInScrollableContainer } from '../utils/scrollable'

interface ZoomPanState {
  isSpacePressed: boolean
  isPanning: boolean
  lastPanPoint: { x: number; y: number } | null
}

export function useCanvasZoomPan() {
  const dispatch = useAppDispatch()
  const canvas = useAppSelector(selectCanvas)
  
  // Local state for immediate feedback
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null)
  const panAnimationRef = useRef<number | null>(null)
  const currentPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentZoomRef = useRef<number>(1)
  const isHoveringRef = useRef(false)
  
  // Keep current pan and zoom in sync with Redux state
  useEffect(() => {
    currentPanRef.current = canvas.pan
    currentZoomRef.current = canvas.zoom
  }, [canvas.pan, canvas.zoom])

  // Optimized pan update using requestAnimationFrame
  const updatePan = useCallback((newPan: { x: number; y: number }) => {
    // Update immediately for responsive feedback
    currentPanRef.current = newPan
    
    // Cancel previous animation frame
    if (panAnimationRef.current) {
      cancelAnimationFrame(panAnimationRef.current)
    }
    
    // Schedule Redux update
    panAnimationRef.current = requestAnimationFrame(() => {
      dispatch(setCanvas({
        updates: { pan: newPan }
      }))
      panAnimationRef.current = null
    })
  }, [dispatch])

  // Global wheel event handler
  const handleGlobalWheel = useCallback((event: WheelEvent) => {
    const target = event.target as Element
    
    // Allow scrolling within scrollable containers
    if (shouldAllowWheelInScrollable(event)) {
      return
    }
    
    // Handle interactions only when hovering over canvas
    if (isHoveringRef.current) {
      const canvasElement = document.querySelector('canvas') as HTMLCanvasElement
      const rect = canvasElement?.getBoundingClientRect()
      if (!rect) return
      
      // Get cursor position in canvas screen coordinates
      const cursorX = event.clientX - rect.left
      const cursorY = event.clientY - rect.top
      
      if (event.ctrlKey) {
        // Pinch-to-zoom
        event.preventDefault()
        
        // Calculate zoom delta (smaller steps for finer control)
        const zoomDelta = event.deltaY > 0 ? 0.95 : 1.05
        const newZoom = Math.max(0.1, Math.min(5, canvas.zoom * zoomDelta))
        
        if (newZoom === canvas.zoom) return // No change needed
        
        // Account for high DPI scaling
        const devicePixelRatio = window.devicePixelRatio || 1
        
        // Cursor position in logical canvas coordinates (accounting for DPI scaling)
        const logicalCursorX = cursorX * devicePixelRatio
        const logicalCursorY = cursorY * devicePixelRatio
        
        // Calculate the world coordinates of the point under the cursor
        const worldX = (logicalCursorX - canvas.pan.x) / canvas.zoom
        const worldY = (logicalCursorY - canvas.pan.y) / canvas.zoom
        
        // Calculate new pan to keep the world point fixed under the cursor
        const newPanX = logicalCursorX - (worldX * newZoom)
        const newPanY = logicalCursorY - (worldY * newZoom)
        
        // Update refs immediately for smooth interaction
        currentPanRef.current = { x: newPanX, y: newPanY }
        currentZoomRef.current = newZoom
        
        dispatch(setCanvas({
          updates: {
            zoom: newZoom,
            pan: { x: newPanX, y: newPanY }
          }
        }))
      } else {
        // Two-finger trackpad panning (wheel without ctrl)
        event.preventDefault()
        
        const deltaX = -event.deltaX
        const deltaY = -event.deltaY
        
        const newPan = {
          x: currentPanRef.current.x + deltaX,
          y: currentPanRef.current.y + deltaY
        }
        
        updatePan(newPan)
      }
    } else {
      // Prevent all other wheel events (scrolling, zooming)
      event.preventDefault()
    }
  }, [dispatch, canvas.pan, canvas.zoom, updatePan])

  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent spacebar scrolling
    if (event.code === 'Space') {
      event.preventDefault()
      if (!isSpacePressed) {
        setIsSpacePressed(true)
      }
    }
    
    // Prevent other keys that cause scrolling
    if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      const target = event.target as Element
      if (!isInScrollableContainer(target)) {
        event.preventDefault()
      }
    }
  }, [isSpacePressed])

  const handleGlobalKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      setIsSpacePressed(false)
      setIsPanning(false)
      lastPanPointRef.current = null
      
      // Cancel any pending pan updates
      if (panAnimationRef.current) {
        cancelAnimationFrame(panAnimationRef.current)
        panAnimationRef.current = null
      }
    }
  }, [])

  // Global event listeners
  useEffect(() => {
    // Prevent scrolling and handle keyboard
    document.addEventListener('wheel', handleGlobalWheel, { passive: false })
    document.addEventListener('keydown', handleGlobalKeyDown, { passive: false })
    document.addEventListener('keyup', handleGlobalKeyUp, { passive: false })
    
    // Hide scrollbars on body to prevent scrollbar dragging
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel)
      document.removeEventListener('keydown', handleGlobalKeyDown)
      document.removeEventListener('keyup', handleGlobalKeyUp)
      document.body.style.overflow = originalOverflow
      
      // Clean up any pending animation frames
      if (panAnimationRef.current) {
        cancelAnimationFrame(panAnimationRef.current)
      }
    }
  }, [handleGlobalWheel, handleGlobalKeyDown, handleGlobalKeyUp])

  // Mouse enter/leave tracking
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false
    setIsPanning(false)
    lastPanPointRef.current = null
    
    // Cancel any pending pan updates
    if (panAnimationRef.current) {
      cancelAnimationFrame(panAnimationRef.current)
      panAnimationRef.current = null
    }
  }, [])

  // Pan handling
  const handlePanStart = useCallback((event: React.PointerEvent) => {
    setIsPanning(true)
    lastPanPointRef.current = { x: event.clientX, y: event.clientY }
    
    // Capture pointer for better tracking
    const canvasElement = event.currentTarget as HTMLCanvasElement
    canvasElement.setPointerCapture(event.pointerId)
  }, [])

  const handlePanMove = useCallback((event: React.PointerEvent) => {
    if (lastPanPointRef.current) {
      const deltaX = event.clientX - lastPanPointRef.current.x
      const deltaY = event.clientY - lastPanPointRef.current.y
      
      const newPan = {
        x: currentPanRef.current.x + deltaX,
        y: currentPanRef.current.y + deltaY
      }
      
      updatePan(newPan)
      lastPanPointRef.current = { x: event.clientX, y: event.clientY }
    }
  }, [updatePan])

  const handlePanEnd = useCallback((event: React.PointerEvent) => {
    setIsPanning(false)
    lastPanPointRef.current = null
    
    // Release pointer capture
    const canvasElement = event.currentTarget as HTMLCanvasElement
    canvasElement.releasePointerCapture(event.pointerId)
  }, [])

  return {
    isSpacePressed,
    isPanning,
    handleMouseEnter,
    handleMouseLeave,
    handlePanStart,
    handlePanMove,
    handlePanEnd
  }
} 