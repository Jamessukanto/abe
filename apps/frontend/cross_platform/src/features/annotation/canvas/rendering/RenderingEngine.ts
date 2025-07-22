import type { AnnotationShape, AnnotationGroup, CanvasState } from '../../lib/types'
import { PerformanceMonitor } from '../../engine/PerformanceMonitor'
import { ViewportManager } from '../viewport/ViewportManager'
import { BackgroundRenderer } from './BackgroundRenderer'
import { ShapeRenderer } from './ShapeRenderer'
import { OverlayRenderer } from './OverlayRenderer'
import { RenderingOptimizer } from './RenderingOptimizer'

/**
 * RenderingEngine orchestrates the rendering pipeline using specialized renderers
 * Uses existing PerformanceMonitor from engine for performance tracking
 */
export class RenderingEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private svgOverlay: SVGSVGElement
  
  // Specialized renderers
  private backgroundRenderer: BackgroundRenderer
  private shapeRenderer: ShapeRenderer
  private overlayRenderer: OverlayRenderer
  
  // Core systems
  private viewportManager: ViewportManager
  private performanceMonitor: PerformanceMonitor
  private renderingOptimizer: RenderingOptimizer
  
  // Rendering state
  private frameRequest?: number
  private imageElement?: HTMLImageElement
  private isImageLoaded: boolean = false

  constructor(
    canvas: HTMLCanvasElement, 
    svgOverlay: SVGSVGElement,
    viewportManager: ViewportManager
  ) {
    this.canvas = canvas
    this.svgOverlay = svgOverlay
    this.viewportManager = viewportManager
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context')
    }
    this.ctx = ctx
    
    // Initialize performance monitoring
    this.performanceMonitor = new PerformanceMonitor()
    
    // Initialize specialized renderers
    this.backgroundRenderer = new BackgroundRenderer(ctx, viewportManager)
    this.shapeRenderer = new ShapeRenderer(ctx, viewportManager)
    this.overlayRenderer = new OverlayRenderer(svgOverlay, viewportManager)
  }

  /**
   * Main render method - orchestrates the rendering pipeline
   */
  render(
    shapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState,
    previewShape?: Partial<AnnotationShape>,
    forceFullRedraw: boolean = false
  ): void {
    const startTime = performance.now()
    
    // Cancel any pending render
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest)
    }
    
    this.frameRequest = requestAnimationFrame(() => {
      try {
        // Include preview shape in rendering if active
        const allShapes = previewShape ? [...shapes, previewShape as AnnotationShape] : shapes
        
                 // Update performance stats
         this.performanceMonitor.updateShapeCounts(allShapes.length, this.getVisibleShapes(allShapes, canvasState).length)
        
        if (forceFullRedraw || this.shouldRenderFull(canvasState)) {
          this.renderFull(allShapes, groups, canvasState)
        } else {
          this.renderIncremental(allShapes, groups, canvasState)
        }
        
        // Record performance metrics
        const renderTime = performance.now() - startTime
        this.performanceMonitor.recordFrame(renderTime)
        
        this.frameRequest = undefined
      } catch (error) {
        console.error('Rendering error:', error)
        this.frameRequest = undefined
      }
    })
  }

  /**
   * Load and cache background image
   */
  async loadImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        console.log('Image loaded successfully:', imageUrl, 'dimensions:', img.naturalWidth, 'x', img.naturalHeight)
        this.imageElement = img
        this.isImageLoaded = true
        this.backgroundRenderer.setImage(img)
        resolve()
      }
      
      img.onerror = () => {
        console.error('Failed to load image:', imageUrl)
        reject(new Error(`Failed to load image: ${imageUrl}`))
      }
      
      img.src = imageUrl
    })
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics()
  }

  /**
   * Get performance warnings
   */
  getPerformanceWarnings(): string[] {
    return this.performanceMonitor.getPerformanceWarnings()
  }

  /**
   * Mark shapes as dirty for incremental rendering
   */
  markShapesDirty(shapeIds: string[]): void {
    // For now, just force full redraw
    // In the future, implement proper dirty region tracking
  }

  /**
   * Destroy the rendering engine
   */
  destroy(): void {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest)
    }
    
    this.backgroundRenderer.destroy()
    this.shapeRenderer.destroy()
    this.overlayRenderer.destroy()
    this.performanceMonitor.reset()
  }

  /**
   * Full scene redraw - clears canvas and renders everything
   */
  private renderFull(
    shapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState
  ): void {
    // Clear canvas
    this.clearCanvas()
    
    // Apply viewport transformation
    this.viewportManager.applyTransform(this.ctx, canvasState)
    
    // Render background image
    this.backgroundRenderer.render(canvasState)
    
    // Cull off-screen shapes for performance
    const visibleShapes = this.getVisibleShapes(shapes, canvasState)
    
    // Render groups (if needed)
    if (groups.length > 0) {
      this.renderGroups(groups, canvasState)
    }
    
    // Render shapes
    this.shapeRenderer.renderShapes(visibleShapes, canvasState)
    
    // Render selection handles and guides on SVG overlay
    this.overlayRenderer.render(visibleShapes, groups, canvasState)
  }

  /**
   * Incremental redraw - only render changed regions
   */
  private renderIncremental(
    shapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState
  ): void {
    // For now, just do full redraw
    // In the future, implement proper incremental rendering
    this.renderFull(shapes, groups, canvasState)
  }

  /**
   * Get shapes visible in current viewport
   */
  private getVisibleShapes(shapes: AnnotationShape[], canvasState: CanvasState): AnnotationShape[] {
    return shapes.filter(shape => {
      if (!shape.isVisible) return false
      
      // Get shape bounds and check viewport intersection
      const bounds = this.shapeRenderer.getShapeBounds(shape)
      return this.viewportManager.intersectsViewport(bounds, canvasState)
    })
  }

  /**
   * Render group backgrounds (translucent highlights)
   */
  private renderGroups(groups: AnnotationGroup[], canvasState: CanvasState): void {
    groups.forEach(group => {
      if (!group.isVisible) return
      
      // For now, skip group rendering
      // In the future, implement group background rendering
    })
  }

  /**
   * Clear the entire canvas
   */
  private clearCanvas(): void {
    const { width, height } = this.viewportManager.getCanvasDimensions()
    this.ctx.clearRect(0, 0, width, height)
  }

  /**
   * Determine if a full redraw is needed
   */
  private shouldRenderFull(canvasState: CanvasState): boolean {
    // For now, always do full redraw for simplicity
    // In the future, check if camera transform changed significantly
    return true
  }
} 