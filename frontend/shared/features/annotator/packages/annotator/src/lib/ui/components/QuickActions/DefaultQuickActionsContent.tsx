import { useEditor, useValue } from '@annotator/editor'
import {
	useCanRedo,
	useCanUndo,
	useIsInSelectState,
	useUnlockedSelectedShapesCount,
} from '../../hooks/menu-hooks'
import { useReadonly } from '../../hooks/useReadonly'
import { AnnotatorUiMenuActionItem } from '../primitives/menus/AnnotatorUiMenuActionItem'

/** @public @react */
export function DefaultQuickActionsContent() {
	const editor = useEditor()

	const isReadonlyMode = useReadonly()

	const isInAcceptableReadonlyState = useValue(
		'should display quick actions',
		() => editor.isInAny('select', 'hand', 'zoom'),
		[editor]
	)

	if (isReadonlyMode && !isInAcceptableReadonlyState) return

	return (
		<>
			<UndoRedoGroup />
			<DeleteDuplicateGroup />
		</>
	)
}

function DeleteDuplicateGroup() {
	const oneSelected = useUnlockedSelectedShapesCount(1)
	const isInSelectState = useIsInSelectState()
	const selectDependentActionsEnabled = oneSelected && isInSelectState
	return (
		<>
			<AnnotatorUiMenuActionItem actionId="delete" disabled={!selectDependentActionsEnabled} />
			<AnnotatorUiMenuActionItem actionId="duplicate" disabled={!selectDependentActionsEnabled} />
		</>
	)
}

function UndoRedoGroup() {
	const canUndo = useCanUndo()
	const canRedo = useCanRedo()
	return (
		<>
			<AnnotatorUiMenuActionItem actionId="undo" disabled={!canUndo} />
			<AnnotatorUiMenuActionItem actionId="redo" disabled={!canRedo} />
		</>
	)
}
