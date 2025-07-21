/**
 * Performance monitoring and optimization utilities
 * Tracks rendering performance and provides batching for updates
 */

export interface PerformanceMetrics {
  frameRate: number
  renderTime: number
  totalShapes: number
  visibleShapes: number
  culledShapes: number
  batchedUpdates: number
  lastUpdateTime: number
}

export interface BatchedUpdate {
  shapeId: string
  updates: any
  timestamp: number
}

/**
 * Performance monitor for tracking rendering metrics
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    frameRate: 0,
    renderTime: 0,
    totalShapes: 0,
    visibleShapes: 0,
    culledShapes: 0,
    batchedUpdates: 0,
    lastUpdateTime: 0
  }

  private frameHistory: number[] = []
  private maxFrameHistory: number = 60 // Keep last 60 frames for average

  /**
   * Record frame render time
   */
  recordFrame(renderTime: number): void {
    this.frameHistory.push(renderTime)
    
    if (this.frameHistory.length > this.maxFrameHistory) {
      this.frameHistory.shift()
    }

    this.metrics.renderTime = renderTime
    this.metrics.frameRate = this.calculateAverageFrameRate()
    this.metrics.lastUpdateTime = Date.now()
  }

  /**
   * Update shape counts for culling metrics
   */
  updateShapeCounts(total: number, visible: number): void {
    this.metrics.totalShapes = total
    this.metrics.visibleShapes = visible
    this.metrics.culledShapes = total - visible
  }

  /**
   * Record batched update
   */
  recordBatchedUpdate(): void {
    this.metrics.batchedUpdates++
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    return this.metrics.frameRate < 30 || this.metrics.renderTime > 16.67 // 60fps threshold
  }

  /**
   * Get performance warnings
   */
  getPerformanceWarnings(): string[] {
    const warnings: string[] = []

    if (this.metrics.frameRate < 30) {
      warnings.push(`Low frame rate: ${this.metrics.frameRate.toFixed(1)} FPS`)
    }

    if (this.metrics.renderTime > 16.67) {
      warnings.push(`High render time: ${this.metrics.renderTime.toFixed(1)}ms`)
    }

    if (this.metrics.totalShapes > 1000) {
      warnings.push(`High shape count: ${this.metrics.totalShapes} shapes`)
    }

    if (this.metrics.culledShapes / this.metrics.totalShapes < 0.3) {
      warnings.push('Low culling efficiency')
    }

    return warnings
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.frameHistory = []
    this.metrics = {
      frameRate: 0,
      renderTime: 0,
      totalShapes: 0,
      visibleShapes: 0,
      culledShapes: 0,
      batchedUpdates: 0,
      lastUpdateTime: 0
    }
  }

  private calculateAverageFrameRate(): number {
    if (this.frameHistory.length === 0) return 0
    
    const averageRenderTime = this.frameHistory.reduce((sum, time) => sum + time, 0) / this.frameHistory.length
    return averageRenderTime > 0 ? 1000 / averageRenderTime : 0
  }
}

/**
 * Batching system for optimizing multiple updates
 */
export class BatchingSystem {
  private pendingUpdates: Map<string, BatchedUpdate> = new Map()
  private batchTimeout: number = 16 // 16ms batching window
  private frameRequest?: number
  private onFlush?: (updates: BatchedUpdate[]) => void

  constructor(onFlush?: (updates: BatchedUpdate[]) => void) {
    this.onFlush = onFlush
  }

  /**
   * Schedule an update to be batched
   */
  scheduleUpdate(shapeId: string, updates: any): void {
    // Overwrite any existing update for this shape
    this.pendingUpdates.set(shapeId, {
      shapeId,
      updates,
      timestamp: Date.now()
    })

    // Schedule flush if not already scheduled
    if (!this.frameRequest) {
      this.frameRequest = requestAnimationFrame(() => {
        this.flushUpdates()
      })
    }
  }

  /**
   * Immediately flush all pending updates
   */
  flush(): void {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest)
      this.frameRequest = undefined
    }
    this.flushUpdates()
  }

  /**
   * Get pending update count
   */
  getPendingCount(): number {
    return this.pendingUpdates.size
  }

  /**
   * Check if updates are pending
   */
  hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0
  }

  private flushUpdates(): void {
    if (this.pendingUpdates.size === 0) {
      this.frameRequest = undefined
      return
    }

    const updates = Array.from(this.pendingUpdates.values())
    this.pendingUpdates.clear()
    this.frameRequest = undefined

    if (this.onFlush) {
      this.onFlush(updates)
    }
  }

  /**
   * Destroy batching system
   */
  destroy(): void {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest)
    }
    this.pendingUpdates.clear()
  }
}

