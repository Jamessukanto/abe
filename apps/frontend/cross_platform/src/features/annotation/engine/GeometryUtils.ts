import type { Point, Rectangle, AnnotationShape } from '../lib/types'

/**
 * GeometryUtils provides computational geometry functions
 * Extracted common calculations to avoid duplication across components
 */
export class GeometryUtils {
  /**
   * Calculate bounding box for any shape
   */
  static getShapeBounds(shape: AnnotationShape): Rectangle {
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
   * Get bounding box for rectangle shape
   */
  static getRectangleBounds(shape: AnnotationShape): Rectangle {
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
   * Get bounding box for polygon shape
   */
  static getPolygonBounds(shape: AnnotationShape): Rectangle {
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
   * Get bounding box for point shape
   */
  static getPointBounds(shape: AnnotationShape): Rectangle {
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

  /**
   * Calculate area of a polygon using shoelace formula
   */
  static calculatePolygonArea(coordinates: number[][]): number {
    if (coordinates.length < 3) return 0
    
    let area = 0
    const n = coordinates.length
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += coordinates[i][0] * coordinates[j][1]
      area -= coordinates[j][0] * coordinates[i][1]
    }
    
    return Math.abs(area) / 2
  }

  /**
   * Calculate perimeter of a polygon
   */
  static calculatePolygonPerimeter(coordinates: number[][]): number {
    if (coordinates.length < 2) return 0
    
    let perimeter = 0
    
    for (let i = 0; i < coordinates.length; i++) {
      const current = coordinates[i]
      const next = coordinates[(i + 1) % coordinates.length]
      
      const dx = next[0] - current[0]
      const dy = next[1] - current[1]
      perimeter += Math.sqrt(dx * dx + dy * dy)
    }
    
    return perimeter
  }

  /**
   * Calculate distance between two points
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculate distance from point to line segment
   */
  static distanceToLineSegment(point: Point, start: Point, end: Point): number {
    const dx = end.x - start.x
    const dy = end.y - start.y
    
    if (dx === 0 && dy === 0) {
      // Line segment is actually a point
      return this.distance(point, start)
    }
    
    const t = Math.max(0, Math.min(1, 
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)
    ))
    
    const projection = {
      x: start.x + t * dx,
      y: start.y + t * dy
    }
    
    return this.distance(point, projection)
  }

  /**
   * Test if point is inside rectangle
   */
  static pointInRectangle(point: Point, rect: Rectangle): boolean {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width && 
           point.y >= rect.y && 
           point.y <= rect.y + rect.height
  }

  /**
   * Test if point is inside polygon using ray casting
   */
  static pointInPolygon(point: Point, coordinates: number[][]): boolean {
    if (coordinates.length < 3) return false
    
    let inside = false
    const x = point.x
    const y = point.y
    
    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      const xi = coordinates[i][0]
      const yi = coordinates[i][1]
      const xj = coordinates[j][0] 
      const yj = coordinates[j][1]
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    
    return inside
  }

  /**
   * Test if point is near another point within tolerance
   */
  static pointNearPoint(p1: Point, p2: [number, number], tolerance: number): boolean {
    const dx = p1.x - p2[0]
    const dy = p1.y - p2[1]
    return Math.sqrt(dx * dx + dy * dy) <= tolerance
  }

  /**
   * Test if two rectangles intersect
   */
  static rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y)
  }

  /**
   * Test if line segment intersects with rectangle
   */
  static lineIntersectsRectangle(start: Point, end: Point, rect: Rectangle): boolean {
    // Check if either endpoint is inside rectangle
    if (this.pointInRectangle(start, rect) || this.pointInRectangle(end, rect)) {
      return true
    }
    
    // Check intersection with each edge of rectangle
    const edges = [
      { start: { x: rect.x, y: rect.y }, end: { x: rect.x + rect.width, y: rect.y } }, // Top
      { start: { x: rect.x + rect.width, y: rect.y }, end: { x: rect.x + rect.width, y: rect.y + rect.height } }, // Right
      { start: { x: rect.x + rect.width, y: rect.y + rect.height }, end: { x: rect.x, y: rect.y + rect.height } }, // Bottom
      { start: { x: rect.x, y: rect.y + rect.height }, end: { x: rect.x, y: rect.y } } // Left
    ]
    
    return edges.some(edge => this.lineSegmentsIntersect(start, end, edge.start, edge.end))
  }

  /**
   * Test if two line segments intersect
   */
  static lineSegmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
    const orientation = (p: Point, q: Point, r: Point): number => {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
      if (val === 0) return 0 // Collinear
      return val > 0 ? 1 : 2 // Clockwise or Counterclockwise
    }
    
    const onSegment = (p: Point, q: Point, r: Point): boolean => {
      return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
             q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
    }
    
    const o1 = orientation(p1, q1, p2)
    const o2 = orientation(p1, q1, q2)
    const o3 = orientation(p2, q2, p1)
    const o4 = orientation(p2, q2, q1)
    
    // General case
    if (o1 !== o2 && o3 !== o4) return true
    
    // Special cases - collinear points
    if (o1 === 0 && onSegment(p1, p2, q1)) return true
    if (o2 === 0 && onSegment(p1, q2, q1)) return true
    if (o3 === 0 && onSegment(p2, p1, q2)) return true
    if (o4 === 0 && onSegment(p2, q1, q2)) return true
    
    return false
  }

  /**
   * Constrain point to rectangle bounds
   */
  static constrainPointToRectangle(point: Point, rect: Rectangle): Point {
    return {
      x: Math.max(rect.x, Math.min(rect.x + rect.width, point.x)),
      y: Math.max(rect.y, Math.min(rect.y + rect.height, point.y))
    }
  }

  /**
   * Calculate centroid of polygon
   */
  static getPolygonCentroid(coordinates: number[][]): Point {
    if (coordinates.length === 0) return { x: 0, y: 0 }
    
    let cx = 0
    let cy = 0
    let area = 0
    
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length
      const xi = coordinates[i][0]
      const yi = coordinates[i][1]
      const xj = coordinates[j][0]
      const yj = coordinates[j][1]
      
      const a = xi * yj - xj * yi
      area += a
      cx += (xi + xj) * a
      cy += (yi + yj) * a
    }
    
    area *= 0.5
    cx /= (6 * area)
    cy /= (6 * area)
    
    return { x: cx, y: cy }
  }

  /**
   * Expand rectangle by margin
   */
  static expandRectangle(rect: Rectangle, margin: number): Rectangle {
    return {
      x: rect.x - margin,
      y: rect.y - margin,
      width: rect.width + margin * 2,
      height: rect.height + margin * 2
    }
  }
} 