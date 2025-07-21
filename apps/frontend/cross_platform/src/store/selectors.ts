import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import type { 
  AnnotationState, 
  AnnotationShape, 
  AnnotationGroup,
  AnnotationClass,
  Point,
  Rectangle
} from '../features/annotation/lib/types'

// Base selectors
export const selectAnnotation = (state: RootState): AnnotationState => state.annotation

export const selectShapes = createSelector(
  [selectAnnotation],
  (annotation) => annotation.shapes
)

export const selectGroups = createSelector(
  [selectAnnotation],
  (annotation) => annotation.groups
)

export const selectClasses = createSelector(
  [selectAnnotation],
  (annotation) => annotation.classes
)

export const selectCanvas = createSelector(
  [selectAnnotation],
  (annotation) => annotation.canvas
)

export const selectSelection = createSelector(
  [selectAnnotation],
  (annotation) => annotation.selection
)

export const selectPreview = createSelector(
  [selectAnnotation],
  (annotation) => annotation.preview
)

export const selectActiveTool = createSelector(
  [selectAnnotation],
  (annotation) => annotation.activeTool
)

// Derived selectors
export const selectShapesArray = createSelector(
  [selectShapes],
  (shapes) => Object.values(shapes)
)

export const selectGroupsArray = createSelector(
  [selectGroups],
  (groups) => Object.values(groups)
)

export const selectClassesArray = createSelector(
  [selectClasses],
  (classes) => Object.values(classes)
)

export const selectSelectedShapes = createSelector(
  [selectShapes, selectSelection],
  (shapes, selection) => 
    selection.selectedShapeIds.map(id => shapes[id]).filter(Boolean)
)

export const selectSelectedGroups = createSelector(
  [selectGroups, selectSelection],
  (groups, selection) => 
    selection.selectedGroupIds.map(id => groups[id]).filter(Boolean)
)

export const selectHoveredShape = createSelector(
  [selectShapes, selectSelection],
  (shapes, selection) => 
    selection.hoveredShapeId ? shapes[selection.hoveredShapeId] : undefined
)

export const selectHoveredGroup = createSelector(
  [selectGroups, selectSelection],
  (groups, selection) => 
    selection.hoveredGroupId ? groups[selection.hoveredGroupId] : undefined
)

// Performance selectors
export const selectDirtyShapeIds = createSelector(
  [selectAnnotation],
  (annotation) => annotation.dirtyShapeIds
)

export const selectDirtyGroupIds = createSelector(
  [selectAnnotation],
  (annotation) => annotation.dirtyGroupIds
)

export const selectDirtyShapes = createSelector(
  [selectShapes, selectDirtyShapeIds],
  (shapes, dirtyIds) => 
    Array.from(dirtyIds).map(id => shapes[id]).filter(Boolean) as AnnotationShape[]
)

export const selectDirtyGroups = createSelector(
  [selectGroups, selectDirtyGroupIds],
  (groups, dirtyIds) => 
    Array.from(dirtyIds).map(id => groups[id]).filter(Boolean) as AnnotationGroup[]
)

// Hierarchical selectors
export const selectRootGroups = createSelector(
  [selectGroupsArray],
  (groups) => groups.filter(group => !group.parentId)
)

export const selectGroupChildren = createSelector(
  [selectShapes, selectGroups],
  (shapes, groups) => (groupId: string) => {
    const group = groups[groupId]
    if (!group) return []
    
    return group.childIds.map(childId => {
      // Child could be either a shape or another group
      return shapes[childId] || groups[childId]
    }).filter(Boolean)
  }
)

export const selectGroupDescendants = createSelector(
  [selectShapes, selectGroups],
  (shapes, groups) => (groupId: string): (AnnotationShape | AnnotationGroup)[] => {
    const group = groups[groupId]
    if (!group) return []
    
    const descendants: (AnnotationShape | AnnotationGroup)[] = []
    
    const traverse = (currentGroupId: string) => {
      const currentGroup = groups[currentGroupId]
      if (!currentGroup) return
      
      currentGroup.childIds.forEach(childId => {
        const child = shapes[childId] || groups[childId]
        if (child) {
          descendants.push(child)
          // If it's a group, recurse
          if ('childIds' in child) {
            traverse(childId)
          }
        }
      })
    }
    
    traverse(groupId)
    return descendants
  }
)

// Visibility selectors
export const selectVisibleShapes = createSelector(
  [selectShapesArray],
  (shapes) => shapes.filter(shape => shape.isVisible)
)

export const selectVisibleGroups = createSelector(
  [selectGroupsArray],
  (groups) => groups.filter(group => group.isVisible)
)

// Canvas viewport selectors
export const selectViewport = createSelector(
  [selectCanvas],
  (canvas): Rectangle => ({
    x: -canvas.pan.x / canvas.zoom,
    y: -canvas.pan.y / canvas.zoom,
    width: canvas.imageSize.width / canvas.zoom,
    height: canvas.imageSize.height / canvas.zoom
  })
)

export const selectCanvasTransform = createSelector(
  [selectCanvas],
  (canvas) => ({
    zoom: canvas.zoom,
    pan: canvas.pan,
    matrix: [canvas.zoom, 0, 0, canvas.zoom, canvas.pan.x, canvas.pan.y] as const
  })
)

// Shape filtering selectors
export const selectShapesByType = createSelector(
  [selectShapesArray],
  (shapes) => (type: AnnotationShape['type']) => 
    shapes.filter(shape => shape.type === type)
)

export const selectShapesByClass = createSelector(
  [selectShapesArray],
  (shapes) => (classId: string) => 
    shapes.filter(shape => shape.classId === classId)
)

export const selectShapesByGroup = createSelector(
  [selectShapesArray],
  (shapes) => (groupId: string) => 
    shapes.filter(shape => shape.groupId === groupId)
)

export const selectUngroupedShapes = createSelector(
  [selectShapesArray],
  (shapes) => shapes.filter(shape => !shape.groupId)
)

// Active class selector
export const selectActiveClass = createSelector(
  [selectClassesArray],
  (classes) => classes.find(cls => cls.isActive)
)

// Statistics selectors
export const selectShapeCount = createSelector(
  [selectShapesArray],
  (shapes) => shapes.length
)

export const selectGroupCount = createSelector(
  [selectGroupsArray],
  (groups) => groups.length
)

export const selectSelectedCount = createSelector(
  [selectSelection],
  (selection) => selection.selectedShapeIds.length + selection.selectedGroupIds.length
)

// History selectors
export const selectCanUndo = createSelector(
  [selectAnnotation],
  (annotation) => annotation.history.past.length > 0
)

export const selectCanRedo = createSelector(
  [selectAnnotation],
  (annotation) => annotation.history.future.length > 0
)

// Tool state selectors
export const selectIsSelectTool = createSelector(
  [selectActiveTool],
  (tool) => tool === 'select'
)

export const selectIsPanTool = createSelector(
  [selectActiveTool],
  (tool) => tool === 'pan'
)

export const selectIsDrawingTool = createSelector(
  [selectActiveTool],
  (tool) => ['rectangle', 'polygon', 'point'].includes(tool)
) 