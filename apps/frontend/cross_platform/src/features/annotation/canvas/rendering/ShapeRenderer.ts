import type { AnnotationShape, CanvasState, Rectangle } from '../../lib/types'
import { ViewportManager } from '../viewport/ViewportManager'

/**
 * ShapeRenderer handles rendering of annotation shapes
 * Extracted from AnnotationRenderer for single responsibility
 */
export class ShapeRenderer {
  private ctx: CanvasRenderingContext2D
  private viewportManager: ViewportManager

  constructor(ctx: CanvasRenderingContext2D, viewportManager: ViewportManager) {
    this.ctx = ctx
    this.viewportManager = viewportManager
  }

  /**
   * Render multiple shapes
   */
  renderShapes(shapes: AnnotationShape[], canvasState: CanvasState): void {
    shapes.forEach(shape => {
      if (shape.isVisible) {
        this.renderShape(shape, canvasState)
      }
    })
  }

  /**
   * Render individual shape
   */
  renderShape(shape: AnnotationShape, canvasState: CanvasState): void {
    // Save context state
    this.ctx.save()
    
    // Set rendering style based on selection state
    this.ctx.globalAlpha = shape.isSelected ? 0.8 : 0.6
    this.ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#64748b'
    this.ctx.lineWidth = shape.isSelected ? 3 : 2
    this.ctx.fillStyle = shape.isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.05)'
    
    // Render based on shape type
    switch (shape.type) {
      case 'rectangle':
        this.renderRectangle(shape)
        break
      case 'polygon':
        this.renderPolygon(shape)
        break
      case 'point':
        this.renderPoint(shape)
        break
      default:
        console.warn('Unknown shape type:', shape.type)
    }
    
    // Restore context state
    this.ctx.restore()
  }

  /**
   * Get bounding box for a shape
   */
  getShapeBounds(shape: AnnotationShape): Rectangle {
    switch (shape.type) {
      case 'rectangle':
        return this.getRectangleBounds(shape)
      case 'polygon':
        return this.getPolygonBounds(shape)
      case 'point':
        return this.getPointBounds(shape)
      default:
        return { x: 0, y: 0, width: 0, height: 0 }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // No cleanup needed for now
  }

  /**
   * Render rectangle shape
   */
  private renderRectangle(shape: AnnotationShape): void {
    if (shape.coordinates.length < 2) return
    
    const [x1, y1] = shape.coordinates[0]
    const [x2, y2] = shape.coordinates[1]
    
    const x = Math.min(x1, x2)
    const y = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    
    this.ctx.fillRect(x, y, width, height)
    this.ctx.strokeRect(x, y, width, height)
  }

  /**
   * Render polygon shape
   */
  private renderPolygon(shape: AnnotationShape): void {
    if (shape.coordinates.length < 3) return
    
    this.ctx.beginPath()
    
    const [startX, startY] = shape.coordinates[0]
    this.ctx.moveTo(startX, startY)
    
    for (let i = 1; i < shape.coordinates.length; i++) {
      const [x, y] = shape.coordinates[i]
      this.ctx.lineTo(x, y)
    }
    
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()
  }

  /**
   * Render point shape
   */
  private renderPoint(shape: AnnotationShape): void {
    if (shape.coordinates.length === 0) return
    
    const [x, y] = shape.coordinates[0]
    const radius = shape.isSelected ? 8 : 6
    
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.stroke()
  }

  /**
   * Get rectangle bounds
   */
  private getRectangleBounds(shape: AnnotationShape): Rectangle {
    if (shape.coordinates.length < 2) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    const [x1, y1] = shape.coordinates[0]
    const [x2, y2] = shape.coordinates[1]
    
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1)
    }
  }

  /**
   * Get polygon bounds
   */
  private getPolygonBounds(shape: AnnotationShape): Rectangle {
    if (shape.coordinates.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    
    shape.coordinates.forEach(([x, y]) => {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    })
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Get point bounds
   */
  private getPointBounds(shape: AnnotationShape): Rectangle {
    if (shape.coordinates.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    const [x, y] = shape.coordinates[0]
    const radius = shape.isSelected ? 8 : 6
    
    return {
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2
    }
  }
} 