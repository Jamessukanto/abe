import type { AnnotationShape, AnnotationGroup, CanvasState } from '../../lib/types'
import { BatchingSystem, PerformanceMonitor, ViewportCuller } from '../../engine/PerformanceMonitor'
import { ViewportManager } from '../viewport/ViewportManager'

/**
 * RenderingOptimizer implements Phase 4 performance optimizations
 * - Proper batching system integration
 * - Rendering pipeline optimization  
 * - Memory management and cleanup
 */
export class RenderingOptimizer {
  private batchingSystem: BatchingSystem
  private performanceMonitor: PerformanceMonitor
  private viewportCuller: ViewportCuller
  private viewportManager: ViewportManager

  // Optimization settings
  private readonly maxBatchSize: number = 50
  private readonly batchTimeout: number = 16 // 16ms for 60fps
  private readonly cullingMargin: number = 100 // pixels
  
  // State tracking
  private pendingUpdates: Map<string, any> = new Map()
  private lastRenderTime: number = 0
  private renderQueue: Array<() => void> = []
  private isProcessingQueue: boolean = false

  constructor(
    viewportManager: ViewportManager,
    performanceMonitor?: PerformanceMonitor
  ) {
    this.viewportManager = viewportManager
    this.performanceMonitor = performanceMonitor || new PerformanceMonitor()
    this.viewportCuller = new ViewportCuller()
    
    // Initialize batching system with proper flush handler
    this.batchingSystem = new BatchingSystem(this.handleBatchFlush.bind(this))
    
    this.setupPerformanceTracking()
  }

  /**
   * Optimize shape rendering with batching and culling
   */
  optimizeShapeRendering(
    shapes: AnnotationShape[],
    groups: AnnotationGroup[],
    canvasState: CanvasState,
    forceFullRedraw: boolean = false
  ): {
    visibleShapes: AnnotationShape[]
    culledCount: number
    shouldBatch: boolean
    renderStrategy: 'full' | 'incremental' | 'skip'
  } {
    const startTime = performance.now()
    
    // Update viewport culler
    const viewport = this.viewportManager.getViewportBounds(canvasState)
    this.viewportCuller.setViewport(viewport.x, viewport.y, viewport.width, viewport.height)
    this.viewportCuller.setCullMargin(this.cullingMargin)
    
    // Cull off-screen shapes for performance
    const visibleShapes = this.cullShapes(shapes, canvasState)
    const culledCount = shapes.length - visibleShapes.length
    
    // Update performance metrics
    this.performanceMonitor.updateShapeCounts(shapes.length, visibleShapes.length)
    
    // Determine rendering strategy
    const renderStrategy = this.determineRenderStrategy(
      visibleShapes.length, 
      forceFullRedraw,
      this.performanceMonitor.getMetrics()
    )
    
    // Check if we should batch updates
    const shouldBatch = this.shouldBatchUpdates(visibleShapes.length, renderStrategy)
    
    // Record optimization time
    const optimizationTime = performance.now() - startTime
    this.performanceMonitor.recordFrame(optimizationTime)
    
    return {
      visibleShapes,
      culledCount,
      shouldBatch,
      renderStrategy
    }
  }

  /**
   * Schedule a rendering update with batching
   */
  scheduleUpdate(updateId: string, updateFn: () => void): void {
    if (this.shouldBatchUpdates(1, 'incremental')) {
      this.batchingSystem.scheduleUpdate(updateId, updateFn)
    } else {
      // Execute immediately for critical updates
      this.executeUpdate(updateFn)
    }
  }

