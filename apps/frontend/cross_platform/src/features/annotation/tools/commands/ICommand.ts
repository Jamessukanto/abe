/**
 * Command pattern interface for undoable operations
 * Follows Figma/Sketch pattern for undo/redo functionality
 */
export interface ICommand {
  /**
   * Unique identifier for the command
   */
  readonly id: string
  
  /**
   * Human-readable description for undo/redo UI
   */
  readonly description: string
  
  /**
   * Execute the command
   */
  execute(): Promise<void> | void
  
  /**
   * Undo the command
   */
  undo(): Promise<void> | void
  
  /**
   * Check if this command can be merged with another command
   * Used for combining similar operations (e.g., multiple moves)
   */
  canMergeWith?(other: ICommand): boolean
  
  /**
   * Merge with another command
   */
  mergeWith?(other: ICommand): ICommand
  
  /**
   * Get memory usage estimation for cleanup
   */
  getMemoryUsage?(): number
}

/**
 * Command that modifies annotation data
 */
export interface IAnnotationCommand extends ICommand {
  /**
   * The type of annotation operation
   */
  readonly operationType: 'create' | 'update' | 'delete' | 'group' | 'ungroup' | 'move'
  
  /**
   * IDs of affected shapes/groups
   */
  readonly affectedIds: string[]
}

/**
 * Batch command that combines multiple commands
 */
export interface IBatchCommand extends ICommand {
  /**
   * Child commands in execution order
   */
  readonly commands: ICommand[]
  
  /**
   * Add a command to the batch
   */
  addCommand(command: ICommand): void
  
  /**
   * Check if batch is empty
   */
  isEmpty(): boolean
} 