'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { useCanvasNavigations } from '../lib/hooks/useCanvasNavigations'
import { useCanvasCursor } from '../lib/hooks/useCanvasCursor'
import { CanvasSurface } from '../components/ui/CanvasSurface'
import { CanvasAnnotation } from '../components/ui/CanvasAnnotation'
import { CanvasStatusInfo } from '../components/ui/CanvasStatusInfo'
import { useAppSelector, useAppDispatch } from '../../../store'
import { selectCanvas, selectShapesArray, selectGroupsArray, selectPreview, selectActiveTool } from '../../../store/selectors'
import { setCanvas } from '../../../store/annotationSlice'
import { createPointerHandler } from '../lib/utils/pointerEventHandlers'
import { ViewportManager } from './viewport/ViewportManager'
import { InteractionManager } from './interaction/InteractionManager'
import { RenderingEngine } from './rendering/RenderingEngine'
import { ToolController } from './tools/ToolController'
import { EventBus, globalEventBus } from './events/EventBus'
import type { PointerEventData } from '../lib/types'

/**
 * CanvasContainer orchestrates Rendering Engine, Tool Controller,
 * Event Bus, Interaction Manager and Viewport Manager
 */
export function CanvasContainer() {
  const dispatch = useAppDispatch()
  const canvasSurfaceRef = useRef<HTMLCanvasElement>(null)
  const canvasAnnotationRef = useRef<SVGSVGElement>(null)
  
  // Architecture layer instances
  const renderingEngineRef = useRef<RenderingEngine>()
  const viewportManagerRef = useRef<ViewportManager>()
  const interactionManagerRef = useRef<InteractionManager>()
  const toolControllerRef = useRef<ToolController>()
  const eventBusRef = useRef<EventBus>(globalEventBus)
  
  // Redux state
  const canvas = useAppSelector(selectCanvas)
  const shapes = useAppSelector(selectShapesArray)
  const groups = useAppSelector(selectGroupsArray)
  const preview = useAppSelector(selectPreview)
  const activeTool = useAppSelector(selectActiveTool)
  
  // Navigation hooks
  const {
    isPanning,
    onNavMouseEnterCanvas,
    onNavMouseLeaveCanvas,
    onNavPanStart,
    onNavPanMove,
    onNavPanEnd
  } = useCanvasNavigations()
  
  // Tool cursor management
  const getCurrentCursor = useCallback(() => {
    return toolControllerRef.current?.getCurrentCursor() || 'default'
  }, [])
  
  const cursorStyle = useCanvasCursor(isPanning, getCurrentCursor)

  // Initialize architecture layers
  useEffect(() => {
    if (canvasSurfaceRef.current && canvasAnnotationRef.current && !viewportManagerRef.current) {
      console.log('Initializing new canvas architecture')
      
      // Initialize viewport manager
      viewportManagerRef.current = new ViewportManager(canvasSurfaceRef.current)
      
      // Initialize interaction manager
      interactionManagerRef.current = new InteractionManager()
      
      // Initialize rendering engine
      renderingEngineRef.current = new RenderingEngine(
        canvasSurfaceRef.current,
        canvasAnnotationRef.current,
        viewportManagerRef.current
      )
      
      // Initialize tool controller with event bus
      toolControllerRef.current = new ToolController(dispatch, eventBusRef.current)
      
      // Load sample image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const initialPan = { x: 0, y: 0 }
        const initialZoom = 1
        dispatch(setCanvas({
          updates: {
            imageUrl: '/images/chimps.png',
            imageSize: { width: img.naturalWidth, height: img.naturalHeight },
            zoom: initialZoom,
            pan: initialPan
          }
        }))
        renderingEngineRef.current?.loadImage('/images/chimps.png')
      }
      img.onerror = () => {
        // Fallback if image fails to load
        const initialPan = { x: 0, y: 0 }
        const initialZoom = 1
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

  // Update interaction manager when shapes change
  useEffect(() => {
    if (interactionManagerRef.current) {
      interactionManagerRef.current.updateIndex(shapes, groups)
    }
  }, [shapes, groups])

  // Update tool controller when active tool changes
  useEffect(() => {
    if (toolControllerRef.current && activeTool) {
      toolControllerRef.current.setActiveTool(activeTool)
    }
  }, [activeTool])

  // Setup keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!toolControllerRef.current) return

      // Undo: Ctrl+Z (Cmd+Z on Mac)
      if (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
        event.preventDefault()
        toolControllerRef.current.undo()
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y (Cmd+Shift+Z or Cmd+Y on Mac)
      if (
        (event.key === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey) ||
        (event.key === 'y' && (event.ctrlKey || event.metaKey))
      ) {
        event.preventDefault()
        toolControllerRef.current.redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Render when state changes
  useEffect(() => {
    if (renderingEngineRef.current) {
      const previewShape = preview.isActive ? preview.shape : undefined
      renderingEngineRef.current.render(shapes, groups, canvas, previewShape)
    }
  }, [shapes, groups, canvas, preview])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy()
      }
      if (interactionManagerRef.current) {
        interactionManagerRef.current.clear()
      }
      if (toolControllerRef.current) {
        toolControllerRef.current.destroy()
      }
    }
  }, [])

  // Tool event handlers using new ToolController
  const onToolPointerDown = useCallback((event: PointerEventData) => {
    toolControllerRef.current?.handlePointerDown(event, canvas)
  }, [canvas])

  const onToolPointerMove = useCallback((event: PointerEventData) => {
    toolControllerRef.current?.handlePointerMove(event, canvas)
  }, [canvas])

  const onToolPointerUp = useCallback((event: PointerEventData) => {
    toolControllerRef.current?.handlePointerUp(event, canvas)
  }, [canvas])

  // Event handlers
  const handleCanvasPointerDown = createPointerHandler(isPanning, onNavPanStart, onToolPointerDown, canvas)
  const handleCanvasPointerMove = createPointerHandler(isPanning, onNavPanMove, onToolPointerMove, canvas)
  const handleCanvasPointerUp = createPointerHandler(isPanning, onNavPanEnd, onToolPointerUp, canvas)

  return (
    <div className="relative flex-1 w-full h-full bg-[hsl(var(--canvas-background))] overflow-hidden">
      
      <CanvasSurface
        ref={canvasSurfaceRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onMouseEnter={onNavMouseEnterCanvas}
        onMouseLeave={onNavMouseLeaveCanvas}
        cursorStyle={cursorStyle}
      />
      
      <CanvasAnnotation ref={canvasAnnotationRef} />
      
      <CanvasStatusInfo isSpacePressed={isPanning} />
      
      {/* Development: Performance metrics display */}
      <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded">
        <div>Architecture: New Layered System ✅</div>
        <div>ViewportManager: {viewportManagerRef.current ? '✅' : '❌'}</div>
        <div>InteractionManager: {interactionManagerRef.current ? '✅' : '❌'}</div>
        <div>RenderingEngine: {renderingEngineRef.current ? '✅' : '❌'}</div>
        <div>ToolController: {toolControllerRef.current ? '✅' : '❌'}</div>
        <div>EventBus: {eventBusRef.current ? '✅' : '❌'}</div>
        <div>Active Tool: {activeTool}</div>
        <div>Shapes: {shapes.length}</div>
        <div>Groups: {groups.length}</div>
        <div>Can Undo: {toolControllerRef.current?.canUndo() ? '✅' : '❌'}</div>
        <div>Can Redo: {toolControllerRef.current?.canRedo() ? '✅' : '❌'}</div>
      </div>
    </div>
  )
} 