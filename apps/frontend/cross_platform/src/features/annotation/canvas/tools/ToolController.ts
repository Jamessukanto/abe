import type { Tool, PointerEventData, CanvasState, ToolType } from '../../lib/types'
import { ToolManager } from '../../tools/ToolManager'
import { RectangleTool } from '../../tools/RectangleTool'
import { PenTool } from '../../tools/PenTool'
import { CommandManager } from '../../tools/commands/CommandManager'
import { AnnotationCommandFactory } from '../../tools/commands/AnnotationCommands'
import { EventBus, globalEventBus } from '../events/EventBus'
import type { AppDispatch } from '../../../../store'

/**
 * ToolController manages tool state and coordinates between tools, commands, and events
 * Replaces direct tool management in CanvasContainer with proper separation of concerns
 */
export class ToolController {
  private toolManager: ToolManager
  private commandManager: CommandManager
  private commandFactory: AnnotationCommandFactory
  private eventBus: EventBus
  private dispatch: AppDispatch
  
  private activeTool: ToolType = 'rectangle'
  private isToolActive: boolean = false

  constructor(
    dispatch: AppDispatch,
    eventBus: EventBus = globalEventBus,
    commandManager?: CommandManager
  ) {
    this.dispatch = dispatch
    this.eventBus = eventBus
    this.commandManager = commandManager || new CommandManager()
    this.commandFactory = new AnnotationCommandFactory(dispatch)
    this.toolManager = new ToolManager(dispatch)
    
    this.initializeTools()
    this.setupEventListeners()
    this.setupCommandListeners()
  }

  /**
   * Initialize available tools
   */
  private initializeTools(): void {
    // Create tool instances with command factory integration
    const rectangleTool = new EnhancedRectangleTool(this.commandFactory, this.eventBus, this.dispatch)
    const penTool = new EnhancedPenTool(this.commandFactory, this.eventBus, this.dispatch)
    
    // Register tools with manager
    this.toolManager.registerTool(rectangleTool)
    this.toolManager.registerTool(penTool)
    
    // Set default tool
    this.setActiveTool(this.activeTool)
  }

  /**
   * Setup event listeners for tool-related events
   */
  private setupEventListeners(): void {
    // Listen for tool activation requests
    this.eventBus.on('tool:activated', (event: any) => {
      if (event.toolType !== this.activeTool) {
        this.setActiveTool(event.toolType as ToolType)
      }
    })

    // Listen for canvas interactions and route to tools
    this.eventBus.on('tool:interaction', (event: any) => {
      this.handleToolInteraction(event)
    })
  }

  /**
   * Setup command event listeners
   */
  private setupCommandListeners(): void {
    this.commandManager.addEventListener('commandExecuted', (event) => {
      this.eventBus.emit({
        type: 'command:executed',
        commandId: event.data.command.id,
        description: event.data.command.description,
        canUndo: event.data.canUndo,
        canRedo: event.data.canRedo,
        source: 'ToolController'
      } as any)
    })

    this.commandManager.addEventListener('commandUndone', (event) => {
      this.eventBus.emit({
        type: 'command:undone',
        commandId: event.data.command.id,
        description: event.data.command.description,
        canUndo: event.data.canUndo,
        canRedo: event.data.canRedo,
        source: 'ToolController'
      } as any)
    })
  }

  /**
   * Set the active tool
   */
  setActiveTool(toolType: ToolType): void {
    const previousTool = this.activeTool
    
    this.toolManager.setActiveTool(toolType)
    this.activeTool = toolType
    
    // Emit tool activation event
    this.eventBus.emit({
      type: 'tool:activated',
      toolType,
      previousTool,
      source: 'ToolController'
    } as any)
  }

  /**
   * Get the current active tool type
   */
  getActiveTool(): ToolType {
    return this.activeTool
  }

  /**
   * Get the current cursor for the active tool
   */
  getCurrentCursor(): string {
    return this.toolManager.getCurrentCursor()
  }