  /**
   * Force immediate execution of all pending updates
   */
  flushUpdates(): void {
    this.batchingSystem.flush()
    this.processPendingQueue()
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const metrics = this.performanceMonitor.getMetrics()
    const recommendations: string[] = []
    
    if (metrics.frameRate < 30) {
      recommendations.push('Consider reducing shape detail or increasing culling margin')
    }
    
    if (metrics.totalShapes > 1000) {
      recommendations.push('Enable shape clustering for large datasets')
    }
    
    if (metrics.renderTime > 16.67) {
      recommendations.push('Optimize rendering pipeline - use incremental updates')
    }
    
    if (this.batchingSystem.getPendingCount() > this.maxBatchSize) {
      recommendations.push('Increase batching frequency or reduce update rate')
    }
    
    return recommendations
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(): {
    performance: any
    batching: { pendingCount: number, hasPending: boolean }
    viewport: { cullingMargin: number }
  } {
    return {
      performance: this.performanceMonitor.getMetrics(),
      batching: {
        pendingCount: this.batchingSystem.getPendingCount(),
        hasPending: this.batchingSystem.hasPendingUpdates()
      },
      viewport: {
        cullingMargin: this.cullingMargin
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.batchingSystem.destroy()
    this.performanceMonitor.reset()
    this.pendingUpdates.clear()
    this.renderQueue = []
  }

  /**
   * Cull shapes that are outside the viewport
   */
  private cullShapes(shapes: AnnotationShape[], canvasState: CanvasState): AnnotationShape[] {
    return shapes.filter(shape => {
      if (!shape.isVisible) return false
      
      // Get shape bounds
      const bounds = this.getShapeBounds(shape)
      
      // Check viewport intersection with margin
      return this.viewportManager.intersectsViewport(bounds, canvasState, this.cullingMargin)
    })
  }

  /**
   * Determine the best rendering strategy based on conditions
   */
  private determineRenderStrategy(
    visibleShapeCount: number,
    forceFullRedraw: boolean,
    metrics: any
  ): 'full' | 'incremental' | 'skip' {
    if (forceFullRedraw) return 'full'
    
    // Skip rendering if performance is poor
    if (metrics.frameRate < 15 && visibleShapeCount > 500) {
      return 'skip'
    }
    
    // Use incremental for small changes
    if (visibleShapeCount < 100 || this.pendingUpdates.size < 10) {
      return 'incremental'
    }
    
    // Default to full redraw for large changes
    return 'full'
  }

  /**
   * Check if updates should be batched
   */
  private shouldBatchUpdates(shapeCount: number, strategy: string): boolean {
    // Always batch for incremental updates with many shapes
    if (strategy === 'incremental' && shapeCount > 50) {
      return true
    }
    
    // Batch if performance is poor
    const metrics = this.performanceMonitor.getMetrics()
    if (metrics.frameRate < 30) {
      return true
    }
    
    return false
  }

  /**
   * Execute an update immediately
   */
  private executeUpdate(updateFn: () => void): void {
    try {
      updateFn()
    } catch (error) {
      console.error('Render update failed:', error)
    }
  }

  /**
   * Handle batched update flush
   */
  private handleBatchFlush(updates: any[]): void {
    if (updates.length === 0) return
    
    const batchStartTime = performance.now()
    
    try {
      // Execute all batched updates
      updates.forEach(update => {
        if (typeof update.updates === 'function') {
          update.updates()
        }
      })
      
      // Record batch performance
      this.performanceMonitor.recordBatchedUpdate()
      
    } catch (error) {
      console.error('Batch flush failed:', error)
    }
    
    const batchTime = performance.now() - batchStartTime
    console.log(`Batch processed ${updates.length} updates in ${batchTime.toFixed(2)}ms`)
  }

  /**
   * Process pending render queue
   */
  private processPendingQueue(): void {
    if (this.isProcessingQueue || this.renderQueue.length === 0) return
    
    this.isProcessingQueue = true
    
    requestAnimationFrame(() => {
      try {
        while (this.renderQueue.length > 0) {
          const updateFn = this.renderQueue.shift()
          if (updateFn) {
            updateFn()
          }
        }
      } finally {
        this.isProcessingQueue = false
      }
    })
  }

  /**
   * Setup performance tracking and warnings
   */
  private setupPerformanceTracking(): void {
    // Monitor performance and emit warnings
    setInterval(() => {
      const warnings = this.performanceMonitor.getPerformanceWarnings()
      if (warnings.length > 0) {
        console.warn('Performance warnings:', warnings)
      }
    }, 5000) // Check every 5 seconds
  }

  /**
   * Get shape bounds for culling calculations
   */
  private getShapeBounds(shape: AnnotationShape): { x: number; y: number; width: number; height: number } {
    // Simplified bounds calculation - in practice, use GeometryUtils
    switch (shape.type) {
      case 'rectangle':
        if (shape.coordinates.length < 2) return { x: 0, y: 0, width: 0, height: 0 }
        const [x1, y1] = shape.coordinates[0]
        const [x2, y2] = shape.coordinates[1]
        return {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1)
        }
      
      case 'polygon':
        if (shape.coordinates.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        shape.coordinates.forEach(([x, y]) => {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        })
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
      
      case 'point':
        if (shape.coordinates.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
        const [px, py] = shape.coordinates[0]
        const radius = 6
        return { x: px - radius, y: py - radius, width: radius * 2, height: radius * 2 }
      
      default:
        return { x: 0, y: 0, width: 0, height: 0 }
    }
  }
} 