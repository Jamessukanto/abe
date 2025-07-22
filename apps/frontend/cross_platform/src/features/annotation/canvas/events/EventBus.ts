import type { Point, AnnotationShape, AnnotationGroup } from '../../lib/types'

/**
 * Base event interface
 */
export interface CanvasEvent {
  type: string
  timestamp: number
  source?: string
}

/**
 * Shape-related events
 */
export interface ShapeCreatedEvent extends CanvasEvent {
  type: 'shape:created'
  shape: AnnotationShape
}

export interface ShapeUpdatedEvent extends CanvasEvent {
  type: 'shape:updated'
  shapeId: string
  updates: Partial<AnnotationShape>
  previousState: Partial<AnnotationShape>
}

export interface ShapeDeletedEvent extends CanvasEvent {
  type: 'shape:deleted'
  shapeId: string
  shape: AnnotationShape
}

export interface ShapeSelectedEvent extends CanvasEvent {
  type: 'shape:selected'
  shapeIds: string[]
  addToSelection: boolean
}

export interface ShapeHoveredEvent extends CanvasEvent {
  type: 'shape:hovered'
  shapeId?: string
}

/**
 * Group-related events
 */
export interface GroupCreatedEvent extends CanvasEvent {
  type: 'group:created'
  group: AnnotationGroup
}

export interface ShapesGroupedEvent extends CanvasEvent {
  type: 'shapes:grouped'
  shapeIds: string[]
  groupId: string
  groupName: string
}

export interface ShapesUngroupedEvent extends CanvasEvent {
  type: 'shapes:ungrouped'
  groupId: string
  shapeIds: string[]
}

/**
 * Tool-related events
 */
export interface ToolActivatedEvent extends CanvasEvent {
  type: 'tool:activated'
  toolType: string
  previousTool?: string
}

export interface ToolInteractionEvent extends CanvasEvent {
  type: 'tool:interaction'
  toolType: string
  action: 'start' | 'move' | 'end' | 'cancel'
  point: Point
  modifiers: {
    shiftKey: boolean
    ctrlKey: boolean
    altKey: boolean
  }
}

/**
 * Canvas-related events
 */
export interface CanvasViewportChangedEvent extends CanvasEvent {
  type: 'canvas:viewport:changed'
  zoom: number
  pan: Point
  bounds: { x: number; y: number; width: number; height: number }
}

export interface CanvasImageLoadedEvent extends CanvasEvent {
  type: 'canvas:image:loaded'
  imageUrl: string
  dimensions: { width: number; height: number }
}

/**
 * Performance-related events
 */
export interface PerformanceWarningEvent extends CanvasEvent {
  type: 'performance:warning'
  warning: string
  metrics: {
    frameRate: number
    renderTime: number
    shapeCount: number
  }
}

/**
 * Command-related events
 */
export interface CommandExecutedEvent extends CanvasEvent {
  type: 'command:executed'
  commandId: string
  description: string
  canUndo: boolean
  canRedo: boolean
}

export interface CommandUndoneEvent extends CanvasEvent {
  type: 'command:undone'
  commandId: string
  description: string
  canUndo: boolean
  canRedo: boolean
}

/**
 * Union type of all possible events
 */
export type AllCanvasEvents = 
  | ShapeCreatedEvent
  | ShapeUpdatedEvent
  | ShapeDeletedEvent
  | ShapeSelectedEvent
  | ShapeHoveredEvent
  | GroupCreatedEvent
  | ShapesGroupedEvent
  | ShapesUngroupedEvent
  | ToolActivatedEvent
  | ToolInteractionEvent
  | CanvasViewportChangedEvent
  | CanvasImageLoadedEvent
  | PerformanceWarningEvent
  | CommandExecutedEvent
  | CommandUndoneEvent

/**
 * Event listener function type
 */
export type EventListener<T extends CanvasEvent = CanvasEvent> = (event: T) => void

/**
 * EventBus handles event-driven communication between canvas components
 * Replaces direct coupling with loose event-based architecture
 */
export class EventBus {
  private listeners: Map<string, EventListener[]> = new Map()
  private eventHistory: CanvasEvent[] = []
  private readonly maxHistorySize: number = 1000
  
  // Debug mode for development
  private debugMode: boolean = false

  /**
   * Subscribe to events of a specific type
   */
  on<T extends AllCanvasEvents>(
    eventType: T['type'], 
    listener: EventListener<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    
    this.listeners.get(eventType)!.push(listener as EventListener)
    
    // Return unsubscribe function
    return () => this.off(eventType, listener)
  }

