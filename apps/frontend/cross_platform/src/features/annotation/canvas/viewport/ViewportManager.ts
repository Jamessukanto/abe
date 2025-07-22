import type { Point, Rectangle, CanvasState } from '../../lib/types'

/**
 * ViewportManager handles coordinate transformations, pan/zoom, and viewport calculations
 * Extracted from AnnotationRenderer to follow single responsibility principle
 */
export class ViewportManager {
  private canvas: HTMLCanvasElement
  private devicePixelRatio: number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.devicePixelRatio = window.devicePixelRatio || 1
    this.setupHighDPI()
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenPoint: Point, canvasState: CanvasState): Point {
    const rect = this.canvas.getBoundingClientRect()
    
    // Convert to canvas coordinates
    const canvasX = (screenPoint.x - rect.left) * this.devicePixelRatio
    const canvasY = (screenPoint.y - rect.top) * this.devicePixelRatio
    
    // Apply inverse transformation to get world coordinates
    const worldX = (canvasX - canvasState.pan.x) / canvasState.zoom
    const worldY = (canvasY - canvasState.pan.y) / canvasState.zoom
    
    return { x: worldX, y: worldY }
  }

  /**
   * Convert world coordinates to screen coordinates  
   */
  worldToScreen(worldPoint: Point, canvasState: CanvasState): Point {
    const screenX = worldPoint.x * canvasState.zoom + canvasState.pan.x
    const screenY = worldPoint.y * canvasState.zoom + canvasState.pan.y
    
    return { x: screenX, y: screenY }
  }

  /**
   * Convert world coordinates to image coordinates
   * Accounts for image scaling and centering
   */
  worldToImage(worldPoint: Point, canvasState: CanvasState): Point {
    const imageTransform = this.getImageTransform(canvasState)
    
    const imageX = (worldPoint.x - imageTransform.offsetX) / imageTransform.scale
    const imageY = (worldPoint.y - imageTransform.offsetY) / imageTransform.scale
    
    return { x: imageX, y: imageY }
  }

  /**
   * Convert image coordinates to world coordinates
   */
  imageToWorld(imagePoint: Point, canvasState: CanvasState): Point {
    const imageTransform = this.getImageTransform(canvasState)
    
    const worldX = imagePoint.x * imageTransform.scale + imageTransform.offsetX
    const worldY = imagePoint.y * imageTransform.scale + imageTransform.offsetY
    
    return { x: worldX, y: worldY }
  }

  /**
   * Get viewport bounds in world coordinates
   */
  getViewportBounds(canvasState: CanvasState): Rectangle {
    const topLeft = this.screenToWorld({ x: 0, y: 0 }, canvasState)
    const bottomRight = this.screenToWorld(
      { x: this.canvas.width / this.devicePixelRatio, y: this.canvas.height / this.devicePixelRatio }, 
      canvasState
    )
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    }
  }

  /**
   * Check if a rectangle intersects with the viewport
   */
  intersectsViewport(rect: Rectangle, canvasState: CanvasState, margin: number = 50): boolean {
    const viewport = this.getViewportBounds(canvasState)
    
    // Expand viewport by margin
    const expandedViewport = {
      x: viewport.x - margin,
      y: viewport.y - margin,
      width: viewport.width + margin * 2,
      height: viewport.height + margin * 2
    }
    
    return !(
      rect.x + rect.width < expandedViewport.x ||
      rect.x > expandedViewport.x + expandedViewport.width ||
      rect.y + rect.height < expandedViewport.y ||
      rect.y > expandedViewport.y + expandedViewport.height
    )
  }

  /**
   * Apply canvas transformation matrix for rendering
   */
  applyTransform(ctx: CanvasRenderingContext2D, canvasState: CanvasState): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
    ctx.translate(canvasState.pan.x, canvasState.pan.y)
    ctx.scale(canvasState.zoom, canvasState.zoom)
  }

  /**
   * Get image transformation parameters for centering and scaling
   */
  private getImageTransform(canvasState: CanvasState): {
    scale: number
    offsetX: number
    offsetY: number
    scaledWidth: number
    scaledHeight: number
  } {
    const canvasWidth = this.canvas.width / this.devicePixelRatio
    const canvasHeight = this.canvas.height / this.devicePixelRatio
    const imageWidth = canvasState.imageSize.width
    const imageHeight = canvasState.imageSize.height
    
    // Calculate scale to fit image while maintaining aspect ratio
    const scaleX = canvasWidth / imageWidth
    const scaleY = canvasHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    
    // Center the image
    const offsetX = (canvasWidth - scaledWidth) / 2
    const offsetY = (canvasHeight - scaledHeight) / 2
    
    return {
      scale,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    }
  }

  /**
   * Setup high DPI rendering
   */
  private setupHighDPI(): void {
    const rect = this.canvas.getBoundingClientRect()
    
    this.canvas.width = rect.width * this.devicePixelRatio
    this.canvas.height = rect.height * this.devicePixelRatio
    
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
  }

  /**
   * Update device pixel ratio and re-setup canvas if needed
   */
  updateDevicePixelRatio(): void {
    const newRatio = window.devicePixelRatio || 1
    if (newRatio !== this.devicePixelRatio) {
      this.devicePixelRatio = newRatio
      this.setupHighDPI()
    }
  }

  /**
   * Get canvas dimensions
   */
  getCanvasDimensions(): { width: number; height: number; devicePixelRatio: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
      devicePixelRatio: this.devicePixelRatio
    }
  }
} 