import type { Tool, PointerEventData, CanvasState } from '../../lib/types'
import type { IToolManager } from './types'
import type { ClientAppDispatch } from '../../../../store/clientStore'
import { setActiveTool } from '../../../../store/annotationSlice'

/**
 * Tool manager handles tool registration, activation, and event delegation
 */
export class ToolManager implements IToolManager {
  private tools: Map<string, Tool> = new Map()
  private activeTool: Tool | null = null
  private dispatch: ClientAppDispatch

  constructor(dispatch: ClientAppDispatch) {
    this.dispatch = dispatch
  }

  /**
   * Register a tool with the manager
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.type, tool)
  }

  /**
   * Set the active tool by type
   */
  setActiveTool(toolType: string): void {
    // Deactivate current tool
    if (this.activeTool) {
      this.activeTool.onDeactivate?.()
    }

    // Get new tool
    const newTool = this.tools.get(toolType)
    if (newTool) {
      this.activeTool = newTool
      
      // Activate new tool
      this.activeTool.onActivate?.()
      
      // Update Redux state
      this.dispatch(setActiveTool(toolType as any))
    } else {
      console.warn(`Tool type "${toolType}" not found`)
      this.activeTool = null
    }
  }

  /**
   * Get the currently active tool
   */
  getActiveTool(): Tool | null {
    return this.activeTool
  }

  /**
   * Get all registered tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get all registered tool types
   */
  getToolTypes(): string[] {
    return Array.from(this.tools.keys())
  }

  /**
   * Check if a tool is registered
   */
  hasTool(toolType: string): boolean {
    return this.tools.has(toolType)
  }

  /**
   * Handle pointer down events - delegate to active tool
   */
  handlePointerDown(event: PointerEventData, canvas: CanvasState): void {
    if (this.activeTool) {
      try {
        this.activeTool.onDown(event, canvas)
      } catch (error) {
        console.error('Error in tool onDown:', error)
        this.handleToolError(error)
      }
    }
  }

  /**
   * Handle pointer move events - delegate to active tool
   */
  handlePointerMove(event: PointerEventData, canvas: CanvasState): void {
    if (this.activeTool) {
      try {
        this.activeTool.onMove(event, canvas)
      } catch (error) {
        console.error('Error in tool onMove:', error)
        this.handleToolError(error)
      }
    }
  }

  /**
   * Handle pointer up events - delegate to active tool
   */
  handlePointerUp(event: PointerEventData, canvas: CanvasState): void {
    if (this.activeTool) {
      try {
        this.activeTool.onUp(event, canvas)
      } catch (error) {
        console.error('Error in tool onUp:', error)
        this.handleToolError(error)
      }
    }
  }

  /**
   * Handle keyboard events - delegate to active tool if it supports them
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (this.activeTool && 'onKeyDown' in this.activeTool) {
      try {
        (this.activeTool as any).onKeyDown(event)
      } catch (error) {
        console.error('Error in tool onKeyDown:', error)
        this.handleToolError(error)
      }
    }
  }

  /**
   * Handle double-click events - delegate to active tool if it supports them
   */
  handleDoubleClick(event: PointerEventData, canvas: CanvasState): void {
    if (this.activeTool && 'onDoubleClick' in this.activeTool) {
      try {
        (this.activeTool as any).onDoubleClick(event, canvas)
      } catch (error) {
        console.error('Error in tool onDoubleClick:', error)
        this.handleToolError(error)
      }
    }
  }

  /**
   * Cancel current tool operation
   */
  cancelCurrentTool(): void {
    if (this.activeTool) {
      try {
        this.activeTool.onCancel?.()
      } catch (error) {
        console.error('Error in tool onCancel:', error)
        this.handleToolError(error)
      }
    }
  }

  /**
   * Get tool by type
   */
  getTool(toolType: string): Tool | undefined {
    return this.tools.get(toolType)
  }

  /**
   * Check if current tool is drawing
   */
  isToolDrawing(): boolean {
    if (!this.activeTool) return false
    
    // Check if tool has isDrawing property
    return 'isDrawing' in this.activeTool && (this.activeTool as any).isDrawing
  }

  /**
   * Get current tool cursor
   */
  getCurrentCursor(): string {
    return this.activeTool?.cursor || 'default'
  }

  /**
   * Handle tool errors gracefully
   */
  private handleToolError(error: any): void {
    // Log error and attempt to recover
    console.error('Tool error occurred:', error)
    
    // Cancel current operation to prevent further errors
    this.cancelCurrentTool()
    
    // Could emit an event or show user notification here
  }

  /**
   * Cleanup when manager is destroyed
   */
  destroy(): void {
    // Deactivate current tool
    if (this.activeTool) {
      this.activeTool.onDeactivate?.()
    }
    
    // Clear all tools
    this.tools.clear()
    this.activeTool = null
  }
} 