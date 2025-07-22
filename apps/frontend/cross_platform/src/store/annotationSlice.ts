import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit'
import type {
  AnnotationState,
  AnnotationShape,
  AnnotationGroup,
  AnnotationClass,
  CreateShapePayload,
  UpdateShapePayload,
  CreateGroupPayload,
  UpdateGroupPayload,
  GroupShapesPayload,
  SetCanvasPayload,
  SetSelectionPayload,
  Point,
  ToolType
} from '../features/annotation/lib/types'

// Helper function to add unique item to array
const addToArray = (array: string[], item: string) => {
  if (!array.includes(item)) {
    array.push(item)
  }
}

// Helper function to remove item from array
const removeFromArray = (array: string[], item: string) => {
  const index = array.indexOf(item)
  if (index > -1) {
    array.splice(index, 1)
  }
}

// Current timestamp helper
const now = () => Date.now()

// Initial state
const initialState: AnnotationState = {
  // Data
  shapes: {},
  groups: {},
  classes: {
    'default': {
      id: 'default',
      name: 'Default',
      color: '#3b82f6',
      isActive: true
    }
  },
  
  // UI State
  canvas: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    imageUrl: '',
    imageSize: { width: 800, height: 600 }, // Default canvas size
    maxZoom: 10,
    minZoom: 0.1,
    isDragging: false,
    isLoading: false
  },
  
  selection: {
    selectedShapeIds: [],
    selectedGroupIds: [],
    hoveredShapeId: undefined,
    hoveredGroupId: undefined,
    isMultiSelect: false
  },
  
  // Performance tracking
  dirtyShapeIds: [],
  dirtyGroupIds: [],
  
  // History for undo/redo
  historyIndex: -1,
  historyMaxSize: 50,
  
  // Tools
  tools: {
    activeTool: 'rectangle',
    toolSettings: {
      strokeWidth: 2,
      strokeColor: '#000000',
      fillColor: 'transparent',
      opacity: 1
    }
  },
  
  // Preview
  preview: {
    isActive: false,
    shape: undefined
  }
}

