import type { CanvasState } from '../../lib/types'
import { ViewportManager } from '../viewport/ViewportManager'

/**
 * BackgroundRenderer handles rendering of background images
 * Extracted from AnnotationRenderer for single responsibility
 */
export class BackgroundRenderer {
  private ctx: CanvasRenderingContext2D
  private viewportManager: ViewportManager
  private imageElement?: HTMLImageElement

  constructor(ctx: CanvasRenderingContext2D, viewportManager: ViewportManager) {
    this.ctx = ctx
    this.viewportManager = viewportManager
  }

  /**
   * Set the background image
   */
  setImage(image: HTMLImageElement): void {
    this.imageElement = image
  }

  /**
   * Render the background image
   */
  render(canvasState: CanvasState): void {
    if (!this.imageElement) {
      console.log('Background not rendered - no image loaded')
      return
    }

    console.log('Rendering background image:', canvasState.imageSize)
    
    // Save context state
    this.ctx.save()
    
    // Reset alpha for background
    this.ctx.globalAlpha = 1.0
    
    // Calculate image transformation
    const canvasDims = this.viewportManager.getCanvasDimensions()
    const canvasWidth = canvasDims.width / canvasDims.devicePixelRatio
    const canvasHeight = canvasDims.height / canvasDims.devicePixelRatio
    const imageWidth = canvasState.imageSize.width
    const imageHeight = canvasState.imageSize.height
    
    // Calculate scale to fit image while maintaining aspect ratio
    const scaleX = canvasWidth / imageWidth
    const scaleY = canvasHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    
    // Center the image
    const x = (canvasWidth - scaledWidth) / 2
    const y = (canvasHeight - scaledHeight) / 2
    
    // Draw the image
    this.ctx.drawImage(
      this.imageElement,
      x,
      y,
      scaledWidth,
      scaledHeight
    )
    
    // Restore context state
    this.ctx.restore()
  }

  /**
   * Get image bounds in world coordinates
   */
  getImageBounds(canvasState: CanvasState): { x: number; y: number; width: number; height: number } | null {
    if (!this.imageElement) return null

    const canvasDims = this.viewportManager.getCanvasDimensions()
    const canvasWidth = canvasDims.width / canvasDims.devicePixelRatio
    const canvasHeight = canvasDims.height / canvasDims.devicePixelRatio
    const imageWidth = canvasState.imageSize.width
    const imageHeight = canvasState.imageSize.height
    
    const scaleX = canvasWidth / imageWidth
    const scaleY = canvasHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    
    const x = (canvasWidth - scaledWidth) / 2
    const y = (canvasHeight - scaledHeight) / 2
    
    return { x, y, width: scaledWidth, height: scaledHeight }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.imageElement = undefined
  }
} 