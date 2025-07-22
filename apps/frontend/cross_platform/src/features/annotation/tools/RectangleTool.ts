import { BaseTool } from './BaseTool'
import type { 
  PointerEventData, 
  CanvasState, 
  Point, 
  AnnotationShape,
  CreateShapePayload 
} from '../lib/types'
import { 
  setPreview, 
  clearPreview, 
  addShape
} from '../../../store/annotationSlice'

/**
 * Rectangle drawing tool
 * Allows users to create rectangular annotation shapes by clicking and dragging
 */
export class RectangleTool extends BaseTool {
  type = 'rectangle'
  cursor = 'crosshair'

  private startPoint?: Point
  private currentPreview?: Partial<AnnotationShape>

  onDown(event: PointerEventData, canvas: CanvasState): void {
    console.log('RectangleTool onDown called', event)
    console.log('RectangleTool canvas state:', canvas)
    if (!this.shouldHandleEvent(event)) return

    // Convert screen coordinates to canvas coordinates
    const canvasPoint = this.screenToCanvas(event.point, canvas)
    console.log('RectangleTool canvasPoint:', canvasPoint)
    
    // Constrain to image bounds
    this.startPoint = this.constrainToImageBounds(canvasPoint, canvas)
    
    this.isDrawing = true

    // Clear any existing preview
    this.dispatch(clearPreview())
    console.log('RectangleTool onDown completed, startPoint:', this.startPoint)
  }

  onMove(event: PointerEventData, canvas: CanvasState): void {
    if (!this.shouldHandleEvent(event) || !this.isDrawing || !this.startPoint) return

    // Convert current point to canvas coordinates
    const canvasPoint = this.screenToCanvas(event.point, canvas)
    const currentPoint = this.constrainToImageBounds(canvasPoint, canvas)

    // Create preview rectangle
    const previewShape = this.createRectangleShape(this.startPoint, currentPoint)
    
    this.currentPreview = previewShape
    
    // Update preview in store
    this.dispatch(setPreview({
      shape: previewShape,
      isActive: true
    }))
    console.log('RectangleTool onMove - preview shape created:', previewShape)
  }

  onUp(event: PointerEventData, canvas: CanvasState): void {
    console.log('RectangleTool onUp called')
    if (!this.shouldHandleEvent(event) || !this.isDrawing || !this.startPoint) return

    // Convert final point to canvas coordinates
    const canvasPoint = this.screenToCanvas(event.point, canvas)
    const endPoint = this.constrainToImageBounds(canvasPoint, canvas)

    // Check minimum size requirement (at least 5x5 pixels)
    const width = Math.abs(endPoint.x - this.startPoint.x)
    const height = Math.abs(endPoint.y - this.startPoint.y)
    
    console.log('RectangleTool onUp - dimensions:', { width, height })
    
    if (width >= 5 && height >= 5) {
      // Create final shape
      const finalShape = this.createRectangleShape(this.startPoint, endPoint)
      
      // Add shape to store
      this.dispatch(addShape({
        shape: {
          ...finalShape,
          classId: 'default', // Will be improved in Phase 4
          isSelected: true,
          isVisible: true,
          metadata: {
            width,
            height,
            area: width * height
          },
          groupId: undefined
        } as CreateShapePayload['shape']
      }))
      console.log('RectangleTool onUp - shape added to store:', finalShape)
    } else {
      console.log('RectangleTool onUp - shape too small, not adding')
    }

    // Clean up
    this.cleanup()
  }

  onCancel(): void {
    super.onCancel?.()
    this.dispatch(clearPreview())
  }

  onDeactivate(): void {
    super.onDeactivate?.()
    this.dispatch(clearPreview())
  }

  /**
   * Create rectangle shape from two points
   */
  private createRectangleShape(start: Point, end: Point): Partial<AnnotationShape> {
    return {
      id: this.generateShapeId(),
      type: 'rectangle',
      coordinates: [
        [start.x, start.y],
        [end.x, end.y]
      ]
    }
  }

  /**
   * Clean up drawing state
   */
  protected cleanup(): void {
    this.startPoint = undefined
    this.currentPreview = undefined
    this.isDrawing = false
    this.dispatch(clearPreview())
  }

  /**
   * Handle keyboard shortcuts specific to rectangle tool
   */
  onKeyDown?(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isDrawing) {
      this.cleanup()
    }
  }

  /**
   * Get current rectangle bounds for snapping or constraints
   */
  getCurrentBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.currentPreview || !this.currentPreview.coordinates) return null

    const [[x1, y1], [x2, y2]] = this.currentPreview.coordinates
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1)
    }
  }
} 