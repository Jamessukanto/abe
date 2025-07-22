// Core geometry types
export interface Point {
  x: number
  y: number
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

// Core annotation types
export interface AnnotationShape {
  id: string
  type: 'rectangle' | 'polygon' | 'point'
  coordinates: number[][]
  classId: string
  groupId?: string
  isSelected: boolean
  isVisible: boolean
  metadata: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface AnnotationGroup {
  id: string
  name: string
  parentId?: string
  childIds: string[]
  isExpanded: boolean
  color: string
  isVisible: boolean
  metadata: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface AnnotationClass {
  id: string
  name: string
  color: string
  shortcut?: string
  isActive: boolean
}

// Canvas state
export interface CanvasState {
  zoom: number
  pan: Point
  imageUrl: string
  imageSize: { width: number; height: number }
  maxZoom: number
  minZoom: number
  isDragging: boolean
  isLoading: boolean
}

// Tool system interfaces
export interface PointerEventData {
  point: Point
  canvasPoint: Point
  shiftKey: boolean
  ctrlKey: boolean
  altKey: boolean
  button: number
}

export interface Tool {
  type: string
  cursor?: string
  onDown(event: PointerEventData, canvas: CanvasState): void
  onMove(event: PointerEventData, canvas: CanvasState): void
  onUp(event: PointerEventData, canvas: CanvasState): void
  onCancel?(): void
  onActivate?(): void
  onDeactivate?(): void
}

// Selection state
export interface SelectionState {
  selectedShapeIds: string[]
  selectedGroupIds: string[]
  hoveredShapeId?: string
  hoveredGroupId?: string
  isMultiSelect: boolean
}

// Preview state for tool interactions
export interface PreviewState {
  shape?: Partial<AnnotationShape>
  isActive: boolean
}

// Tool state interface
export interface ToolState {
  activeTool: ToolType
  toolSettings: {
    strokeWidth: number
    strokeColor: string
    fillColor: string
    opacity: number
  }
}

// Main annotation state
export interface AnnotationState {
  // Data
  shapes: Record<string, AnnotationShape>
  groups: Record<string, AnnotationGroup>
  classes: Record<string, AnnotationClass>
  
  // UI State
  canvas: CanvasState
  selection: SelectionState
  preview: PreviewState
  
  // Tool state
  tools: ToolState
  
  // Performance - using arrays for Redux compatibility
  dirtyShapeIds: string[]
  dirtyGroupIds: string[]
  
  // History for undo/redo
  historyIndex: number
  historyMaxSize: number
}

// Action payload types
export interface CreateShapePayload {
  shape: Omit<AnnotationShape, 'id' | 'createdAt' | 'updatedAt'>
}

export interface UpdateShapePayload {
  id: string
  updates: Partial<AnnotationShape>
}

export interface CreateGroupPayload {
  id?: string
  name: string
  parentId?: string
  isExpanded?: boolean
  color?: string
  isVisible?: boolean
  metadata?: Record<string, any>
}

export interface UpdateGroupPayload {
  id: string
  updates: Partial<AnnotationGroup>
}

export interface GroupShapesPayload {
  shapeIds: string[]
  groupId?: string
  groupName?: string
  parentId?: string
}

export interface SetCanvasPayload {
  updates: Partial<CanvasState>
}

export interface SetSelectionPayload {
  shapeIds?: string[]
  groupIds?: string[]
  mode?: 'replace' | 'add' | 'remove' | 'toggle'
}

// Utility types
export type ShapeType = AnnotationShape['type']
export type ToolType = 'select' | 'pan' | 'rectangle' | 'polygon' | 'point' 