/**
 * Render optimizer for selective redraw and culling
 */
export class RenderOptimizer {
  private dirtyShapes: Set<string> = new Set()
  private dirtyGroups: Set<string> = new Set()
  private lastViewport?: { x: number; y: number; width: number; height: number; zoom: number }
  private performanceMonitor: PerformanceMonitor

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor
  }

  /**
   * Mark shape as dirty (needs redraw)
   */
  markShapeDirty(shapeId: string): void {
    this.dirtyShapes.add(shapeId)
  }

  /**
   * Mark group as dirty (needs redraw)
   */
  markGroupDirty(groupId: string): void {
    this.dirtyGroups.add(groupId)
  }

  /**
   * Check if full redraw is needed
   */
  shouldRedrawFull(currentViewport: { x: number; y: number; width: number; height: number; zoom: number }): boolean {
    if (!this.lastViewport) {
      this.lastViewport = { ...currentViewport }
      return true
    }

    // Check if viewport changed significantly
    const viewportChanged = 
      Math.abs(currentViewport.x - this.lastViewport.x) > 1 ||
      Math.abs(currentViewport.y - this.lastViewport.y) > 1 ||
      Math.abs(currentViewport.zoom - this.lastViewport.zoom) > 0.01 ||
      currentViewport.width !== this.lastViewport.width ||
      currentViewport.height !== this.lastViewport.height

    if (viewportChanged) {
      this.lastViewport = { ...currentViewport }
      return true
    }

    return false
  }

  /**
   * Get shapes that need redrawing
   */
  getDirtyShapes(): string[] {
    return Array.from(this.dirtyShapes)
  }

  /**
   * Get groups that need redrawing
   */
  getDirtyGroups(): string[] {
    return Array.from(this.dirtyGroups)
  }

  /**
   * Clear all dirty flags
   */
  clearDirtyFlags(): void {
    this.dirtyShapes.clear()
    this.dirtyGroups.clear()
  }

  /**
   * Check if any shapes are dirty
   */
  hasDirtyShapes(): boolean {
    return this.dirtyShapes.size > 0 || this.dirtyGroups.size > 0
  }

  /**
   * Optimize rendering based on performance
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.performanceMonitor.getMetrics()

    if (metrics.frameRate < 30) {
      recommendations.push('Consider reducing shape detail level')
      recommendations.push('Increase culling aggressiveness')
    }

    if (metrics.totalShapes > 1000) {
      recommendations.push('Enable shape clustering')
      recommendations.push('Implement level-of-detail rendering')
    }

    if (this.dirtyShapes.size > 100) {
      recommendations.push('Batch more updates together')
      recommendations.push('Reduce update frequency')
    }

    return recommendations
  }
}

/**
 * Viewport culling utility
 */
export class ViewportCuller {
  private viewport: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 0, height: 0 }
  private cullMargin: number = 50 // Extra margin for smooth scrolling

  /**
   * Update viewport bounds
   */
  setViewport(x: number, y: number, width: number, height: number): void {
    this.viewport = { x, y, width, height }
  }

  /**
   * Test if rectangle intersects viewport
   */
  intersectsViewport(rect: { x: number; y: number; width: number; height: number }): boolean {
    const expandedViewport = {
      x: this.viewport.x - this.cullMargin,
      y: this.viewport.y - this.cullMargin,
      width: this.viewport.width + this.cullMargin * 2,
      height: this.viewport.height + this.cullMargin * 2
    }

    return !(
      rect.x + rect.width < expandedViewport.x ||
      rect.x > expandedViewport.x + expandedViewport.width ||
      rect.y + rect.height < expandedViewport.y ||
      rect.y > expandedViewport.y + expandedViewport.height
    )
  }

  /**
   * Filter shapes to only visible ones
   */
  cullShapes<T extends { x: number; y: number; width: number; height: number }>(shapes: T[]): T[] {
    return shapes.filter(shape => this.intersectsViewport(shape))
  }

  /**
   * Set culling margin
   */
  setCullMargin(margin: number): void {
    this.cullMargin = margin
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor()

// Utility function to create a batching system
export const createBatchingSystem = (onFlush: (updates: BatchedUpdate[]) => void) => {
  return new BatchingSystem(onFlush)
}

// Utility function to create a render optimizer
export const createRenderOptimizer = (performanceMonitor: PerformanceMonitor = globalPerformanceMonitor) => {
  return new RenderOptimizer(performanceMonitor)
} 