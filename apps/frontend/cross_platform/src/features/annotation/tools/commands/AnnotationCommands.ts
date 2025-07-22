import { nanoid } from '@reduxjs/toolkit'
import { IAnnotationCommand } from './ICommand'
import type { 
  AnnotationShape, 
  AnnotationGroup, 
  CreateShapePayload, 
  UpdateShapePayload,
  CreateGroupPayload,
  UpdateGroupPayload 
} from '../../lib/types'
import type { AppDispatch } from '../../../../store'
import { 
  addShape, 
  updateShape, 
  deleteShape,
  addGroup,
  updateGroup,
  deleteGroup,
  groupShapes,
  ungroupShapes
} from '../../../../store/annotationSlice'

/**
 * Base class for annotation commands that interact with Redux store
 */
abstract class BaseAnnotationCommand implements IAnnotationCommand {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly operationType: 'create' | 'update' | 'delete' | 'group' | 'ungroup' | 'move',
    public readonly affectedIds: string[],
    protected readonly dispatch: AppDispatch
  ) {}

  abstract execute(): Promise<void> | void
  abstract undo(): Promise<void> | void

  getMemoryUsage(): number {
    // Estimate based on affected entities
    return this.affectedIds.length * 2048 + 1024 // ~2KB per affected item + 1KB base
  }
}

/**
 * Command to create a new shape
 */
export class CreateShapeCommand extends BaseAnnotationCommand {
  private shapeSnapshot?: AnnotationShape

  constructor(
    private readonly shapeData: CreateShapePayload['shape'],
    dispatch: AppDispatch,
    description?: string
  ) {
    const id = nanoid()
    super(
      id,
      description || `Create ${shapeData.type}`,
      'create',
      [id], // We'll update this after creation
      dispatch
    )
  }

  execute(): void {
    const result = this.dispatch(addShape({ shape: this.shapeData }))
    
    // Store the created shape for undo
    // Note: In a real implementation, we'd get the shape ID from the action result
    // For now, we'll simulate it
    this.shapeSnapshot = {
      ...this.shapeData,
      id: this.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as AnnotationShape
    
    // Update affected IDs with the actual shape ID
    ;(this.affectedIds as string[]).splice(0, 1, this.shapeSnapshot.id)
  }

  undo(): void {
    if (this.shapeSnapshot) {
      this.dispatch(deleteShape(this.shapeSnapshot.id))
    }
  }

  getCreatedShapeId(): string | undefined {
    return this.shapeSnapshot?.id
  }
}

/**
 * Command to update an existing shape
 */
export class UpdateShapeCommand extends BaseAnnotationCommand {
  private previousState?: Partial<AnnotationShape>
  private currentState?: Partial<AnnotationShape>

  constructor(
    private readonly shapeId: string,
    private readonly updates: Partial<AnnotationShape>,
    private readonly beforeState: Partial<AnnotationShape>,
    dispatch: AppDispatch,
    description?: string
  ) {
    super(
      nanoid(),
      description || 'Update shape',
      'update',
      [shapeId],
      dispatch
    )
    this.previousState = beforeState
    this.currentState = updates
  }

  execute(): void {
    this.dispatch(updateShape({ 
      id: this.shapeId, 
      updates: this.currentState!
    }))
  }

  undo(): void {
    this.dispatch(updateShape({ 
      id: this.shapeId, 
      updates: this.previousState!
    }))
  }

  canMergeWith(other: IAnnotationCommand): boolean {
    return other instanceof UpdateShapeCommand && 
           other.affectedIds[0] === this.affectedIds[0] &&
           other.operationType === 'update'
  }

  mergeWith(other: IAnnotationCommand): UpdateShapeCommand {
    if (!(other instanceof UpdateShapeCommand)) {
      throw new Error('Cannot merge with non-UpdateShapeCommand')
    }
    
    return new UpdateShapeCommand(
      this.shapeId,
      { ...this.currentState, ...other.currentState },
      this.previousState!, // Keep the original previous state
      this.dispatch,
      `${this.description} (merged)`
    )
  }
}

/**
 * Command to delete a shape
 */
export class DeleteShapeCommand extends BaseAnnotationCommand {
  private deletedShape?: AnnotationShape

  constructor(
    private readonly shapeId: string,
    private readonly shapeData: AnnotationShape,
    dispatch: AppDispatch,
    description?: string
  ) {
    super(
      nanoid(),
      description || `Delete ${shapeData.type}`,
      'delete',
      [shapeId],
      dispatch
    )
    this.deletedShape = shapeData
  }

  execute(): void {
    this.dispatch(deleteShape(this.shapeId))
  }

  undo(): void {
    if (this.deletedShape) {
      // Recreate the shape with original data
      this.dispatch(addShape({ 
        shape: {
          ...this.deletedShape,
          id: undefined // Let Redux generate new ID
        } as any
      }))
    }
  }
}

/**
 * Command to create a group
 */
export class CreateGroupCommand extends BaseAnnotationCommand {
  private groupSnapshot?: AnnotationGroup