const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {
    // Shape management
    addShape: (state, action: PayloadAction<CreateShapePayload>) => {
      const id = nanoid()
      const shape: AnnotationShape = {
        ...action.payload.shape,
        id,
        createdAt: now(),
        updatedAt: now()
      }
      
      state.shapes[id] = shape
      addToArray(state.dirtyShapeIds, id)
    },
    
    updateShape: (state, action: PayloadAction<UpdateShapePayload>) => {
      const { id, updates } = action.payload
      if (state.shapes[id]) {
        state.shapes[id] = {
          ...state.shapes[id],
          ...updates,
          updatedAt: now()
        }
        addToArray(state.dirtyShapeIds, id)
      }
    },
    
    deleteShape: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (state.shapes[id]) {
        // Remove from group if it belongs to one
        const shape = state.shapes[id]
        if (shape.groupId && state.groups[shape.groupId]) {
          state.groups[shape.groupId].childIds = state.groups[shape.groupId].childIds.filter(
            childId => childId !== id
          )
          addToArray(state.dirtyGroupIds, shape.groupId)
        }
        
        // Remove from selection
        state.selection.selectedShapeIds = state.selection.selectedShapeIds.filter(
          selectedId => selectedId !== id
        )
        
        delete state.shapes[id]
        removeFromArray(state.dirtyShapeIds, id)
      }
    },
    
    batchUpdateShapes: (state, action: PayloadAction<Array<[string, Partial<AnnotationShape>]>>) => {
      const timestamp = now()
      action.payload.forEach(([id, updates]) => {
        if (state.shapes[id]) {
          state.shapes[id] = {
            ...state.shapes[id],
            ...updates,
            updatedAt: timestamp
          }
          addToArray(state.dirtyShapeIds, id)
        }
      })
    },

    // Group management
    addGroup: (state, action: PayloadAction<CreateGroupPayload>) => {
      const { 
        id = nanoid(), 
        name, 
        parentId,
        isExpanded = true,
        color = '#64748b',
        isVisible = true,
        metadata = {}
      } = action.payload
      
      const group: AnnotationGroup = {
        id,
        name,
        parentId,
        childIds: [],
        isExpanded,
        color,
        isVisible,
        metadata,
        createdAt: now(),
        updatedAt: now()
      }
      
      state.groups[id] = group
      addToArray(state.dirtyGroupIds, id)
      
      // Update parent group if specified
      if (group.parentId && state.groups[group.parentId]) {
        state.groups[group.parentId].childIds.push(id)
        addToArray(state.dirtyGroupIds, group.parentId)
      }
    },
    
    updateGroup: (state, action: PayloadAction<UpdateGroupPayload>) => {
      const { id, updates } = action.payload
      if (state.groups[id]) {
        state.groups[id] = {
          ...state.groups[id],
          ...updates,
          updatedAt: now()
        }
        addToArray(state.dirtyGroupIds, id)
      }
    },
    
    deleteGroup: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const group = state.groups[id]
      if (group) {
        // Move children to parent or ungroup
        group.childIds.forEach(childId => {
          if (state.shapes[childId]) {
            state.shapes[childId].groupId = group.parentId
            addToArray(state.dirtyShapeIds, childId)
          } else if (state.groups[childId]) {
            state.groups[childId].parentId = group.parentId
          }
        })
        
        // Remove from parent if it has one
        if (group.parentId && state.groups[group.parentId]) {
          state.groups[group.parentId].childIds = state.groups[group.parentId].childIds.filter(
            childId => childId !== id
          )
          addToArray(state.dirtyGroupIds, group.parentId)
        }
        
        // Remove from selection
        state.selection.selectedGroupIds = state.selection.selectedGroupIds.filter(
          selectedId => selectedId !== id
        )
        
        delete state.groups[id]
        removeFromArray(state.dirtyGroupIds, id)
      }
    },

    groupShapes: (state, action: PayloadAction<GroupShapesPayload>) => {
      const { shapeIds, groupId = nanoid(), groupName = 'New Group' } = action.payload
      
      // Create new group
      const group: AnnotationGroup = {
        id: groupId,
        name: groupName,
        childIds: [...shapeIds],
        isExpanded: true,
        color: '#64748b',
        isVisible: true,
        metadata: {},
        createdAt: now(),
        updatedAt: now()
      }
      
      state.groups[groupId] = group
      addToArray(state.dirtyGroupIds, groupId)
      
      // Update shapes to belong to this group
      shapeIds.forEach(shapeId => {
        if (state.shapes[shapeId]) {
          state.shapes[shapeId].groupId = groupId
          addToArray(state.dirtyShapeIds, shapeId)
        }
      })
    },

    ungroupShapes: (state, action: PayloadAction<string>) => {
      const groupId = action.payload
      const group = state.groups[groupId]
      
      if (group) {
        // Remove group reference from all shapes
        group.childIds.forEach(childId => {
          if (state.shapes[childId]) {
            delete state.shapes[childId].groupId
            addToArray(state.dirtyShapeIds, childId)
          } else if (state.groups[childId]) {
            state.groups[childId].parentId = group.parentId
          }
        })
        
        // If group has parent, move children to parent
        if (group.parentId && state.groups[group.parentId]) {
          const parentGroup = state.groups[group.parentId]
          // Remove this group from parent's children
          parentGroup.childIds = parentGroup.childIds.filter(id => id !== groupId)
          // Add this group's children to parent
          parentGroup.childIds.push(...group.childIds)
          addToArray(state.dirtyGroupIds, group.parentId)
        }
        
        // Remove from selection
        state.selection.selectedGroupIds = state.selection.selectedGroupIds.filter(
          selectedId => selectedId !== groupId
        )
        
        delete state.groups[groupId]
        removeFromArray(state.dirtyGroupIds, groupId)
      }
    },

    moveShapeToGroup: (state, action: PayloadAction<{ shapeId: string; groupId: string | undefined }>) => {
      const { shapeId, groupId } = action.payload
      const shape = state.shapes[shapeId]
      
      if (shape) {
        // Remove from current group
        if (shape.groupId && state.groups[shape.groupId]) {
          const currentGroup = state.groups[shape.groupId]
          currentGroup.childIds = currentGroup.childIds.filter(id => id !== shapeId)
          addToArray(state.dirtyGroupIds, shape.groupId)
        }
        
        // Add to new group
        if (groupId && state.groups[groupId]) {
          state.groups[groupId].childIds.push(shapeId)
          shape.groupId = groupId
          addToArray(state.dirtyGroupIds, groupId)
        } else {
          delete shape.groupId
        }
        
        addToArray(state.dirtyShapeIds, shapeId)
      }
    },

    // Canvas management
    setCanvas: (state, action: PayloadAction<SetCanvasPayload>) => {
      const { updates } = action.payload
      state.canvas = {
        ...state.canvas,
        ...updates
      }
    },

    // Selection management  
    setSelection: (state, action: PayloadAction<SetSelectionPayload>) => {
      const { shapeIds = [], groupIds = [], mode = 'replace' } = action.payload
      
      if (mode === 'replace') {
        state.selection.selectedShapeIds = shapeIds
        state.selection.selectedGroupIds = groupIds
      } else if (mode === 'add') {
        // Add to selection (avoiding duplicates)
        shapeIds.forEach(id => {
          if (!state.selection.selectedShapeIds.includes(id)) {
            state.selection.selectedShapeIds.push(id)
          }
        })
        groupIds.forEach(id => {
          if (!state.selection.selectedGroupIds.includes(id)) {
            state.selection.selectedGroupIds.push(id)
          }
        })
      } else if (mode === 'remove') {
        // Remove from selection
        state.selection.selectedShapeIds = state.selection.selectedShapeIds.filter(
          id => !shapeIds.includes(id)
        )
        state.selection.selectedGroupIds = state.selection.selectedGroupIds.filter(
          id => !groupIds.includes(id)
        )
      }
    },

    clearSelection: (state) => {
      state.selection.selectedShapeIds = []
      state.selection.selectedGroupIds = []
      state.selection.hoveredShapeId = undefined
      state.selection.hoveredGroupId = undefined
    },

    setHoveredShape: (state, action: PayloadAction<string | undefined>) => {
      state.selection.hoveredShapeId = action.payload
    },

    setHoveredGroup: (state, action: PayloadAction<string | undefined>) => {
      state.selection.hoveredGroupId = action.payload
    },

    // Tool management
    setActiveTool: (state, action: PayloadAction<ToolType>) => {
      state.tools.activeTool = action.payload
    },

    updateToolSettings: (state, action: PayloadAction<Partial<typeof initialState.tools.toolSettings>>) => {
      state.tools.toolSettings = {
        ...state.tools.toolSettings,
        ...action.payload
      }
    },

    // Preview management
    setPreview: (state, action: PayloadAction<{ isActive: boolean; shape?: AnnotationShape }>) => {
      state.preview.isActive = action.payload.isActive
      state.preview.shape = action.payload.shape
    },

    clearPreview: (state) => {
      state.preview.isActive = false
      state.preview.shape = undefined
    },

    // Performance management
    clearDirtyFlags: (state) => {
      state.dirtyShapeIds = []
      state.dirtyGroupIds = []
    },

    // Class management
    addClass: (state, action: PayloadAction<AnnotationClass>) => {
      state.classes[action.payload.id] = action.payload
    },

    updateClass: (state, action: PayloadAction<{ id: string; updates: Partial<AnnotationClass> }>) => {
      const { id, updates } = action.payload
      if (state.classes[id]) {
        state.classes[id] = {
          ...state.classes[id],
          ...updates
        }
      }
    },

    deleteClass: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (id !== 'default') { // Prevent deleting default class
        delete state.classes[id]
        
        // Reset shapes using this class to default
        Object.values(state.shapes).forEach(shape => {
          if (shape.classId === id) {
            shape.classId = 'default'
          }
        })
      }
    },

    setActiveClass: (state, action: PayloadAction<string>) => {
      // Deactivate all classes
      Object.values(state.classes).forEach(cls => {
        cls.isActive = false
      })
      
      // Activate selected class
      if (state.classes[action.payload]) {
        state.classes[action.payload].isActive = true
      }
    }
  }
})

// Export actions
export const {
  addShape,
  updateShape,
  deleteShape,
  batchUpdateShapes,
  addGroup,
  updateGroup,
  deleteGroup,
  groupShapes,
  ungroupShapes,
  moveShapeToGroup,
  setCanvas,
  setSelection,
  clearSelection,
  setHoveredShape,
  setHoveredGroup,
  setActiveTool,
  updateToolSettings,
  setPreview,
  clearPreview,
  clearDirtyFlags,
  addClass,
  updateClass,
  deleteClass,
  setActiveClass
} = annotationSlice.actions

// Export reducer
export default annotationSlice.reducer 