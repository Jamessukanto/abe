import type { Tool, PointerEventData, CanvasState } from '../lib/types'

/**
 * Tool configuration interface
 */
export interface ToolConfig {
  type: string
  cursor?: string
  name: string
  icon?: string
  shortcut?: string
}

/**
 * Tool manager interface
 */
export interface IToolManager {
  registerTool(tool: Tool): void
  setActiveTool(toolType: string): void
  getActiveTool(): Tool | null
  getAllTools(): Tool[]
  handlePointerDown(event: PointerEventData, canvas: CanvasState): void
  handlePointerMove(event: PointerEventData, canvas: CanvasState): void
  handlePointerUp(event: PointerEventData, canvas: CanvasState): void
}

/**
 * Built-in tool types
 */
export type BuiltInToolType = 'select' | 'pan' | 'rectangle' | 'polygon' | 'point'

/**
 * Tool state for tracking drawing operations
 */
export interface ToolState {
  isActive: boolean
  isDrawing: boolean
  startPoint?: { x: number; y: number }
  currentPoints?: { x: number; y: number }[]
  previewId?: string
} 