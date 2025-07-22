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
 * Pen tool for drawing polygons
 * Allows users to create polygon shapes by clicking points to define vertices
 */
export class PenTool extends BaseTool {
  type = 'polygon'
  cursor = 'crosshair'

  private points: Point[] = []
  private isComplete: boolean = false
  private closeThreshold: number = 15 // Distance to close polygon
  private minPoints: number = 3 // Minimum points for a valid polygon

  onDown(event: PointerEventData, canvas: CanvasState): void {
    if (!this.shouldHandleEvent(event)) return

    // Convert screen coordinates to canvas coordinates
    const canvasPoint = this.screenToCanvas(event.point, canvas)
    const constrainedPoint = this.constrainToImageBounds(canvasPoint, canvas)

    // Check if clicking near the first point to close polygon
    if (this.points.length >= this.minPoints && this.isNearFirstPoint(constrainedPoint)) {
      this.completePolygon()
      return
    }

    // Add new point to polygon
    this.points.push(constrainedPoint)
    
    // Start drawing after first point
    if (this.points.length === 1) {
      this.isDrawing = true
    }

    // Update preview
    this.updatePreview(constrainedPoint)
  }

  onMove(event: PointerEventData, canvas: CanvasState): void {
    if (!this.shouldHandleEvent(event) || !this.isDrawing) return

    // Convert current point to canvas coordinates
    const canvasPoint = this.screenToCanvas(event.point, canvas)
    const currentPoint = this.constrainToImageBounds(canvasPoint, canvas)

    // Update preview with current mouse position
    this.updatePreview(currentPoint)
  }

  onUp(event: PointerEventData, canvas: CanvasState): void {
    // For pen tool, we handle point placement on down event
    // onUp is mainly for cleanup if needed
  }

  onCancel(): void {
    super.onCancel?.()
    this.resetPolygon()
  }

  onDeactivate(): void {
    super.onDeactivate?.()
    // Complete current polygon if it has enough points
    if (this.points.length >= this.minPoints) {
      this.completePolygon()
    } else {
      this.resetPolygon()
    }
  }

  /**
   * Handle double-click to complete polygon
   */
  onDoubleClick?(event: PointerEventData, canvas: CanvasState): void {
    if (this.points.length >= this.minPoints) {
      this.completePolygon()
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  onKeyDown?(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.resetPolygon()
        break
      case 'Enter':
        if (this.points.length >= this.minPoints) {
          this.completePolygon()
        }
        break
      case 'Backspace':
        this.removeLastPoint()
        break
    }
  }

  /**
   * Update preview shape with current points and mouse position
   */
  private updatePreview(currentMousePoint?: Point): void {
    if (this.points.length === 0) return

    let previewCoordinates = [...this.points]
    
    // Add current mouse position as temporary point for live preview
    if (currentMousePoint && this.isDrawing) {
      previewCoordinates.push(currentMousePoint)
    }

    // If we have enough points and mouse is near first point, show closed preview
    if (currentMousePoint && this.points.length >= this.minPoints && 
        this.isNearFirstPoint(currentMousePoint)) {
      // Don't add the mouse point, just use existing points for closed polygon
      previewCoordinates = [...this.points]
    }

    const previewShape: Partial<AnnotationShape> = {
      id: this.generateShapeId(),
      type: 'polygon',
      coordinates: previewCoordinates.map(p => [p.x, p.y])
    }

    this.dispatch(setPreview({
      shape: previewShape,
      isActive: true
    }))
  }

  /**
   * Check if point is near the first point (for closing polygon)
   */
  private isNearFirstPoint(point: Point): boolean {
    if (this.points.length < this.minPoints) return false
    
    const firstPoint = this.points[0]
    return this.getDistance(point, firstPoint) <= this.closeThreshold
  }

  /**
   * Complete and finalize the polygon
   */
  private completePolygon(): void {
    if (this.points.length < this.minPoints) return

    // Create final polygon shape
    const finalShape: CreateShapePayload['shape'] = {
      type: 'polygon',
      coordinates: this.points.map(p => [p.x, p.y]),
      classId: 'default', // Will be improved in Phase 4
      isSelected: true,
      isVisible: true,
      metadata: {
        pointCount: this.points.length,
        area: this.calculatePolygonArea(),
        perimeter: this.calculatePolygonPerimeter()
      },
      groupId: undefined
    }

    // Add shape to store
    this.dispatch(addShape({ shape: finalShape }))

    // Reset for next polygon
    this.resetPolygon()
  }

  /**
   * Remove the last point from current polygon
   */
  private removeLastPoint(): void {
    if (this.points.length > 0) {
      this.points.pop()
      
      if (this.points.length === 0) {
        this.resetPolygon()
      } else {
        this.updatePreview()
      }
    }
  }

  /**
   * Reset polygon drawing state
   */
  private resetPolygon(): void {
    this.points = []
    this.isComplete = false
    this.isDrawing = false
    this.dispatch(clearPreview())
  }

  /**
   * Calculate polygon area using shoelace formula
   */
  private calculatePolygonArea(): number {
    if (this.points.length < 3) return 0

    let area = 0
    for (let i = 0; i < this.points.length; i++) {
      const j = (i + 1) % this.points.length
      area += this.points[i].x * this.points[j].y
      area -= this.points[j].x * this.points[i].y
    }
    return Math.abs(area / 2)
  }

  /**
   * Calculate polygon perimeter
   */
  private calculatePolygonPerimeter(): number {
    if (this.points.length < 2) return 0

    let perimeter = 0
    for (let i = 0; i < this.points.length; i++) {
      const j = (i + 1) % this.points.length
      perimeter += this.getDistance(this.points[i], this.points[j])
    }
    return perimeter
  }

  /**
   * Get current polygon info
   */
  getCurrentPolygonInfo(): {
    pointCount: number
    isValid: boolean
    canClose: boolean
    area?: number
    perimeter?: number
  } {
    return {
      pointCount: this.points.length,
      isValid: this.points.length >= this.minPoints,
      canClose: this.points.length >= this.minPoints,
      area: this.points.length >= 3 ? this.calculatePolygonArea() : undefined,
      perimeter: this.points.length >= 2 ? this.calculatePolygonPerimeter() : undefined
    }
  }

  /**
   * Clean up tool state
   */
  protected cleanup(): void {
    this.resetPolygon()
  }
} 