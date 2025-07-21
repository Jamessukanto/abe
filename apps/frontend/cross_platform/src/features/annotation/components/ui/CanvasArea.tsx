'use client'

import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/clientHooks'
import { 
  AnnotationRenderer, 
  ToolManager, 
  RectangleTool, 
  PenTool 
} from '../../canvas'
import { 
  selectShapesArray, 
  selectGroupsArray, 
  selectCanvas, 
  selectActiveTool,
  selectPreview 
} from '../../../../store/selectors'
import { setCanvas } from '../../../../store/annotationSlice'
import type { PointerEventData } from '../../lib/types'

export function CanvasArea() {
  const dispatch = useAppDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const rendererRef = useRef<AnnotationRenderer>()
  const toolManagerRef = useRef<ToolManager>()
  const isHoveringRef = useRef(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null)
  const panAnimationRef = useRef<number | null>(null)
  const currentPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentZoomRef = useRef<number>(1)
  
  // Redux state
  const shapes = useAppSelector(selectShapesArray)
  const groups = useAppSelector(selectGroupsArray)
  const canvas = useAppSelector(selectCanvas)
  const activeTool = useAppSelector(selectActiveTool)
  const preview = useAppSelector(selectPreview)

  // Keep current pan and zoom in sync with Redux state
  useEffect(() => {
    currentPanRef.current = canvas.pan
    currentZoomRef.current = canvas.zoom
  }, [canvas.pan, canvas.zoom])

  // Initialize renderer and tool manager
  useEffect(() => {
    if (canvasRef.current && svgRef.current && !rendererRef.current) {
      // Initialize renderer
      rendererRef.current = new AnnotationRenderer(canvasRef.current, svgRef.current)
      
      // Initialize tool manager
      toolManagerRef.current = new ToolManager(dispatch)
      
      // Register tools
      const rectangleTool = new RectangleTool(dispatch)
      const penTool = new PenTool(dispatch)
      
      toolManagerRef.current.registerTool(rectangleTool)
      toolManagerRef.current.registerTool(penTool)
      
      // Set default tool
      toolManagerRef.current.setActiveTool('rectangle')
      
      // Load sample image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const initialPan = { x: 0, y: 0 }
        const initialZoom = 1
        currentPanRef.current = initialPan
        currentZoomRef.current = initialZoom
        dispatch(setCanvas({
          updates: {
            imageUrl: '/images/chimps.png',
            imageSize: { width: img.naturalWidth, height: img.naturalHeight },
            zoom: initialZoom,
            pan: initialPan
          }
        }))
        rendererRef.current?.loadImage('/images/chimps.png')
      }
      img.onerror = () => {
        // Fallback if image fails to load
        const initialPan = { x: 0, y: 0 }
        const initialZoom = 1
        currentPanRef.current = initialPan
        currentZoomRef.current = initialZoom
        dispatch(setCanvas({
          updates: {
            imageSize: { width: 800, height: 600 },
            zoom: initialZoom,
            pan: initialPan
          }
        }))
      }
      img.src = '/images/chimps.png'
    }
  }, [dispatch])

  // Update active tool when Redux state changes
  useEffect(() => {
    if (toolManagerRef.current && activeTool) {
      toolManagerRef.current.setActiveTool(activeTool)
    }
  }, [activeTool])

  // Render shapes when they change
  useEffect(() => {
    if (rendererRef.current) {
      const previewShape = preview.isActive ? preview.shape : undefined
      rendererRef.current.render(shapes, groups, canvas, previewShape)
    }
  }, [shapes, groups, canvas, preview])

  // Check if element is within a scrollable container
  const isInScrollableContainer = useCallback((element: Element): boolean => {
    let current = element
    while (current && current !== document.body) {
      const computedStyle = window.getComputedStyle(current)
      if (computedStyle.overflowY === 'auto' || 
          computedStyle.overflowY === 'scroll' || 
          current.classList.contains('overflow-y-auto') ||
          current.classList.contains('custom-scrollbar')) {
        return true
      }
      current = current.parentElement!
    }
    return false
  }, [])

  // Global wheel event handler to prevent unwanted scrolling/zooming
  const handleGlobalWheel = useCallback((event: WheelEvent) => {
    const target = event.target as Element
    
    // Allow scrolling within scrollable containers
    if (isInScrollableContainer(target)) {
      // If this is a pinch-to-zoom gesture, block it in scrollable areas
      if (event.ctrlKey || event.deltaZ !== 0) {
        event.preventDefault();
      }
      // Allow normal scrolling
      return;
    }
    
    // Handle interactions only when hovering over canvas
    if (isHoveringRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect()
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
        
        console.log('🎯 Zoom Debug:', {
          'cursor screen': [cursorX, cursorY],
          'cursor logical': [logicalCursorX, logicalCursorY],
          'devicePixelRatio': devicePixelRatio,
          'current pan': [canvas.pan.x, canvas.pan.y],
          'current zoom': canvas.zoom,
          'new zoom': newZoom
        })
        
        // Calculate the world coordinates of the point under the cursor
        const worldX = (logicalCursorX - canvas.pan.x) / canvas.zoom
        const worldY = (logicalCursorY - canvas.pan.y) / canvas.zoom
        
        console.log('🌍 World coordinates:', {
          worldX,
          worldY,
          'calculation': `(${logicalCursorX} - ${canvas.pan.x}) / ${canvas.zoom} = ${worldX}`
        })
        
        // Calculate new pan to keep the world point fixed under the cursor
        const newPanX = logicalCursorX - (worldX * newZoom)
        const newPanY = logicalCursorY - (worldY * newZoom)
        
        console.log('📐 New pan calculation:', {
          'new pan': [newPanX, newPanY],
          'verification X': worldX * newZoom + newPanX,
          'verification Y': worldY * newZoom + newPanY,
          'should equal logical cursor': [logicalCursorX, logicalCursorY],
          'X matches': Math.abs((worldX * newZoom + newPanX) - logicalCursorX) < 0.001,
          'Y matches': Math.abs((worldY * newZoom + newPanY) - logicalCursorY) < 0.001
        })
        
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
  }, [dispatch, isInScrollableContainer, canvas.pan, canvas.zoom])

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

  // Global keyboard event handler to prevent unwanted scrolling and handle spacebar
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
    
    // Pass to tool manager
    toolManagerRef.current?.handleKeyDown(event)
  }, [isSpacePressed, isInScrollableContainer])

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

  // Mouse enter/leave tracking for hover state
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

  // Convert DOM event to PointerEventData
  const createPointerEventData = useCallback((event: React.PointerEvent): PointerEventData => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) {
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
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    return {
      point,
      canvasPoint: point,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      button: event.button
    }
  }, [])

  // Event handlers
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault()
    
    if (isSpacePressed && isHoveringRef.current) {
      // Start panning
      setIsPanning(true)
      lastPanPointRef.current = { x: event.clientX, y: event.clientY }
      
      // Capture pointer for better tracking
      if (canvasRef.current) {
        canvasRef.current.setPointerCapture(event.pointerId)
      }
    } else {
      // Normal tool interaction
      const pointerData = createPointerEventData(event)
      toolManagerRef.current?.handlePointerDown(pointerData, canvas)
    }
  }, [canvas, createPointerEventData, isSpacePressed])

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (isPanning && lastPanPointRef.current) {
      // Handle panning with immediate feedback
      const deltaX = event.clientX - lastPanPointRef.current.x
      const deltaY = event.clientY - lastPanPointRef.current.y
      
      const newPan = {
        x: currentPanRef.current.x + deltaX,
        y: currentPanRef.current.y + deltaY
      }
      
      updatePan(newPan)
      lastPanPointRef.current = { x: event.clientX, y: event.clientY }
    } else {
      // Normal tool interaction
      const pointerData = createPointerEventData(event)
      toolManagerRef.current?.handlePointerMove(pointerData, canvas)
    }
  }, [createPointerEventData, isPanning, updatePan])

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (isPanning) {
      // End panning
      setIsPanning(false)
      lastPanPointRef.current = null
      
      // Release pointer capture
      if (canvasRef.current) {
        canvasRef.current.releasePointerCapture(event.pointerId)
      }
    } else {
      // Normal tool interaction
      const pointerData = createPointerEventData(event)
      toolManagerRef.current?.handlePointerUp(pointerData, canvas)
    }
  }, [createPointerEventData, isPanning])

  // Get cursor style from active tool or panning state
  const cursorStyle = useMemo(() => {
    if (isSpacePressed && isHoveringRef.current) {
      return isPanning ? 'grabbing' : 'grab'
    }
    return toolManagerRef.current?.getCurrentCursor() || 'default'
  }, [activeTool, isSpacePressed, isPanning])

  return (
    <div className="relative flex-1 w-full h-full bg-[hsl(var(--canvas-background))] overflow-hidden">
      {/* Canvas for shape rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: cursorStyle }}
        width={800}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* SVG overlay for selection handles and guides */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 600"
      />
      
      {/* Status info */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1">
        Zoom: {Math.round(canvas.zoom * 100)}% | Shapes: {shapes.length}
        {isSpacePressed && ' | Pan Mode'}
      </div>
    </div>
  )
} 