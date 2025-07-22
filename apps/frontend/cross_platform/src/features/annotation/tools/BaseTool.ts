import type { 
  Tool, 
  PointerEventData, 
  CanvasState, 
  Point 
} from '../lib/types'
import type { ClientAppDispatch } from '../../../store'

/**
 * Abstract base class for all annotation tools
 * Provides common functionality and enforces tool interface
 */
export abstract class BaseTool implements Tool {
  abstract type: string
  abstract cursor?: string

  protected dispatch: ClientAppDispatch
  protected isActive: boolean = false
  protected isDrawing: boolean = false

  constructor(dispatch: ClientAppDispatch) {
    this.dispatch = dispatch
  }

  /**
   * Abstract methods that must be implemented by concrete tools
   */
  abstract onDown(event: PointerEventData, canvas: CanvasState): void
  abstract onMove(event: PointerEventData, canvas: CanvasState): void
  abstract onUp(event: PointerEventData, canvas: CanvasState): void

  /**
   * Optional lifecycle methods
   */
  onCancel?(): void {
    this.isDrawing = false
    this.cleanup()
  }

  onActivate?(): void {
    this.isActive = true
  }

  onDeactivate?(): void {
    this.isActive = false
    this.isDrawing = false
    this.cleanup()
  }

  /**
   * Common utility methods available to all tools
   */
  protected screenToCanvas(point: Point, canvas: CanvasState): Point {
    // For now, use simple conversion since we're not implementing pan/zoom yet
    // The image is scaled and centered in the 800x600 canvas
    const canvasWidth = 800
    const canvasHeight = 600
    const imageWidth = canvas.imageSize.width
    const imageHeight = canvas.imageSize.height
    
    const scaleX = canvasWidth / imageWidth
    const scaleY = canvasHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    
    const imageX = (canvasWidth - scaledWidth) / 2
    const imageY = (canvasHeight - scaledHeight) / 2
    
    // Convert screen coordinates to image coordinates
    const imageCoordX = (point.x - imageX) / scale
    const imageCoordY = (point.y - imageY) / scale
    
    return {
      x: imageCoordX,
      y: imageCoordY
    }
  }

  protected canvasToScreen(point: Point, canvas: CanvasState): Point {
    return {
      x: point.x * canvas.zoom + canvas.pan.x,
      y: point.y * canvas.zoom + canvas.pan.y
    }
  }

  protected getDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  protected constrainToImageBounds(point: Point, canvas: CanvasState): Point {
    // Use actual image dimensions
    const maxWidth = canvas.imageSize.width
    const maxHeight = canvas.imageSize.height
    
    return {
      x: Math.max(0, Math.min(maxWidth, point.x)),
      y: Math.max(0, Math.min(maxHeight, point.y))
    }
  }

  protected snapToGrid(point: Point, gridSize: number = 10): Point {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    }
  }

  /**
   * Cleanup method for resource management
   */
  protected cleanup(): void {
    // Override in subclasses if needed
  }

  /**
   * Check if tool should handle event
   */
  protected shouldHandleEvent(event: PointerEventData): boolean {
    return this.isActive
  }

  /**
   * Generate unique ID for shapes
   */
  protected generateShapeId(): string {
    return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current timestamp
   */
  protected now(): number {
    return Date.now()
  }
} 