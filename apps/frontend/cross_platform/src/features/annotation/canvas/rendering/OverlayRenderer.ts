import type { AnnotationShape, AnnotationGroup, CanvasState } from '../../lib/types'
import { ViewportManager } from '../viewport/ViewportManager'

/**
 * OverlayRenderer handles SVG overlay elements like selection handles and guides
 * Extracted from AnnotationRenderer for single responsibility
 */
export class OverlayRenderer {
  private svgOverlay: SVGSVGElement
  private viewportManager: ViewportManager

  constructor(svgOverlay: SVGSVGElement, viewportManager: ViewportManager) {
    this.svgOverlay = svgOverlay
    this.viewportManager = viewportManager
  }

  /**
   * Render SVG overlay elements
   */
  render(
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
    
    // Render group indicators if needed
    const visibleGroups = groups.filter(group => group.isVisible)
    visibleGroups.forEach(group => {
      this.renderGroupIndicator(group, shapes, canvasState)
    })
  }

  /**
   * Update overlay incrementally for changed shapes
   */
  updateIncremental(
    changedShapes: AnnotationShape[], 
    groups: AnnotationGroup[], 
    canvasState: CanvasState
  ): void {
    // Remove SVG elements for changed shapes
    changedShapes.forEach(shape => {
      const existingElement = this.svgOverlay.querySelector(`[data-shape-id="${shape.id}"]`)
      if (existingElement) {
        existingElement.remove()
      }
    })
    
    // Re-render selection handles for selected changed shapes
    const selectedChangedShapes = changedShapes.filter(shape => shape.isSelected)
    selectedChangedShapes.forEach(shape => {
      this.renderSelectionHandles(shape, canvasState)
    })
  }

  /**
   * Clear all overlay elements
   */
  clear(): void {
    this.svgOverlay.innerHTML = ''
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clear()
  }

  /**
   * Render selection handles for a shape
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
    group.setAttribute('class', 'selection-handles')
    
    // Render corner handles
    const handleSize = 8
    const positions = [
      { x: screenBounds.x - handleSize/2, y: screenBounds.y - handleSize/2 }, // Top-left
      { x: screenBounds.x + screenBounds.width - handleSize/2, y: screenBounds.y - handleSize/2 }, // Top-right
      { x: screenBounds.x + screenBounds.width - handleSize/2, y: screenBounds.y + screenBounds.height - handleSize/2 }, // Bottom-right
      { x: screenBounds.x - handleSize/2, y: screenBounds.y + screenBounds.height - handleSize/2 } // Bottom-left
    ]
    
    positions.forEach((pos, index) => {
      const handle = this.createSelectionHandle(pos.x, pos.y, handleSize, `handle-${index}`)
      group.appendChild(handle)
    })
    
    // Add outline/border around shape
    const outline = this.createShapeOutline(screenBounds, shape.type)
    if (outline) {
      group.appendChild(outline)
    }
    
    this.svgOverlay.appendChild(group)
  }

  /**
   * Create a selection handle element
   */
  private createSelectionHandle(x: number, y: number, size: number, className: string): SVGElement {
    const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    handle.setAttribute('x', x.toString())
    handle.setAttribute('y', y.toString())
    handle.setAttribute('width', size.toString())
    handle.setAttribute('height', size.toString())
    handle.setAttribute('fill', '#3b82f6')
    handle.setAttribute('stroke', '#ffffff')
    handle.setAttribute('stroke-width', '2')
    handle.setAttribute('cursor', 'pointer')
    handle.setAttribute('class', className)
    
    return handle
  }

  /**
   * Create shape outline for selection
   */
  private createShapeOutline(bounds: { x: number; y: number; width: number; height: number }, shapeType: string): SVGElement | null {
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    outline.setAttribute('x', bounds.x.toString())
    outline.setAttribute('y', bounds.y.toString())
    outline.setAttribute('width', bounds.width.toString())
    outline.setAttribute('height', bounds.height.toString())
    outline.setAttribute('fill', 'none')
    outline.setAttribute('stroke', '#3b82f6')
    outline.setAttribute('stroke-width', '2')
    outline.setAttribute('stroke-dasharray', '5,5')
    outline.setAttribute('class', 'shape-outline')
    
    return outline
  }

  /**
   * Render group indicator
   */
  private renderGroupIndicator(
    group: AnnotationGroup, 
    shapes: AnnotationShape[], 
    canvasState: CanvasState
  ): void {
    // Get shapes in this group
    const groupShapes = shapes.filter(shape => shape.groupId === group.id)
    if (groupShapes.length === 0) return
    
    // Calculate group bounds
    const groupBounds = this.calculateGroupBounds(groupShapes)
    if (!groupBounds) return
    
    // Transform to screen coordinates
    const screenBounds = {
      x: groupBounds.x * canvasState.zoom + canvasState.pan.x,
      y: groupBounds.y * canvasState.zoom + canvasState.pan.y,
      width: groupBounds.width * canvasState.zoom,
      height: groupBounds.height * canvasState.zoom
    }
    
    // Create group indicator
    const groupIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    groupIndicator.setAttribute('x', (screenBounds.x - 5).toString())
    groupIndicator.setAttribute('y', (screenBounds.y - 5).toString())
    groupIndicator.setAttribute('width', (screenBounds.width + 10).toString())
    groupIndicator.setAttribute('height', (screenBounds.height + 10).toString())
    groupIndicator.setAttribute('fill', 'none')
    groupIndicator.setAttribute('stroke', group.color)
    groupIndicator.setAttribute('stroke-width', '1')
    groupIndicator.setAttribute('stroke-dasharray', '3,3')
    groupIndicator.setAttribute('opacity', '0.5')
    groupIndicator.setAttribute('data-group-id', group.id)
    groupIndicator.setAttribute('class', 'group-indicator')
    
    this.svgOverlay.appendChild(groupIndicator)
  }

  /**
   * Get shape bounds for overlay rendering
   */
  private getShapeBounds(shape: AnnotationShape): { x: number; y: number; width: number; height: number } {
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
        
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        }
        
      case 'point':
        if (shape.coordinates.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
        
        const [px, py] = shape.coordinates[0]
        const radius = shape.isSelected ? 8 : 6
        
        return {
          x: px - radius,
          y: py - radius,
          width: radius * 2,
          height: radius * 2
        }
        
      default:
        return { x: 0, y: 0, width: 0, height: 0 }
    }
  }

  /**
   * Calculate bounds that encompass all shapes in a group
   */
  private calculateGroupBounds(shapes: AnnotationShape[]): { x: number; y: number; width: number; height: number } | null {
    if (shapes.length === 0) return null
    
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    
    shapes.forEach(shape => {
      const bounds = this.getShapeBounds(shape)
      minX = Math.min(minX, bounds.x)
      minY = Math.min(minY, bounds.y)
      maxX = Math.max(maxX, bounds.x + bounds.width)
      maxY = Math.max(maxY, bounds.y + bounds.height)
    })
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
} 