import { ICommand, IBatchCommand } from './ICommand'
import { nanoid } from '@reduxjs/toolkit'

/**
 * CommandManager handles command execution, undo/redo, and batching
 * Replaces direct Redux dispatch with command pattern for better undo/redo support
 */
export class CommandManager {
  private history: ICommand[] = []
  private historyIndex: number = -1
  private readonly maxHistorySize: number = 100
  private readonly maxMemoryUsage: number = 50 * 1024 * 1024 // 50MB
  
  // Batching support
  private currentBatch?: IBatchCommand
  private readonly mergingTimeWindow: number = 500 // 500ms window for merging commands
  
  // Event listeners
  private listeners: Map<string, Array<(event: CommandEvent) => void>> = new Map()

  /**
   * Execute a command and add it to history
   */
  async executeCommand(command: ICommand): Promise<void> {
    try {
      // If we're in the middle of history, clear future commands
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }
      
      // Try to merge with the last command if possible
      const lastCommand = this.getLastCommand()
      if (lastCommand && command.canMergeWith?.(lastCommand)) {
        const mergedCommand = lastCommand.mergeWith!(command)
        this.history[this.historyIndex] = mergedCommand
        await mergedCommand.execute()
      } else {
        // Add to batch if one is active
        if (this.currentBatch) {
          this.currentBatch.addCommand(command)
          await command.execute()
          return
        }
        
        // Execute and add to history
        await command.execute()
        this.history.push(command)
        this.historyIndex++
        
        // Trim history if needed
        this.trimHistory()
      }
      
      this.emitEvent('commandExecuted', { command, canUndo: this.canUndo(), canRedo: this.canRedo() })
    } catch (error) {
      console.error('Command execution failed:', error)
      this.emitEvent('commandFailed', { command, error })
      throw error
    }
  }

  /**
   * Undo the last command
   */
  async undo(): Promise<void> {
    if (!this.canUndo()) return
    
    try {
      const command = this.history[this.historyIndex]
      await command.undo()
      this.historyIndex--
      
      this.emitEvent('commandUndone', { command, canUndo: this.canUndo(), canRedo: this.canRedo() })
    } catch (error) {
      console.error('Undo failed:', error)
      this.emitEvent('undoFailed', { error })
      throw error
    }
  }

  /**
   * Redo the next command
   */
  async redo(): Promise<void> {
    if (!this.canRedo()) return
    
    try {
      this.historyIndex++
      const command = this.history[this.historyIndex]
      await command.execute()
      
      this.emitEvent('commandRedone', { command, canUndo: this.canUndo(), canRedo: this.canRedo() })
    } catch (error) {
      console.error('Redo failed:', error)
      this.historyIndex-- // Rollback on failure
      this.emitEvent('redoFailed', { error })
      throw error
    }
  }

  /**
   * Start a batch of commands
   */
  startBatch(description: string = 'Batch operation'): void {
    if (this.currentBatch) {
      console.warn('Batch already started, finishing previous batch')
      this.finishBatch()
    }
    
    this.currentBatch = new BatchCommand(nanoid(), description)
  }

  /**
   * Finish the current batch and add it to history
   */
  async finishBatch(): Promise<void> {
    if (!this.currentBatch) return
    
    const batch = this.currentBatch
    this.currentBatch = undefined
    
    if (!batch.isEmpty()) {
      await this.executeCommand(batch)
    }
  }

  /**
   * Cancel the current batch without executing
   */
  cancelBatch(): void {
    this.currentBatch = undefined
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.historyIndex >= 0
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  /**
   * Get undo description
   */
  getUndoDescription(): string | null {
    if (!this.canUndo()) return null
    return `Undo ${this.history[this.historyIndex].description}`
  }

  /**
   * Get redo description
   */
  getRedoDescription(): string | null {
    if (!this.canRedo()) return null
    return `Redo ${this.history[this.historyIndex + 1].description}`
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = []
    this.historyIndex = -1
    this.currentBatch = undefined
    
    this.emitEvent('historyCleared', { canUndo: false, canRedo: false })
  }

  /**
   * Get current history state for persistence
   */
  getHistoryState(): { commands: ICommand[], index: number } {
    return {
      commands: [...this.history],
      index: this.historyIndex
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event: string, listener: (event: CommandEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: string, listener: (event: CommandEvent) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index !== -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): { total: number, commandCount: number } {
    let total = 0
    this.history.forEach(command => {
      total += command.getMemoryUsage?.() || 1024 // Default 1KB per command
    })
    
    return {
      total,
      commandCount: this.history.length
    }
  }

  /**
   * Cleanup old commands if memory usage is too high
   */
  private trimHistory(): void {
    // Trim by count
    if (this.history.length > this.maxHistorySize) {
      const excess = this.history.length - this.maxHistorySize
      this.history.splice(0, excess)
      this.historyIndex = Math.max(0, this.historyIndex - excess)
    }
    
    // Trim by memory usage
    const memoryUsage = this.getMemoryUsage()
    if (memoryUsage.total > this.maxMemoryUsage) {
      // Remove oldest commands until under memory limit
      while (this.history.length > 1 && this.getMemoryUsage().total > this.maxMemoryUsage * 0.8) {
        this.history.shift()
        this.historyIndex = Math.max(-1, this.historyIndex - 1)
      }
    }
  }

  /**
   * Get the last command in history
   */
  private getLastCommand(): ICommand | undefined {
    return this.historyIndex >= 0 ? this.history[this.historyIndex] : undefined
  }

  /**
   * Emit an event to listeners
   */
  private emitEvent(eventType: string, data: any): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener({ type: eventType, data })
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }
}

/**
 * Batch command implementation
 */
class BatchCommand implements IBatchCommand {
  public readonly commands: ICommand[] = []

  constructor(
    public readonly id: string,
    public readonly description: string
  ) {}

  addCommand(command: ICommand): void {
    this.commands.push(command)
  }

  isEmpty(): boolean {
    return this.commands.length === 0
  }

  async execute(): Promise<void> {
    for (const command of this.commands) {
      await command.execute()
    }
  }

  async undo(): Promise<void> {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      await this.commands[i].undo()
    }
  }

  getMemoryUsage(): number {
    return this.commands.reduce((total, cmd) => total + (cmd.getMemoryUsage?.() || 1024), 0)
  }

  get operationType() {
    return 'batch' as const
  }

  get affectedIds(): string[] {
    const ids = new Set<string>()
    this.commands.forEach(cmd => {
      if ('affectedIds' in cmd && Array.isArray((cmd as any).affectedIds)) {
        (cmd as any).affectedIds.forEach((id: string) => ids.add(id))
      }
    })
    return Array.from(ids)
  }
}

/**
 * Command event types
 */
export interface CommandEvent {
  type: string
  data: any
}

// Global command manager instance
export const globalCommandManager = new CommandManager() 