  /**
   * Handle pointer down events
   */
  handlePointerDown(event: PointerEventData, canvas: CanvasState): void {
    this.isToolActive = true
    
    // Emit tool interaction event
    this.eventBus.emit({
      type: 'tool:interaction',
      toolType: this.activeTool,
      action: 'start',
      point: event.point,
      modifiers: {
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey
      },
      source: 'ToolController'
    } as any)
    
    this.toolManager.handlePointerDown(event, canvas)
  }

  /**
   * Handle pointer move events
   */
  handlePointerMove(event: PointerEventData, canvas: CanvasState): void {
    if (this.isToolActive) {
      this.eventBus.emit({
        type: 'tool:interaction',
        toolType: this.activeTool,
        action: 'move',
        point: event.point,
        modifiers: {
          shiftKey: event.shiftKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey
        },
        source: 'ToolController'
      } as any)
    }
    
    this.toolManager.handlePointerMove(event, canvas)
  }

  /**
   * Handle pointer up events
   */
  handlePointerUp(event: PointerEventData, canvas: CanvasState): void {
    if (this.isToolActive) {
      this.eventBus.emit({
        type: 'tool:interaction',
        toolType: this.activeTool,
        action: 'end',
        point: event.point,
        modifiers: {
          shiftKey: event.shiftKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey
        },
        source: 'ToolController'
      } as any)
    }
    
    this.isToolActive = false
    this.toolManager.handlePointerUp(event, canvas)
  }

  /**
   * Cancel current tool operation
   */
  cancelCurrentOperation(): void {
    if (this.isToolActive) {
      this.eventBus.emit({
        type: 'tool:interaction',
        toolType: this.activeTool,
        action: 'cancel',
        point: { x: 0, y: 0 },
        modifiers: {
          shiftKey: false,
          ctrlKey: false,
          altKey: false
        },
        source: 'ToolController'
      } as any)
    }
    
    this.isToolActive = false
    // TODO: Cancel current tool operation
  }

  /**
   * Undo last command
   */
  async undo(): Promise<void> {
    await this.commandManager.undo()
  }

  /**
   * Redo last undone command
   */
  async redo(): Promise<void> {
    await this.commandManager.redo()
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.commandManager.canUndo()
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.commandManager.canRedo()
  }

  /**
   * Get undo description
   */
  getUndoDescription(): string | null {
    return this.commandManager.getUndoDescription()
  }

  /**
   * Get redo description
   */
  getRedoDescription(): string | null {
    return this.commandManager.getRedoDescription()
  }

  /**
   * Start a batch of operations
   */
  startBatch(description: string): void {
    this.commandManager.startBatch(description)
  }

  /**
   * Finish the current batch
   */
  async finishBatch(): Promise<void> {
    await this.commandManager.finishBatch()
  }

  /**
   * Handle tool interaction events
   */
  private handleToolInteraction(event: any): void {
    // This method can be used to coordinate between different tools
    // or implement cross-tool functionality
  }

  /**
   * Get tool statistics
   */
  getStats(): {
    activeTool: ToolType
    isToolActive: boolean
    availableTools: string[]
    commandHistory: { total: number, commandCount: number }
  } {
    return {
      activeTool: this.activeTool,
      isToolActive: this.isToolActive,
      availableTools: this.toolManager.getToolTypes(),
      commandHistory: this.commandManager.getMemoryUsage()
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.toolManager.destroy()
    this.commandManager.clearHistory()
    this.eventBus.removeAllListeners()
  }
}

/**
 * Enhanced Rectangle Tool that uses commands and events
 */
class EnhancedRectangleTool extends RectangleTool {
  constructor(
    private commandFactory: AnnotationCommandFactory,
    private eventBus: EventBus,
    dispatch: AppDispatch
  ) {
    super(dispatch)
  }

  // Override the dispatch behavior to use commands
  // This is a simplified approach for the demo
}

/**
 * Enhanced Pen Tool that uses commands and events
 */
class EnhancedPenTool extends PenTool {
  constructor(
    private commandFactory: AnnotationCommandFactory,
    private eventBus: EventBus,
    dispatch: AppDispatch
  ) {
    super(dispatch)
  }

  // Override the dispatch behavior to use commands
  // This is a simplified approach for the demo
} 