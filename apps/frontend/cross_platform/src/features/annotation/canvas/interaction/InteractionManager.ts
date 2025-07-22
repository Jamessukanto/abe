import type { Point, AnnotationShape, AnnotationGroup, Rectangle } from '../../lib/types'
import { HitTester } from '../../engine/HitTester'

/**
 * InteractionManager handles shape hit testing and selection using the existing HitTester
 * Integrates with the engine layer to provide interaction capabilities
 */
export class InteractionManager {
  private hitTester: HitTester
  private shapes: Map<string, AnnotationShape> = new Map()
  private groups: Map<string, AnnotationGroup> = new Map()

  constructor() {
    this.hitTester = new HitTester()
  }

  /**
   * Update the spatial index with current shapes and groups
   */
  updateIndex(shapes: AnnotationShape[], groups: AnnotationGroup[]): void {
    // Update local maps for quick access
    this.shapes.clear()
    this.groups.clear()
    
    shapes.forEach(shape => {
      this.shapes.set(shape.id, shape)
    })
    
    groups.forEach(group => {
      this.groups.set(group.id, group)
    })

    // Update hit tester with visible shapes only
    const visibleShapes = shapes.filter(shape => shape.isVisible)
    this.hitTester.updateIndex(visibleShapes)
  }

  /**
   * Find the topmost shape at a given point
   */
  findShapeAt(point: Point): AnnotationShape | null {
    return this.hitTester.findShapeAt(point)
  }

  /**
   * Find all shapes at a given point (for multi-selection)
   */
  findAllShapesAt(point: Point): AnnotationShape[] {
    return this.hitTester.findAllShapesAt(point)
  }

  /**
   * Find shapes within a rectangular selection area
   */
  findShapesInArea(bounds: Rectangle): AnnotationShape[] {
    return this.hitTester.findShapesInArea(bounds)
  }

  /**
   * Find shapes that intersect with a line (for lasso selection)
   */
  findShapesIntersectingLine(start: Point, end: Point): AnnotationShape[] {
    const allShapes = Array.from(this.shapes.values())
    return allShapes.filter(shape => 
      shape.isVisible && this.hitTester.lineIntersectsShape(start, end, shape)
    )
  }

  /**
   * Get the group containing a shape
   */
  getShapeGroup(shapeId: string): AnnotationGroup | null {
    const shape = this.shapes.get(shapeId)
    if (!shape || !shape.groupId) return null
    
    return this.groups.get(shape.groupId) || null
  }

  /**
   * Get all shapes in a group (recursive)
   */
  getGroupShapes(groupId: string): AnnotationShape[] {
    const group = this.groups.get(groupId)
    if (!group) return []

    const shapes: AnnotationShape[] = []
    
    group.childIds.forEach(childId => {
      const shape = this.shapes.get(childId)
      if (shape) {
        shapes.push(shape)
      } else {
        // Child might be a nested group
        shapes.push(...this.getGroupShapes(childId))
      }
    })

    return shapes
  }

  /**
   * Find the nearest shape to a point within a tolerance
   */
  findNearestShape(point: Point, tolerance: number = 10): AnnotationShape | null {
    const allShapes = Array.from(this.shapes.values())
    let nearestShape: AnnotationShape | null = null
    let minDistance = tolerance

    for (const shape of allShapes) {
      if (!shape.isVisible) continue

      const distance = this.getDistanceToShape(point, shape)
      if (distance < minDistance) {
        minDistance = distance
        nearestShape = shape
      }
    }

    return nearestShape
  }

  /**
   * Check if a point is near a shape's edge (for edge selection)
   */
  isNearShapeEdge(point: Point, shape: AnnotationShape, tolerance: number = 5): boolean {
    // Implementation depends on shape type
    switch (shape.type) {
      case 'rectangle':
        return this.isNearRectangleEdge(point, shape, tolerance)
      case 'polygon':
        return this.isNearPolygonEdge(point, shape, tolerance)
      case 'point':
        return this.hitTester.pointNearPoint(point, shape.coordinates[0], tolerance)
      default:
        return false
    }
  }

  /**
   * Get shape bounds for selection handles
   */
  getShapeBounds(shape: AnnotationShape): Rectangle {
    return this.hitTester.getShapeBounds(shape)
  }

  /**
   * Get performance statistics from hit tester
   */
  getStats() {
    return this.hitTester.getStats()
  }

