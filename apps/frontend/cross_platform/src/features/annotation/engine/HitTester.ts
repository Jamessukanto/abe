import type {
  AnnotationShape,
  AnnotationGroup,
  Point,
  Rectangle
} from '../lib/types'

/**
 * Spatial index node for R-tree-like structure
 */
interface SpatialNode {
  bounds: Rectangle
  shapeId?: string
  children?: SpatialNode[]
  isLeaf: boolean
}

/**
 * High-performance hit testing engine with spatial indexing
 * Optimized for 1000+ shapes using computational geometry
 */
export class HitTester {
  private spatialIndex: SpatialNode | null = null
  private shapes: Map<string, AnnotationShape> = new Map()
  private lastUpdateTime: number = 0
  private indexRebuildThreshold: number = 100 // Rebuild after 100 shape changes
  private changesSinceLastRebuild: number = 0

  /**
   * Update the spatial index with current shapes
   */
  updateIndex(shapes: AnnotationShape[]): void {
    // Clear existing index
    this.shapes.clear()
    
    // Store shapes in map for quick access
    shapes.forEach(shape => {
      this.shapes.set(shape.id, shape)
    })

    // Rebuild spatial index if needed
    if (this.shouldRebuildIndex(shapes)) {
      this.buildSpatialIndex(shapes)
      this.changesSinceLastRebuild = 0
      this.lastUpdateTime = Date.now()
    }
  }

  /**
   * Find shape at specific point using spatial indexing
   */
  findShapeAt(point: Point): AnnotationShape | null {
    if (!this.spatialIndex) {
      // Fallback to linear search if no index
      return this.linearSearchShapeAt(point)
    }

    // Use spatial index for fast lookup
    const candidates = this.queryIndex(this.spatialIndex, point)
    
    // Test candidates in order (front to back)
    for (const shapeId of candidates) {
      const shape = this.shapes.get(shapeId)
      if (shape && this.pointInShape(point, shape)) {
        return shape
      }
    }

    return null
  }

  /**
   * Find all shapes within a rectangular area
   */
  findShapesInArea(bounds: Rectangle): AnnotationShape[] {
    if (!this.spatialIndex) {
      // Fallback to linear search
      return this.linearSearchShapesInArea(bounds)
    }

    const candidates = this.queryIndexArea(this.spatialIndex, bounds)
    const results: AnnotationShape[] = []

    candidates.forEach(shapeId => {
      const shape = this.shapes.get(shapeId)
      if (shape && this.rectangleIntersectsShape(bounds, shape)) {
        results.push(shape)
      }
    })

    return results
  }

  /**
   * Find shapes intersecting a line segment
   */
  findShapesIntersectingLine(start: Point, end: Point): AnnotationShape[] {
    const results: AnnotationShape[] = []

    this.shapes.forEach(shape => {
      if (this.lineIntersectsShape(start, end, shape)) {
        results.push(shape)
      }
    })

    return results
  }

  /**
   * Get the topmost shape at point (considering z-order)
   */
  getTopmostShapeAt(point: Point): AnnotationShape | null {
    const candidates = this.findAllShapesAt(point)
    
    if (candidates.length === 0) return null
    
    // Sort by creation time (newer shapes are on top)
    candidates.sort((a, b) => b.createdAt - a.createdAt)
    
    return candidates[0]
  }

  /**
   * Find all shapes at a point (for multi-selection)
   */
  findAllShapesAt(point: Point): AnnotationShape[] {
    const results: AnnotationShape[] = []

    this.shapes.forEach(shape => {
      if (shape.isVisible && this.pointInShape(point, shape)) {
        results.push(shape)
      }
    })

    return results
  }

  /**
   * Computational geometry utilities
   */

  /**
   * Test if point is inside a shape
   */
  pointInShape(point: Point, shape: AnnotationShape): boolean {
    switch (shape.type) {
      case 'rectangle':
        return this.pointInRectangle(point, shape)
      case 'polygon':
        return this.pointInPolygon(point, shape.coordinates)
      case 'point':
        return this.pointNearPoint(point, shape.coordinates[0], 10) // 10px tolerance
      default:
        return false
    }
  }

  /**
   * Point-in-rectangle test
   */
  pointInRectangle(point: Point, shape: AnnotationShape): boolean {
    if (shape.coordinates.length < 2) return false

    const [x1, y1] = shape.coordinates[0]
    const [x2, y2] = shape.coordinates[1]

    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)