  /**
   * Subscribe to events matching a pattern
   */
  onPattern(pattern: RegExp, listener: EventListener): () => void {
    const patternKey = `__pattern__${pattern.source}`
    
    if (!this.listeners.has(patternKey)) {
      this.listeners.set(patternKey, [])
    }
    
    this.listeners.get(patternKey)!.push(listener)
    
    return () => this.off(patternKey, listener)
  }

  /**
   * Subscribe to events with namespace
   */
  onNamespace(namespace: string, listener: EventListener): () => void {
    return this.onPattern(new RegExp(`^${namespace}:`), listener)
  }

  /**
   * Unsubscribe from events
   */
  off<T extends AllCanvasEvents>(
    eventType: T['type'] | string, 
    listener: EventListener<T>
  ): void {
    const eventListeners = this.listeners.get(eventType)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener as EventListener)
      if (index !== -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  emit<T extends AllCanvasEvents>(event: Omit<T, 'timestamp'>): void {
    const fullEvent = {
      ...event,
      timestamp: Date.now()
    } as T

    // Add to history
    this.eventHistory.push(fullEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    if (this.debugMode) {
      console.log('[EventBus]', fullEvent.type, fullEvent)
    }

    // Notify direct listeners
    const directListeners = this.listeners.get(fullEvent.type) || []
    directListeners.forEach(listener => {
      try {
        listener(fullEvent)
      } catch (error) {
        console.error(`Event listener error for ${fullEvent.type}:`, error)
      }
    })

    // Notify pattern listeners
    this.listeners.forEach((listeners, key) => {
      if (key.startsWith('__pattern__')) {
        const pattern = new RegExp(key.replace('__pattern__', ''))
        if (pattern.test(fullEvent.type)) {
          listeners.forEach(listener => {
            try {
              listener(fullEvent)
            } catch (error) {
              console.error(`Pattern listener error for ${fullEvent.type}:`, error)
            }
          })
        }
      }
    })
  }

  /**
   * Create a typed event emitter for specific event types
   */
  createEmitter<T extends AllCanvasEvents>() {
    return (event: Omit<T, 'timestamp'>) => this.emit(event as any)
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(filter?: (event: CanvasEvent) => boolean): CanvasEvent[] {
    return filter ? this.eventHistory.filter(filter) : [...this.eventHistory]
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }

  /**
   * Get listener statistics
   */
  getStats(): { 
    totalListeners: number
    eventTypes: string[]
    historySize: number 
  } {
    let totalListeners = 0
    const eventTypes = Array.from(this.listeners.keys()).filter(key => !key.startsWith('__pattern__'))
    
    this.listeners.forEach(listeners => {
      totalListeners += listeners.length
    })

    return {
      totalListeners,
      eventTypes,
      historySize: this.eventHistory.length
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear()
  }

  /**
   * Wait for a specific event (useful for testing)
   */
  waitFor<T extends AllCanvasEvents>(
    eventType: T['type'], 
    timeout: number = 5000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: number
      
      const unsubscribe = this.on(eventType, (event) => {
        clearTimeout(timeoutId)
        unsubscribe()
        resolve(event as T)
      })
      
      timeoutId = setTimeout(() => {
        unsubscribe()
        reject(new Error(`Timeout waiting for event: ${eventType}`))
      }, timeout) as any
    })
  }
}

/**
 * Global event bus instance
 */
export const globalEventBus = new EventBus()

/**
 * Utility function to create event creators
 */
export const createEventCreators = (source: string) => ({
  shapeCreated: (shape: AnnotationShape): ShapeCreatedEvent => ({
    type: 'shape:created',
    shape,
    source,
    timestamp: Date.now()
  }),

  shapeUpdated: (shapeId: string, updates: Partial<AnnotationShape>, previousState: Partial<AnnotationShape>): ShapeUpdatedEvent => ({
    type: 'shape:updated',
    shapeId,
    updates,
    previousState,
    source,
    timestamp: Date.now()
  }),

  shapeDeleted: (shapeId: string, shape: AnnotationShape): ShapeDeletedEvent => ({
    type: 'shape:deleted',
    shapeId,
    shape,
    source,
    timestamp: Date.now()
  }),

  toolActivated: (toolType: string, previousTool?: string): ToolActivatedEvent => ({
    type: 'tool:activated',
    toolType,
    previousTool,
    source,
    timestamp: Date.now()
  }),

  canvasViewportChanged: (zoom: number, pan: Point, bounds: { x: number; y: number; width: number; height: number }): CanvasViewportChangedEvent => ({
    type: 'canvas:viewport:changed',
    zoom,
    pan,
    bounds,
    source,
    timestamp: Date.now()
  })
}) 