  constructor(
    private readonly groupData: CreateGroupPayload,
    dispatch: AppDispatch,
    description?: string
  ) {
    const id = nanoid()
    super(
      id,
      description || `Create group "${groupData.name}"`,
      'group',
      [id],
      dispatch
    )
  }

  execute(): void {
    this.dispatch(addGroup(this.groupData))
    
    // Store snapshot for undo
    this.groupSnapshot = {
      ...this.groupData,
      id: this.id,
      childIds: [],
      isExpanded: this.groupData.isExpanded ?? true,
      color: this.groupData.color ?? '#64748b',
      isVisible: this.groupData.isVisible ?? true,
      metadata: this.groupData.metadata ?? {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as AnnotationGroup
  }

  undo(): void {
    if (this.groupSnapshot) {
      this.dispatch(deleteGroup(this.groupSnapshot.id))
    }
  }
}

/**
 * Command to group shapes together
 */
export class GroupShapesCommand extends BaseAnnotationCommand {
  private originalGroupStates: Map<string, string | undefined> = new Map()

  constructor(
    private readonly shapeIds: string[],
    private readonly groupName: string,
    dispatch: AppDispatch,
    description?: string
  ) {
    super(
      nanoid(),
      description || `Group ${shapeIds.length} shapes`,
      'group',
      shapeIds,
      dispatch
    )
  }

  execute(): void {
    // Store original group states for undo
    // Note: In real implementation, we'd get this from the current store state
    this.shapeIds.forEach(id => {
      this.originalGroupStates.set(id, undefined) // Assume shapes are ungrouped
    })
    
    this.dispatch(groupShapes({
      shapeIds: this.shapeIds,
      groupName: this.groupName
    }))
  }

  undo(): void {
    // Ungroup the shapes and restore their original group states
    this.dispatch(ungroupShapes(this.id)) // Use command ID as group ID
    
    // TODO: Restore original group memberships
    // This would require additional logic to move shapes back to their original groups
  }
}

/**
 * Command to ungroup shapes
 */
export class UngroupShapesCommand extends BaseAnnotationCommand {
  private originalGroupData?: AnnotationGroup
  private childShapeIds: string[] = []

  constructor(
    private readonly groupId: string,
    private readonly groupData: AnnotationGroup,
    dispatch: AppDispatch,
    description?: string
  ) {
    super(
      nanoid(),
      description || `Ungroup "${groupData.name}"`,
      'ungroup',
      [groupId, ...groupData.childIds],
      dispatch
    )
    this.originalGroupData = groupData
    this.childShapeIds = [...groupData.childIds]
  }

  execute(): void {
    this.dispatch(ungroupShapes(this.groupId))
  }

  undo(): void {
    if (this.originalGroupData) {
      // Recreate the group
      this.dispatch(addGroup({
        name: this.originalGroupData.name,
        parentId: this.originalGroupData.parentId,
        isExpanded: this.originalGroupData.isExpanded,
        color: this.originalGroupData.color,
        isVisible: this.originalGroupData.isVisible,
        metadata: this.originalGroupData.metadata
      }))
      
      // Re-group the shapes
      this.dispatch(groupShapes({
        shapeIds: this.childShapeIds,
        groupName: this.originalGroupData.name
      }))
    }
  }
}

/**
 * Command factory for creating commands with proper context
 */
export class AnnotationCommandFactory {
  constructor(private readonly dispatch: AppDispatch) {}

  createShape(shapeData: CreateShapePayload['shape'], description?: string): CreateShapeCommand {
    return new CreateShapeCommand(shapeData, this.dispatch, description)
  }

  updateShape(
    shapeId: string, 
    updates: Partial<AnnotationShape>, 
    beforeState: Partial<AnnotationShape>,
    description?: string
  ): UpdateShapeCommand {
    return new UpdateShapeCommand(shapeId, updates, beforeState, this.dispatch, description)
  }

  deleteShape(shapeId: string, shapeData: AnnotationShape, description?: string): DeleteShapeCommand {
    return new DeleteShapeCommand(shapeId, shapeData, this.dispatch, description)
  }

  createGroup(groupData: CreateGroupPayload, description?: string): CreateGroupCommand {
    return new CreateGroupCommand(groupData, this.dispatch, description)
  }

  groupShapes(shapeIds: string[], groupName: string, description?: string): GroupShapesCommand {
    return new GroupShapesCommand(shapeIds, groupName, this.dispatch, description)
  }

  ungroupShapes(groupId: string, groupData: AnnotationGroup, description?: string): UngroupShapesCommand {
    return new UngroupShapesCommand(groupId, groupData, this.dispatch, description)
  }
} 