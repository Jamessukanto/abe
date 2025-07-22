import { useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/clientHooks'
import { selectActiveTool } from '../../../../store/selectors'
import { ToolManager, RectangleTool, PenTool } from '../../tools'
import type { PointerEventData } from '../types'
import type { CanvasState } from '../types'

export function useCanvasTools() {
  const dispatch = useAppDispatch()
  const activeTool = useAppSelector(selectActiveTool)
  const toolManagerRef = useRef<ToolManager>()

  // Initialize tool manager
  useEffect(() => {
    if (!toolManagerRef.current) {
      // Initialize tool manager
      toolManagerRef.current = new ToolManager(dispatch)
      
      // Register tools
      const rectangleTool = new RectangleTool(dispatch)
      const penTool = new PenTool(dispatch)
      
      toolManagerRef.current.registerTool(rectangleTool)
      toolManagerRef.current.registerTool(penTool)
      
      // Set default tool
      toolManagerRef.current.setActiveTool('rectangle')
    }
  }, [dispatch])

  // Update active tool when Redux state changes
  useEffect(() => {
    if (toolManagerRef.current && activeTool) {
      toolManagerRef.current.setActiveTool(activeTool)
    }
  }, [activeTool])

  // Event handlers
  const onToolPointerDown = (event: PointerEventData, canvas: CanvasState) => {
    toolManagerRef.current?.handlePointerDown(event, canvas)
  }

  const onToolPointerMove = (event: PointerEventData, canvas: CanvasState) => {
    toolManagerRef.current?.handlePointerMove(event, canvas)
  }

  const onToolPointerUp = (event: PointerEventData, canvas: CanvasState) => {
    toolManagerRef.current?.handlePointerUp(event, canvas)
  }

  const getCurrentCursor = () => {
    return toolManagerRef.current?.getCurrentCursor() || 'default'
  }

  return {
    onToolPointerDown,
    onToolPointerMove,
    onToolPointerUp,
    getCurrentCursor
  }
} 