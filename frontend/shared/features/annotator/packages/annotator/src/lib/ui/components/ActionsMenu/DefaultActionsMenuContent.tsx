import { useEditor, useValue } from '@annotator/editor'
import { PORTRAIT_BREAKPOINT } from '../../constants'
import { useBreakpoint } from '../../context/breakpoints'
import {
	useAllowGroup,
	useAllowUngroup,
	useHasLinkShapeSelected,
	useIsInSelectState,
	useThreeStackableItems,
	useUnlockedSelectedShapesCount,
} from '../../hooks/menu-hooks'
import { AnnotatorUiMenuActionItem } from '../primitives/menus/AnnotatorUiMenuActionItem'

/** @public @react */
export function DefaultActionsMenuContent() {
	return (
		<>
			<AlignMenuItems />
			<DistributeMenuItems />
			<StackMenuItems />
			<ReorderMenuItems />
			<ZoomOrRotateMenuItem />
			<RotateCWMenuItem />
			<EditLinkMenuItem />
			<GroupOrUngroupMenuItem />
		</>
	)
}

/** @public @react */
export function AlignMenuItems() {
	const twoSelected = useUnlockedSelectedShapesCount(2)
	const isInSelectState = useIsInSelectState()
	const enabled = twoSelected && isInSelectState

	return (
		<>
			<AnnotatorUiMenuActionItem actionId="align-left" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="align-center-horizontal" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="align-right" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="stretch-horizontal" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="align-top" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="align-center-vertical" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="align-bottom" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="stretch-vertical" disabled={!enabled} />
		</>
	)
}

/** @public @react */
export function DistributeMenuItems() {
	const threeSelected = useUnlockedSelectedShapesCount(3)
	const isInSelectState = useIsInSelectState()
	const enabled = threeSelected && isInSelectState

	return (
		<>
			<AnnotatorUiMenuActionItem actionId="distribute-horizontal" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="distribute-vertical" disabled={!enabled} />
		</>
	)
}

/** @public @react */
export function StackMenuItems() {
	const threeStackableItems = useThreeStackableItems()
	const isInSelectState = useIsInSelectState()
	const enabled = threeStackableItems && isInSelectState

	return (
		<>
			<AnnotatorUiMenuActionItem actionId="stack-horizontal" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="stack-vertical" disabled={!enabled} />
		</>
	)
}

/** @public @react */
export function ReorderMenuItems() {
	const oneSelected = useUnlockedSelectedShapesCount(1)
	const isInSelectState = useIsInSelectState()
	const enabled = oneSelected && isInSelectState

	return (
		<>
			<AnnotatorUiMenuActionItem actionId="send-to-back" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="send-backward" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="bring-forward" disabled={!enabled} />
			<AnnotatorUiMenuActionItem actionId="bring-to-front" disabled={!enabled} />
		</>
	)
}

/** @public @react */

export function ZoomOrRotateMenuItem() {
	const breakpoint = useBreakpoint()
	return breakpoint < PORTRAIT_BREAKPOINT.TABLET_SM ? <ZoomTo100MenuItem /> : <RotateCCWMenuItem />
}
/** @public @react */

export function ZoomTo100MenuItem() {
	const editor = useEditor()
	const isZoomedTo100 = useValue('zoom is 1', () => editor.getZoomLevel() === 1, [editor])

	return <AnnotatorUiMenuActionItem actionId="zoom-to-100" disabled={isZoomedTo100} />
}
/** @public @react */

export function RotateCCWMenuItem() {
	const oneSelected = useUnlockedSelectedShapesCount(1)
	const isInSelectState = useIsInSelectState()
	const enabled = oneSelected && isInSelectState

	return <AnnotatorUiMenuActionItem actionId="rotate-ccw" disabled={!enabled} />
}
/** @public @react */

export function RotateCWMenuItem() {
	const oneSelected = useUnlockedSelectedShapesCount(1)
	const isInSelectState = useIsInSelectState()
	const enabled = oneSelected && isInSelectState

	return <AnnotatorUiMenuActionItem actionId="rotate-cw" disabled={!enabled} />
}
/** @public @react */

export function EditLinkMenuItem() {
	const showEditLink = useHasLinkShapeSelected()
	const isInSelectState = useIsInSelectState()
	const enabled = showEditLink && isInSelectState

	return <AnnotatorUiMenuActionItem actionId="edit-link" disabled={!enabled} />
}
/** @public @react */

export function GroupOrUngroupMenuItem() {
	const allowGroup = useAllowGroup()
	const allowUngroup = useAllowUngroup()
	return allowGroup ? <GroupMenuItem /> : allowUngroup ? <UngroupMenuItem /> : <GroupMenuItem />
}
/** @public @react */

export function GroupMenuItem() {
	const twoSelected = useUnlockedSelectedShapesCount(2)
	const isInSelectState = useIsInSelectState()
	const enabled = twoSelected && isInSelectState

	return <AnnotatorUiMenuActionItem actionId="group" disabled={!enabled} />
}
/** @public @react */

export function UngroupMenuItem() {
	return <AnnotatorUiMenuActionItem actionId="ungroup" />
}
