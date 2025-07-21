import type {
  AnnotationShape,
  AnnotationGroup,
  CanvasState,
  Point,
  Rectangle
} from '../lib/types'

/**
 * High-performance hybrid Canvas/SVG renderer for annotations
 * Optimized for 1000+ shapes with selective redraw and culling
 */
export class AnnotationRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private svgOverlay: SVGSVGElement
  
  // Performance tracking
  private dirtyRegions: Set<string> = new Set()
  private viewportBounds: Rectangle = { x: 0, y: 0, width: 0, height: 0 }
  private lastRenderTime: number = 0
  private frameRequest?: number
  
  // Rendering state
  private imageElement?: HTMLImageElement
  private isImageLoaded: boolean = false
  
  // Performance metrics
  private renderStats = {
    totalShapes: 0,
    visibleShapes: 0,
    culledShapes: 0,
    renderTime: 0,
    lastFrameRate: 0
  }

  constructor(canvas: HTMLCanvasElement, svgOverlay: SVGSVGElement) {
    this.canvas = canvas
    this.svgOverlay = svgOverlay
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context')
    }
    this.ctx = ctx
    
    // Set up high DPI rendering
    this.setupHighDPI()
  }

  /**
   * Main render method - entry point for all rendering
   */
  render(
    shapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState,
    previewShape?: Partial<AnnotationShape>,
    forceFullRedraw: boolean = false
  ): void {
    console.log('AnnotationRenderer.render called:', { 
      shapesCount: shapes.length, 
      groupsCount: groups.length,
      canvasState,
      hasPreview: !!previewShape
    })
    
    const startTime = performance.now()
    
    // Cancel any pending render
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest)
    }
    
    this.frameRequest = requestAnimationFrame(() => {
      this.updateViewportBounds(canvasState)
      
      // Include preview shape in rendering if active
      const allShapes = previewShape ? [...shapes, previewShape as AnnotationShape] : shapes
      
      if (forceFullRedraw || this.shouldRenderFull(canvasState)) {
        console.log('Doing full render')
        this.renderFull(allShapes, groups, canvasState)
      } else if (this.dirtyRegions.size > 0 || previewShape) {
        console.log('Doing incremental render')
        this.renderIncremental(allShapes, groups, canvasState)
      }
      
      this.updateRenderStats(startTime, allShapes.length)
      this.frameRequest = undefined
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
   * Full scene redraw - used for camera transforms and major changes
   */
  private renderFull(
    shapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState
  ): void {
    console.log('renderFull called')
    
    // Clear entire canvas
    this.clearCanvas()
    
    // Set up transformation matrix
    this.setupTransform(canvasState)
    
    // Render background image
    this.renderBackground(canvasState)
    
    // Cull off-screen shapes for performance
    const visibleShapes = this.cullOffscreenShapes(shapes)
    
    // Render groups (background layers)
    this.renderGroups(groups, canvasState)
    
    // Render shapes on canvas
    this.renderShapes(visibleShapes, canvasState)
    
    // Render selection handles and guides on SVG overlay
    this.renderSVGOverlay(visibleShapes, groups, canvasState)
    
    // Clear dirty regions after full redraw
    this.dirtyRegions.clear()
  }

  /**
   * Incremental redraw - only render changed regions
   */
  private renderIncremental(
    shapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState
  ): void {
    this.setupTransform(canvasState)
    
    // Get only shapes that need redrawing
    const dirtyShapes = shapes.filter(shape => 
      this.dirtyRegions.has(shape.id) || this.dirtyRegions.has(shape.groupId || '')
    )
    
    // Render only dirty regions
    dirtyShapes.forEach(shape => {
      this.clearShapeRegion(shape, canvasState)
      this.renderShape(shape, canvasState)
    })
    
    // Update SVG overlay for changed selections
    this.updateSVGOverlay(dirtyShapes, groups, canvasState)
    
    this.dirtyRegions.clear()
  }

  /**
   * Performance culling - remove off-screen shapes
   */
  private cullOffscreenShapes(shapes: AnnotationShape[]): AnnotationShape[] {
    const culled = shapes.filter(shape => this.intersectsViewport(shape))
    
    this.renderStats.visibleShapes = culled.length
    this.renderStats.culledShapes = shapes.length - culled.length
    
    return culled
  }

  /**
   * Check if shape intersects current viewport
   */
  private intersectsViewport(shape: AnnotationShape): boolean {
    const bounds = this.getShapeBounds(shape)
    
    return !(
      bounds.x + bounds.width < this.viewportBounds.x ||
      bounds.x > this.viewportBounds.x + this.viewportBounds.width ||
      bounds.y + bounds.height < this.viewportBounds.y ||
      bounds.y > this.viewportBounds.y + this.viewportBounds.height
    )
  }

  /**
   * Get bounding box for a shape
   */
  private getShapeBounds(shape: AnnotationShape): Rectangle {
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
   * Setup canvas transformation matrix
   */
  private setupTransform(canvasState: CanvasState): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
    this.ctx.translate(canvasState.pan.x, canvasState.pan.y)
    this.ctx.scale(canvasState.zoom, canvasState.zoom)
  }

  /**
   * Render background image
   */
  private renderBackground(canvasState: CanvasState): void {
    if (!this.imageElement || !this.isImageLoaded) {
      console.log('Background not rendered - image not loaded:', { 
        hasImage: !!this.imageElement, 
        isLoaded: this.isImageLoaded,
        imageSize: canvasState.imageSize 
      })
      return
    }
    
    console.log('Rendering background image:', canvasState.imageSize)
    this.ctx.globalAlpha = 1.0
    
    // Calculate scale to fit image in canvas while maintaining aspect ratio
    const canvasWidth = this.canvas.width
    const canvasHeight = this.canvas.height
    const imageWidth = canvasState.imageSize.width
    const imageHeight = canvasState.imageSize.height
    
    const scaleX = canvasWidth / imageWidth
    const scaleY = canvasHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    
    // Center the image
    const x = (canvasWidth - scaledWidth) / 2
    const y = (canvasHeight - scaledHeight) / 2
    
    this.ctx.drawImage(
      this.imageElement,
      x,
      y,
      scaledWidth,
      scaledHeight
    )
  }

  /**
   * Render annotation groups (translucent backgrounds)
   */
  private renderGroups(groups: AnnotationGroup[], canvasState: CanvasState): void {
    Object.values(groups).forEach(group => {
      if (!group.isVisible) return
      
      // Render translucent group boundary
      this.ctx.globalAlpha = 0.1
      this.ctx.fillStyle = group.color
      
      // Calculate group bounds from child shapes
      const groupBounds = this.calculateGroupBounds(group)
      if (groupBounds) {
        this.ctx.fillRect(
          groupBounds.x - 5,
          groupBounds.y - 5,
          groupBounds.width + 10,
          groupBounds.height + 10
        )
      }
    })
  }

  /**
   * Render all shapes on canvas
   */
  private renderShapes(shapes: AnnotationShape[], canvasState: CanvasState): void {
    shapes.forEach(shape => {
      if (shape.isVisible) {
        this.renderShape(shape, canvasState)
      }
    })
  }

  /**
   * Render individual shape
   */
  private renderShape(shape: AnnotationShape, canvasState: CanvasState): void {
    this.ctx.globalAlpha = shape.isSelected ? 0.8 : 0.6
    this.ctx.strokeStyle = shape.isSelected ? '#3b82f6' : '#64748b'
    this.ctx.lineWidth = shape.isSelected ? 3 : 2
    this.ctx.fillStyle = shape.isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.05)'
    
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
    }
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
   * Render SVG overlay for selection handles and guides
   */
  private renderSVGOverlay(
    shapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState
  ): void {
    // Clear existing SVG elements
    this.svgOverlay.innerHTML = ''
    
    // Render selection handles for selected shapes
    const selectedShapes = shapes.filter(shape => shape.isSelected)
    selectedShapes.forEach(shape => {
      this.renderSelectionHandles(shape, canvasState)
    })
  }

  /**
   * Update SVG overlay incrementally
   */
  private updateSVGOverlay(
    dirtyShapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState
  ): void {
    // Remove SVG elements for dirty shapes
    dirtyShapes.forEach(shape => {
      const existingElement = this.svgOverlay.querySelector(`[data-shape-id="${shape.id}"]`)
      if (existingElement) {
        existingElement.remove()
      }
    })
    
    // Re-render selection handles for selected dirty shapes
    const selectedDirtyShapes = dirtyShapes.filter(shape => shape.isSelected)
    selectedDirtyShapes.forEach(shape => {
      this.renderSelectionHandles(shape, canvasState)
    })
  }

  /**
   * Render selection handles on SVG overlay
   */
  private renderSelectionHandles(shape: AnnotationShape, canvasState: CanvasState): void {
    const bounds = this.getShapeBounds(shape)
    
    // Transform bounds to screen coordinates
    const screenBounds = {
      x: bounds.x * canvasState.zoom + canvasState.pan.x,
      y: bounds.y * canvasState.zoom + canvasState.pan.y,
      width: bounds.width * canvasState.zoom,
      height: bounds.height * canvasState.zoom
    }
    
    // Create SVG group for this shape's handles
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('data-shape-id', shape.id)
    
    // Render corner handles
    const handleSize = 8
    const positions = [
      { x: screenBounds.x - handleSize/2, y: screenBounds.y - handleSize/2 }, // Top-left
      { x: screenBounds.x + screenBounds.width - handleSize/2, y: screenBounds.y - handleSize/2 }, // Top-right
      { x: screenBounds.x + screenBounds.width - handleSize/2, y: screenBounds.y + screenBounds.height - handleSize/2 }, // Bottom-right
      { x: screenBounds.x - handleSize/2, y: screenBounds.y + screenBounds.height - handleSize/2 } // Bottom-left
    ]
    
    positions.forEach(pos => {
      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      handle.setAttribute('x', pos.x.toString())
      handle.setAttribute('y', pos.y.toString())
      handle.setAttribute('width', handleSize.toString())
      handle.setAttribute('height', handleSize.toString())
      handle.setAttribute('fill', '#3b82f6')
      handle.setAttribute('stroke', '#ffffff')
      handle.setAttribute('stroke-width', '2')
      handle.setAttribute('cursor', 'pointer')
      
      group.appendChild(handle)
    })
    
    this.svgOverlay.appendChild(group)
  }

  /**
   * Utility methods
   */
  private clearCanvas(): void {
    console.log('Clearing canvas:', this.canvas.width, 'x', this.canvas.height)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private clearShapeRegion(shape: AnnotationShape, canvasState: CanvasState): void {
    const bounds = this.getShapeBounds(shape)
    const padding = 10 // Clear a bit extra to handle stroke width
    
    this.ctx.clearRect(
      bounds.x - padding,
      bounds.y - padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2
    )
  }

  private setupHighDPI(): void {
    const devicePixelRatio = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    
    this.canvas.width = rect.width * devicePixelRatio
    this.canvas.height = rect.height * devicePixelRatio
    
    this.ctx.scale(devicePixelRatio, devicePixelRatio)
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
  }

  private updateViewportBounds(canvasState: CanvasState): void {
    this.viewportBounds = {
      x: -canvasState.pan.x / canvasState.zoom,
      y: -canvasState.pan.y / canvasState.zoom,
      width: this.canvas.width / canvasState.zoom,
      height: this.canvas.height / canvasState.zoom
    }
  }

  private shouldRenderFull(canvasState: CanvasState): boolean {
    // Always do full render for now since we're not tracking camera changes properly
    // In the future, this would check if camera transform changed significantly
    return true
  }

  private calculateGroupBounds(group: AnnotationGroup): Rectangle | null {
    // This would calculate bounds from child shapes
    // For now, return null - will be implemented when we have shape access
    return null
  }

  private updateRenderStats(startTime: number, totalShapes: number): void {
    const renderTime = performance.now() - startTime
    
    this.renderStats = {
      totalShapes,
      visibleShapes: this.renderStats.visibleShapes,
      culledShapes: this.renderStats.culledShapes,
      renderTime,
      lastFrameRate: 1000 / renderTime
    }
  }

  /**
   * Public API for performance monitoring
   */
  public getRenderStats() {
    return { ...this.renderStats }
  }

  public markDirty(shapeId: string): void {
    this.dirtyRegions.add(shapeId)
  }

  public markClean(): void {
    this.dirtyRegions.clear()
  }

  public destroy(): void {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest)
    }
    this.svgOverlay.innerHTML = ''
  }
} 