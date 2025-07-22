import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/clientHooks'
import { selectCanvas } from '../../../../store/selectors'
import { setCanvas } from '../../../../store/annotationSlice'
import { shouldAllowWheelInScrollable, isInScrollableContainer } from '../utils/scrollable'

export function useCanvasNavigations() {
  const dispatch = useAppDispatch()
  const canvas = useAppSelector(selectCanvas)
  
  // Local state for immediate feedback
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
    currentPanRef.current = newPan
    if (panAnimationRef.current) {
      cancelAnimationFrame(panAnimationRef.current)
    }
    panAnimationRef.current = requestAnimationFrame(() => {
      dispatch(setCanvas({ updates: { pan: newPan } }))
      panAnimationRef.current = null
    })
  }, [dispatch])

  // Global wheel event handler
  const handleGlobalWheel = useCallback((event: WheelEvent) => {
    const target = event.target as Element
    if (shouldAllowWheelInScrollable(event)) {
      return
    }
    if (isHoveringRef.current) {
      const canvasElement = document.querySelector('canvas') as HTMLCanvasElement
      const rect = canvasElement?.getBoundingClientRect()
      if (!rect) return
      const cursorX = event.clientX - rect.left
      const cursorY = event.clientY - rect.top
      if (event.ctrlKey) {
        event.preventDefault()
        const zoomDelta = event.deltaY > 0 ? 0.95 : 1.05
        const newZoom = Math.max(0.1, Math.min(5, canvas.zoom * zoomDelta))
        if (newZoom === canvas.zoom) return
        const devicePixelRatio = window.devicePixelRatio || 1
        const logicalCursorX = cursorX * devicePixelRatio
        const logicalCursorY = cursorY * devicePixelRatio
        const worldX = (logicalCursorX - canvas.pan.x) / canvas.zoom
        const worldY = (logicalCursorY - canvas.pan.y) / canvas.zoom
        const newPanX = logicalCursorX - (worldX * newZoom)
        const newPanY = logicalCursorY - (worldY * newZoom)
        currentPanRef.current = { x: newPanX, y: newPanY }
        currentZoomRef.current = newZoom
        dispatch(setCanvas({
          updates: {
            zoom: newZoom,
            pan: { x: newPanX, y: newPanY }
          }
        }))
      } else {
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
      event.preventDefault()
    }
  }, [dispatch, canvas.pan, canvas.zoom, updatePan])

  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault()
      setIsPanning(true)  // Set immediately when spacebar is pressed
    }
    if ([
      'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'
    ].includes(event.code)) {
      const target = event.target as Element
      if (!isInScrollableContainer(target)) {
        event.preventDefault()
      }
    }
  }, [])

  const handleGlobalKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      setIsPanning(false)  // Clear immediately when spacebar is released
      lastPanPointRef.current = null
      if (panAnimationRef.current) {
        cancelAnimationFrame(panAnimationRef.current)
        panAnimationRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('wheel', handleGlobalWheel, { passive: false })
    document.addEventListener('keydown', handleGlobalKeyDown, { passive: false })
    document.addEventListener('keyup', handleGlobalKeyUp, { passive: false })
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel)
      document.removeEventListener('keydown', handleGlobalKeyDown)
      document.removeEventListener('keyup', handleGlobalKeyUp)
      document.body.style.overflow = originalOverflow
      if (panAnimationRef.current) {
        cancelAnimationFrame(panAnimationRef.current)
      }
    }
  }, [handleGlobalWheel, handleGlobalKeyDown, handleGlobalKeyUp])

  // Mouse enter/leave tracking
  const onNavMouseEnterCanvas = useCallback(() => {
    isHoveringRef.current = true
  }, [])

  const onNavMouseLeaveCanvas = useCallback(() => {
    isHoveringRef.current = false
    setIsPanning(false)
    lastPanPointRef.current = null
    if (panAnimationRef.current) {
      cancelAnimationFrame(panAnimationRef.current)
      panAnimationRef.current = null
    }
  }, [])

  // Pan handling
  const onNavPanStart = useCallback((event: React.PointerEvent) => {
    setIsPanning(true)
    lastPanPointRef.current = { x: event.clientX, y: event.clientY }
    const canvasElement = event.currentTarget as HTMLCanvasElement
    canvasElement.setPointerCapture(event.pointerId)
  }, [])

  const onNavPanMove = useCallback((event: React.PointerEvent) => {
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

  const onNavPanEnd = useCallback((event: React.PointerEvent) => {
    setIsPanning(false)
    lastPanPointRef.current = null
    const canvasElement = event.currentTarget as HTMLCanvasElement
    canvasElement.releasePointerCapture(event.pointerId)
  }, [])

  return {
    onNavMouseEnterCanvas,
    onNavMouseLeaveCanvas,
    onNavPanStart,
    onNavPanMove,
    onNavPanEnd,
    isPanning
  }
} 