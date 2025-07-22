import { createAsyncThunk } from '@reduxjs/toolkit'
import type { 
  AnnotationShape, 
  CreateShapePayload,
  Point,
  Rectangle 
} from '../features/annotation/lib/types'
import type { ClientRootState } from './index'

// Async thunk for loading an image and setting up canvas
export const loadImage = createAsyncThunk(
  'annotation/loadImage',
  async (imageUrl: string, { dispatch, rejectWithValue }) => {
    try {
      return new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image()
        
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight
          })
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }
        
        img.src = imageUrl
      })
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

// Async thunk for batch shape operations (for performance)
export const batchCreateShapes = createAsyncThunk(
  'annotation/batchCreateShapes',
  async (shapesData: CreateShapePayload[], { dispatch, getState }) => {
    const state = getState() as ClientRootState
    const timestamp = Date.now()
    
    // Create all shapes with IDs
    const shapes = shapesData.map((shapeData, index) => ({
      ...shapeData.shape,
      id: `shape_${timestamp}_${index}`,
      createdAt: timestamp,
      updatedAt: timestamp
    }))
    
    return shapes
  }
)

// Async thunk for auto-grouping shapes based on spatial proximity
export const autoGroupNearbyShapes = createAsyncThunk(
  'annotation/autoGroupNearbyShapes',
  async (
    { threshold = 50, selectedOnly = false }: { threshold?: number; selectedOnly?: boolean },
    { getState, dispatch }
  ) => {
    const state = getState() as ClientRootState
    const { shapes, selection } = state.annotation
    
    const shapesToAnalyze = selectedOnly 
      ? selection.selectedShapeIds.map(id => shapes[id]).filter(Boolean)
      : Object.values(shapes)
    
    // Simple spatial clustering algorithm
    const groups: AnnotationShape[][] = []
    const processed = new Set<string>()
    
    shapesToAnalyze.forEach(shape => {
      if (processed.has(shape.id)) return
      
      const group = [shape]
      processed.add(shape.id)
      
      // Find nearby shapes
      shapesToAnalyze.forEach(otherShape => {
        if (processed.has(otherShape.id) || shape.id === otherShape.id) return
        
        const distance = calculateShapeDistance(shape, otherShape)
        if (distance <= threshold) {
          group.push(otherShape)
          processed.add(otherShape.id)
        }
      })
      
      if (group.length > 1) {
        groups.push(group)
      }
    })
    
    return groups.map(group => ({
      shapeIds: group.map(s => s.id),
      groupName: `Auto Group ${groups.indexOf(group) + 1}`
    }))
  }
)

// Async thunk for optimizing performance by cleaning up dirty flags
export const optimizePerformance = createAsyncThunk(
  'annotation/optimizePerformance',
  async (_, { dispatch, getState }) => {
    const state = getState() as ClientRootState
    const { dirtyShapeIds, dirtyGroupIds } = state.annotation
    
    // Log performance metrics
    const metrics = {
      dirtyShapes: dirtyShapeIds.length,
      dirtyGroups: dirtyGroupIds.length,
      timestamp: Date.now()
    }
    
    // Clear dirty flags after rendering
    dispatch({ type: 'annotation/clearDirtyFlags' })
    
    return metrics
  }
)

// Helper function to calculate distance between shapes
function calculateShapeDistance(shape1: AnnotationShape, shape2: AnnotationShape): number {
  // Get bounding boxes for both shapes
  const bbox1 = getShapeBoundingBox(shape1)
  const bbox2 = getShapeBoundingBox(shape2)
  
  // Calculate center points
  const center1 = {
    x: bbox1.x + bbox1.width / 2,
    y: bbox1.y + bbox1.height / 2
  }
  const center2 = {
    x: bbox2.x + bbox2.width / 2,
    y: bbox2.y + bbox2.height / 2
  }
  
  // Return Euclidean distance
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  )
}

// Helper function to get shape bounding box
function getShapeBoundingBox(shape: AnnotationShape): Rectangle {
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

// Async thunk for validating shape data integrity
export const validateShapeIntegrity = createAsyncThunk(
  'annotation/validateShapeIntegrity',
  async (_, { getState }) => {
    const state = getState() as ClientRootState
    const { shapes, groups } = state.annotation
    
    const issues: string[] = []
    
    // Check for orphaned shapes (referencing non-existent groups)
    Object.values(shapes).forEach(shape => {
      if (shape.groupId && !groups[shape.groupId]) {
        issues.push(`Shape ${shape.id} references non-existent group ${shape.groupId}`)
      }
    })
    
    // Check for orphaned group references
    Object.values(groups).forEach(group => {
      group.childIds.forEach(childId => {
        if (!shapes[childId] && !groups[childId]) {
          issues.push(`Group ${group.id} references non-existent child ${childId}`)
        }
      })
      
      if (group.parentId && !groups[group.parentId]) {
        issues.push(`Group ${group.id} references non-existent parent ${group.parentId}`)
      }
    })
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
) 