  /**
   * Clear the spatial index
   */
  clear(): void {
    this.hitTester.clear()
    this.shapes.clear()
    this.groups.clear()
  }

  /**
   * Calculate distance from point to shape
   */
  private getDistanceToShape(point: Point, shape: AnnotationShape): number {
    switch (shape.type) {
      case 'rectangle':
        return this.getDistanceToRectangle(point, shape)
      case 'polygon':
        return this.getDistanceToPolygon(point, shape)
      case 'point':
        const [px, py] = shape.coordinates[0]
        return Math.sqrt((point.x - px) ** 2 + (point.y - py) ** 2)
      default:
        return Infinity
    }
  }

  /**
   * Check if point is near rectangle edge
   */
  private isNearRectangleEdge(point: Point, shape: AnnotationShape, tolerance: number): boolean {
    if (shape.coordinates.length < 2) return false

    const [x1, y1] = shape.coordinates[0]
    const [x2, y2] = shape.coordinates[1]
    
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)

    // Check distance to each edge
    const distToLeft = Math.abs(point.x - minX)
    const distToRight = Math.abs(point.x - maxX)
    const distToTop = Math.abs(point.y - minY)
    const distToBottom = Math.abs(point.y - maxY)

    // Point must be within the rectangle bounds (with tolerance) for edge detection
    const withinBounds = 
      point.x >= minX - tolerance && point.x <= maxX + tolerance &&
      point.y >= minY - tolerance && point.y <= maxY + tolerance

    if (!withinBounds) return false

    // Check if close to any edge
    return (
      (distToLeft <= tolerance && point.y >= minY && point.y <= maxY) ||
      (distToRight <= tolerance && point.y >= minY && point.y <= maxY) ||
      (distToTop <= tolerance && point.x >= minX && point.x <= maxX) ||
      (distToBottom <= tolerance && point.x >= minX && point.x <= maxX)
    )
  }

  /**
   * Check if point is near polygon edge
   */
  private isNearPolygonEdge(point: Point, shape: AnnotationShape, tolerance: number): boolean {
    const coords = shape.coordinates
    if (coords.length < 2) return false

    for (let i = 0; i < coords.length; i++) {
      const start = { x: coords[i][0], y: coords[i][1] }
      const end = { x: coords[(i + 1) % coords.length][0], y: coords[(i + 1) % coords.length][1] }
      
      const distance = this.distanceToLineSegment(point, start, end)
      if (distance <= tolerance) {
        return true
      }
    }

    return false
  }

  /**
   * Calculate distance from point to rectangle
   */
  private getDistanceToRectangle(point: Point, shape: AnnotationShape): number {
    if (shape.coordinates.length < 2) return Infinity

    const [x1, y1] = shape.coordinates[0]
    const [x2, y2] = shape.coordinates[1]
    
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)

    // If point is inside rectangle, distance is 0
    if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
      return 0
    }

    // Calculate distance to nearest edge
    const dx = Math.max(minX - point.x, 0, point.x - maxX)
    const dy = Math.max(minY - point.y, 0, point.y - maxY)
    
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculate distance from point to polygon
   */
  private getDistanceToPolygon(point: Point, shape: AnnotationShape): number {
    const coords = shape.coordinates
    if (coords.length === 0) return Infinity

    // Check if point is inside polygon first
    if (this.hitTester.pointInPolygon(point, coords)) {
      return 0
    }

    // Find minimum distance to any edge
    let minDistance = Infinity
    
    for (let i = 0; i < coords.length; i++) {
      const start = { x: coords[i][0], y: coords[i][1] }
      const end = { x: coords[(i + 1) % coords.length][0], y: coords[(i + 1) % coords.length][1] }
      
      const distance = this.distanceToLineSegment(point, start, end)
      minDistance = Math.min(minDistance, distance)
    }

    return minDistance
  }

  /**
   * Calculate distance from point to line segment
   */
  private distanceToLineSegment(point: Point, start: Point, end: Point): number {
    const dx = end.x - start.x
    const dy = end.y - start.y
    
    if (dx === 0 && dy === 0) {
      // Line segment is actually a point
      return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2)
    }
    
    const t = Math.max(0, Math.min(1, 
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)
    ))
    
    const projection = {
      x: start.x + t * dx,
      y: start.y + t * dy
    }
    
    return Math.sqrt((point.x - projection.x) ** 2 + (point.y - projection.y) ** 2)
  }
} 