    return point.x >= minX && point.x <= maxX && 
           point.y >= minY && point.y <= maxY
  }

  /**
   * Point-in-polygon test using ray casting algorithm
   */
  pointInPolygon(point: Point, polygon: number[][]): boolean {
    if (polygon.length < 3) return false

    let inside = false
    const x = point.x
    const y = point.y

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i]
      const [xj, yj] = polygon[j]

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }

    return inside
  }

  /**
   * Test if point is near another point within tolerance
   */
  pointNearPoint(point1: Point, point2: number[], tolerance: number): boolean {
    const [x, y] = point2
    const dx = point1.x - x
    const dy = point1.y - y
    return Math.sqrt(dx * dx + dy * dy) <= tolerance
  }

  /**
   * Test if rectangle intersects with shape
   */
  rectangleIntersectsShape(rect: Rectangle, shape: AnnotationShape): boolean {
    const shapeBounds = this.getShapeBounds(shape)
    return this.rectanglesIntersect(rect, shapeBounds)
  }

  /**
   * Test if two rectangles intersect
   */
  rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y)
  }

  /**
   * Test if line segment intersects with shape
   */
  lineIntersectsShape(start: Point, end: Point, shape: AnnotationShape): boolean {
    switch (shape.type) {
      case 'rectangle':
        return this.lineIntersectsRectangle(start, end, shape)
      case 'polygon':
        return this.lineIntersectsPolygon(start, end, shape.coordinates)
      case 'point':
        return this.lineIntersectsPoint(start, end, shape.coordinates[0], 5)
      default:
        return false
    }
  }

  /**
   * Line-rectangle intersection
   */
  lineIntersectsRectangle(start: Point, end: Point, shape: AnnotationShape): boolean {
    if (shape.coordinates.length < 2) return false

    const [x1, y1] = shape.coordinates[0]
    const [x2, y2] = shape.coordinates[1]

    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)

    // Check if line intersects any of the four rectangle edges
    return this.lineSegmentsIntersect(start, end, {x: minX, y: minY}, {x: maxX, y: minY}) ||
           this.lineSegmentsIntersect(start, end, {x: maxX, y: minY}, {x: maxX, y: maxY}) ||
           this.lineSegmentsIntersect(start, end, {x: maxX, y: maxY}, {x: minX, y: maxY}) ||
           this.lineSegmentsIntersect(start, end, {x: minX, y: maxY}, {x: minX, y: minY})
  }

  /**
   * Line-polygon intersection
   */
  lineIntersectsPolygon(start: Point, end: Point, polygon: number[][]): boolean {
    if (polygon.length < 3) return false

    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length
      const [x1, y1] = polygon[i]
      const [x2, y2] = polygon[j]

      if (this.lineSegmentsIntersect(start, end, {x: x1, y: y1}, {x: x2, y: y2})) {
        return true
      }
    }

    return false
  }

  /**
   * Line-point intersection (with tolerance)
   */
  lineIntersectsPoint(start: Point, end: Point, point: number[], tolerance: number): boolean {
    const [x, y] = point
    const distance = this.pointToLineDistance({x, y}, start, end)
    return distance <= tolerance
  }

  /**
   * Test if two line segments intersect
   */
  lineSegmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
    const orientation = (p: Point, q: Point, r: Point): number => {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
      if (val === 0) return 0  // collinear
      return (val > 0) ? 1 : 2 // clockwise or counterclockwise
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
   * Calculate distance from point to line segment
   */
  pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x
    const B = point.y - lineStart.y
    const C = lineEnd.x - lineStart.x
    const D = lineEnd.y - lineStart.y

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) {
      // Line start and end are the same point
      return Math.sqrt(A * A + B * B)
    }

    let param = dot / lenSq

    let xx: number, yy: number

    if (param < 0) {
      xx = lineStart.x
      yy = lineStart.y
    } else if (param > 1) {
      xx = lineEnd.x
      yy = lineEnd.y
    } else {
      xx = lineStart.x + param * C
      yy = lineStart.y + param * D
    }

    const dx = point.x - xx
    const dy = point.y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Get bounding box for any shape
   */
  getShapeBounds(shape: AnnotationShape): Rectangle {
    const coordinates = shape.coordinates.flat()
    
    if (coordinates.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    const xCoords = coordinates.filter((_, i) => i % 2 === 0)
    const yCoords = coordinates.filter((_, i) => i % 2 === 1)
    
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minY = Math.min(...yCoords)
    const maxY = Math.max(...yCoords)
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Spatial indexing implementation (simplified R-tree)
   */

  /**
   * Build spatial index for fast queries
   */
  private buildSpatialIndex(shapes: AnnotationShape[]): void {
    if (shapes.length === 0) {
      this.spatialIndex = null
      return
    }

    // Create leaf nodes for each shape
    const leafNodes: SpatialNode[] = shapes.map(shape => ({
      bounds: this.getShapeBounds(shape),
      shapeId: shape.id,
      isLeaf: true
    }))

    this.spatialIndex = this.buildIndexRecursive(leafNodes)
  }

  /**
   * Recursively build spatial index tree
   */
  private buildIndexRecursive(nodes: SpatialNode[]): SpatialNode {
    if (nodes.length === 1) {
      return nodes[0]
    }

    if (nodes.length <= 4) { // Max 4 children per node
      return {
        bounds: this.calculateBoundingBox(nodes),
        children: nodes,
        isLeaf: false
      }
    }

    // Split nodes into groups (simplified - could use better partitioning)
    const mid = Math.ceil(nodes.length / 2)
    const leftNodes = nodes.slice(0, mid)
    const rightNodes = nodes.slice(mid)

    const leftChild = this.buildIndexRecursive(leftNodes)
    const rightChild = this.buildIndexRecursive(rightNodes)

    return {
      bounds: this.calculateBoundingBox([leftChild, rightChild]),
      children: [leftChild, rightChild],
      isLeaf: false
    }
  }

  /**
   * Calculate bounding box that contains all child nodes
   */
  private calculateBoundingBox(nodes: SpatialNode[]): Rectangle {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    nodes.forEach(node => {
      minX = Math.min(minX, node.bounds.x)
      minY = Math.min(minY, node.bounds.y)
      maxX = Math.max(maxX, node.bounds.x + node.bounds.width)
      maxY = Math.max(maxY, node.bounds.y + node.bounds.height)
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Query spatial index for point
   */
  private queryIndex(node: SpatialNode, point: Point): string[] {
    const results: string[] = []

    if (!this.pointInRectangleCoords(point, node.bounds)) {
      return results
    }

    if (node.isLeaf && node.shapeId) {
      results.push(node.shapeId)
    } else if (node.children) {
      node.children.forEach(child => {
        results.push(...this.queryIndex(child, point))
      })
    }

    return results
  }

  /**
   * Query spatial index for area
   */
  private queryIndexArea(node: SpatialNode, area: Rectangle): string[] {
    const results: string[] = []

    if (!this.rectanglesIntersect(node.bounds, area)) {
      return results
    }

    if (node.isLeaf && node.shapeId) {
      results.push(node.shapeId)
    } else if (node.children) {
      node.children.forEach(child => {
        results.push(...this.queryIndexArea(child, area))
      })
    }

    return results
  }

  /**
   * Helper to test if point is in rectangle coordinates
   */
  private pointInRectangleCoords(point: Point, rect: Rectangle): boolean {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width && 
           point.y >= rect.y && 
           point.y <= rect.y + rect.height
  }

  /**
   * Fallback methods when spatial index is not available
   */
  private linearSearchShapeAt(point: Point): AnnotationShape | null {
    // Linear search through all shapes
    const candidates = Array.from(this.shapes.values())
      .filter(shape => shape.isVisible)
      .sort((a, b) => b.createdAt - a.createdAt) // Front to back

    for (const shape of candidates) {
      if (this.pointInShape(point, shape)) {
        return shape
      }
    }

    return null
  }

  private linearSearchShapesInArea(bounds: Rectangle): AnnotationShape[] {
    return Array.from(this.shapes.values())
      .filter(shape => shape.isVisible && this.rectangleIntersectsShape(bounds, shape))
  }

  /**
   * Performance optimization helpers
   */
  private shouldRebuildIndex(shapes: AnnotationShape[]): boolean {
    return !this.spatialIndex || 
           this.changesSinceLastRebuild >= this.indexRebuildThreshold ||
           shapes.length !== this.shapes.size
  }

  /**
   * Mark that shapes have changed (for index invalidation)
   */
  markShapeChanged(): void {
    this.changesSinceLastRebuild++
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      totalShapes: this.shapes.size,
      hasIndex: !!this.spatialIndex,
      changesSinceRebuild: this.changesSinceLastRebuild,
      lastUpdateTime: this.lastUpdateTime
    }
  }

  /**
   * Clear spatial index and shapes
   */
  clear(): void {
    this.spatialIndex = null
    this.shapes.clear()
    this.changesSinceLastRebuild = 0
  }
} 