import {
	TLBookmarkShape,

	TLFrameShape,
	TLImageShape,
	TLPageId,
	useEditor,
	useValue,
} from '@annotator/editor'

import { useUiEvents } from '../context/events'
import { useToasts } from '../context/toasts'
import {
	showMenuPaste,
	useAllowGroup,
	useAllowUngroup,
	useAnySelectedShapesCount,
	useHasLinkShapeSelected,
	useOnlyFlippableShape,
	useShowAutoSizeToggle,
	useThreeStackableItems,
	useUnlockedSelectedShapesCount,
} from '../hooks/menu-hooks'

import { useReadonly } from '../hooks/useReadonly'
import { AnnotatorUiMenuActionCheckboxItem } from './primitives/menus/AnnotatorUiMenuActionCheckboxItem'
import { AnnotatorUiMenuActionItem } from './primitives/menus/AnnotatorUiMenuActionItem'
import { AnnotatorUiMenuGroup } from './primitives/menus/AnnotatorUiMenuGroup'
import { AnnotatorUiMenuItem } from './primitives/menus/AnnotatorUiMenuItem'
import { AnnotatorUiMenuSubmenu } from './primitives/menus/AnnotatorUiMenuSubmenu'

/* -------------------- Selection ------------------- */

/** @public @react */
export function ToggleAutoSizeMenuItem() {
	const shouldDisplay = useShowAutoSizeToggle()
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="toggle-auto-size" />
}

/** @public @react */
export function EditLinkMenuItem() {
	const shouldDisplay = useHasLinkShapeSelected()
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="edit-link" />
}

/** @public @react */
export function DuplicateMenuItem() {
	const shouldDisplay = useUnlockedSelectedShapesCount(1)
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="duplicate" />
}

/** @public @react */
export function FlattenMenuItem() {
	const editor = useEditor()
	const shouldDisplay = useValue(
		'should display flatten option',
		() => {
			const selectedShapeIds = editor.getSelectedShapeIds()
			if (selectedShapeIds.length === 0) return false
			const onlySelectedShape = editor.getOnlySelectedShape()
			if (onlySelectedShape && editor.isShapeOfType<TLImageShape>(onlySelectedShape, 'image')) {
				return false
			}
			return true
		},
		[editor]
	)
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="flatten-to-image" />
}



/** @public @react */
export function GroupMenuItem() {
	const shouldDisplay = useAllowGroup()
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="group" />
}

/** @public @react */
export function UngroupMenuItem() {
	const shouldDisplay = useAllowUngroup()
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="ungroup" />
}

/** @public @react */
export function RemoveFrameMenuItem() {
	const editor = useEditor()
	const shouldDisplay = useValue(
		'allow unframe',
		() => {
			const selectedShapes = editor.getSelectedShapes()
			if (selectedShapes.length === 0) return false
			return selectedShapes.every((shape) => editor.isShapeOfType<TLFrameShape>(shape, 'frame'))
		},
		[editor]
	)
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="remove-frame" />
}

/** @public @react */
export function FitFrameToContentMenuItem() {
	const editor = useEditor()
	const shouldDisplay = useValue(
		'allow fit frame to content',
		() => {
			const onlySelectedShape = editor.getOnlySelectedShape()
			if (!onlySelectedShape) return false
			return (
				editor.isShapeOfType<TLFrameShape>(onlySelectedShape, 'frame') &&
				editor.getSortedChildIdsForParent(onlySelectedShape).length > 0
			)
		},
		[editor]
	)
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="fit-frame-to-content" />
}

/** @public @react */
export function ToggleLockMenuItem() {
	const editor = useEditor()
	const shouldDisplay = useValue('selected shapes', () => editor.getSelectedShapes().length > 0, [
		editor,
	])
	if (!shouldDisplay) return null

	return <AnnotatorUiMenuActionItem actionId="toggle-lock" />
}

/** @public @react */
export function ToggleTransparentBgMenuItem() {
	const editor = useEditor()
	const isTransparentBg = useValue(
		'isTransparentBg',
		() => !editor.getInstanceState().exportBackground,
		[editor]
	)

	return (
		<AnnotatorUiMenuActionCheckboxItem
			actionId="toggle-transparent"
			checked={isTransparentBg}
			toggle
		/>
	)
}

/** @public @react */
export function UnlockAllMenuItem() {
	const editor = useEditor()
	const shouldDisplay = useValue('any shapes', () => editor.getCurrentPageShapeIds().size > 0, [
		editor,
	])

	return <AnnotatorUiMenuActionItem actionId="unlock-all" disabled={!shouldDisplay} />
}

/* ---------------------- Zoom ---------------------- */

/** @public @react */
export function ZoomTo100MenuItem() {
	const editor = useEditor()
	const isZoomedTo100 = useValue('zoomed to 100', () => editor.getZoomLevel() === 1, [editor])

	return <AnnotatorUiMenuActionItem actionId="zoom-to-100" noClose disabled={isZoomedTo100} />
}

/** @public @react */
export function ZoomToFitMenuItem() {
	const editor = useEditor()
	const hasShapes = useValue('has shapes', () => editor.getCurrentPageShapeIds().size > 0, [editor])

	return (
		<AnnotatorUiMenuActionItem
			actionId="zoom-to-fit"
			disabled={!hasShapes}
			data-testid="minimap.zoom-menu.zoom-to-fit"
			noClose
		/>
	)
}

/** @public @react */
export function ZoomToSelectionMenuItem() {
	const editor = useEditor()
	const hasSelected = useValue('has shapes', () => editor.getSelectedShapeIds().length > 0, [
		editor,
	])

	return (
		<AnnotatorUiMenuActionItem
			actionId="zoom-to-selection"
			disabled={!hasSelected}
			data-testid="minimap.zoom-menu.zoom-to-selection"
			noClose
		/>
	)
}

/* -------------------- Clipboard ------------------- */

/** @public @react */
export function ClipboardMenuGroup() {
	return (
		<AnnotatorUiMenuGroup id="clipboard">
			<CutMenuItem />
			<CopyMenuItem />
			<PasteMenuItem />
			<DuplicateMenuItem />
			<DeleteMenuItem />
		</AnnotatorUiMenuGroup>
	)
}

/** @public @react */
export function CopyAsMenuGroup() {
	const editor = useEditor()
	const atLeastOneShapeOnPage = useValue(
		'atLeastOneShapeOnPage',
		() => editor.getCurrentPageShapeIds().size > 0,
		[editor]
	)

	return (
		<AnnotatorUiMenuSubmenu
			id="copy-as"
			label="context-menu.copy-as"
			size="small"
			disabled={!atLeastOneShapeOnPage}
		>
			<AnnotatorUiMenuGroup id="copy-as-group">
				<AnnotatorUiMenuActionItem actionId="copy-as-svg" />
				{Boolean(window.navigator.clipboard?.write) && (
					<AnnotatorUiMenuActionItem actionId="copy-as-png" />
				)}
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup id="copy-as-bg">
				<ToggleTransparentBgMenuItem />
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public @react */
export function CutMenuItem() {
	const shouldDisplay = useUnlockedSelectedShapesCount(1)

	return <AnnotatorUiMenuActionItem actionId="cut" disabled={!shouldDisplay} />
}

/** @public @react */
export function CopyMenuItem() {
	const shouldDisplay = useAnySelectedShapesCount(1)

	return <AnnotatorUiMenuActionItem actionId="copy" disabled={!shouldDisplay} />
}

/** @public @react */
export function PasteMenuItem() {
	const shouldDisplay = showMenuPaste

	return <AnnotatorUiMenuActionItem actionId="paste" disabled={!shouldDisplay} />
}

/* ------------------- Conversions ------------------ */

/** @public @react */
export function ConversionsMenuGroup() {
	const editor = useEditor()
	const atLeastOneShapeOnPage = useValue(
		'atLeastOneShapeOnPage',
		() => editor.getCurrentPageShapeIds().size > 0,
		[editor]
	)

	if (!atLeastOneShapeOnPage) return null

	return (
		<AnnotatorUiMenuGroup id="conversions">
			<CopyAsMenuGroup />
			<AnnotatorUiMenuSubmenu id="export-as" label="context-menu.export-as" size="small">
				<AnnotatorUiMenuGroup id="export-as-group">
					<AnnotatorUiMenuActionItem actionId="export-as-svg" />
					<AnnotatorUiMenuActionItem actionId="export-as-png" />
				</AnnotatorUiMenuGroup>
				<AnnotatorUiMenuGroup id="export-as-bg">
					<ToggleTransparentBgMenuItem />
				</AnnotatorUiMenuGroup>
			</AnnotatorUiMenuSubmenu>

		</AnnotatorUiMenuGroup>
	)
}

/* ------------------ Set Selection ----------------- */
/** @public @react */
export function SelectAllMenuItem() {
	const editor = useEditor()
	const atLeastOneShapeOnPage = useValue(
		'atLeastOneShapeOnPage',
		() => editor.getCurrentPageShapeIds().size > 0,
		[editor]
	)

	return <AnnotatorUiMenuActionItem actionId="select-all" disabled={!atLeastOneShapeOnPage} />
}

/* ------------------ Delete Group ------------------ */

/** @public @react */
export function DeleteMenuItem() {
	const oneSelected = useUnlockedSelectedShapesCount(1)

	return <AnnotatorUiMenuActionItem actionId="delete" disabled={!oneSelected} />
}

/* --------------------- Modify --------------------- */

/** @public @react */
export function EditMenuSubmenu() {
	const isReadonlyMode = useReadonly()
	if (!useAnySelectedShapesCount(1)) return null
	if (isReadonlyMode) return null

	return (
		<AnnotatorUiMenuSubmenu id="edit" label="context-menu.edit" size="small">
			<GroupMenuItem />
			<UngroupMenuItem />
			<FlattenMenuItem />
			<EditLinkMenuItem />
			<FitFrameToContentMenuItem />
			<RemoveFrameMenuItem />

			<ConvertToBookmarkMenuItem />
			<ToggleAutoSizeMenuItem />
			<ToggleLockMenuItem />
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public @react */
export function ArrangeMenuSubmenu() {
	const twoSelected = useUnlockedSelectedShapesCount(2)
	const onlyFlippableShapeSelected = useOnlyFlippableShape()
	const isReadonlyMode = useReadonly()

	if (isReadonlyMode) return null
	if (!(twoSelected || onlyFlippableShapeSelected)) return null

	return (
		<AnnotatorUiMenuSubmenu id="arrange" label="context-menu.arrange" size="small">
			{twoSelected && (
				<AnnotatorUiMenuGroup id="align">
					<AnnotatorUiMenuActionItem actionId="align-left" />
					<AnnotatorUiMenuActionItem actionId="align-center-horizontal" />
					<AnnotatorUiMenuActionItem actionId="align-right" />
					<AnnotatorUiMenuActionItem actionId="align-top" />
					<AnnotatorUiMenuActionItem actionId="align-center-vertical" />
					<AnnotatorUiMenuActionItem actionId="align-bottom" />
				</AnnotatorUiMenuGroup>
			)}
			<DistributeMenuGroup />
			{twoSelected && (
				<AnnotatorUiMenuGroup id="stretch">
					<AnnotatorUiMenuActionItem actionId="stretch-horizontal" />
					<AnnotatorUiMenuActionItem actionId="stretch-vertical" />
				</AnnotatorUiMenuGroup>
			)}
			{(twoSelected || onlyFlippableShapeSelected) && (
				<AnnotatorUiMenuGroup id="flip">
					<AnnotatorUiMenuActionItem actionId="flip-horizontal" />
					<AnnotatorUiMenuActionItem actionId="flip-vertical" />
				</AnnotatorUiMenuGroup>
			)}
			<OrderMenuGroup />
		</AnnotatorUiMenuSubmenu>
	)
}

function DistributeMenuGroup() {
	const threeSelected = useUnlockedSelectedShapesCount(3)
	if (!threeSelected) return null

	return (
		<AnnotatorUiMenuGroup id="distribute">
			<AnnotatorUiMenuActionItem actionId="distribute-horizontal" />
			<AnnotatorUiMenuActionItem actionId="distribute-vertical" />
		</AnnotatorUiMenuGroup>
	)
}

function OrderMenuGroup() {
	const twoSelected = useUnlockedSelectedShapesCount(2)
	const threeStackableItems = useThreeStackableItems()
	if (!twoSelected) return null

	return (
		<AnnotatorUiMenuGroup id="order">
			<AnnotatorUiMenuActionItem actionId="pack" />
			{threeStackableItems && <AnnotatorUiMenuActionItem actionId="stack-horizontal" />}
			{threeStackableItems && <AnnotatorUiMenuActionItem actionId="stack-vertical" />}
		</AnnotatorUiMenuGroup>
	)
}

/** @public @react */
export function ReorderMenuSubmenu() {
	const isReadonlyMode = useReadonly()
	const oneSelected = useUnlockedSelectedShapesCount(1)
	if (isReadonlyMode) return null
	if (!oneSelected) return null

	return (
		<AnnotatorUiMenuSubmenu id="reorder" label="context-menu.reorder" size="small">
			<AnnotatorUiMenuGroup id="reorder">
				<AnnotatorUiMenuActionItem actionId="bring-to-front" />
				<AnnotatorUiMenuActionItem actionId="bring-forward" />
				<AnnotatorUiMenuActionItem actionId="send-backward" />
				<AnnotatorUiMenuActionItem actionId="send-to-back" />
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public @react */
export function MoveToPageMenu() {
	const editor = useEditor()
	const pages = useValue('pages', () => editor.getPages(), [editor])
	const currentPageId = useValue('current page id', () => editor.getCurrentPageId(), [editor])
	const { addToast } = useToasts()
	const trackEvent = useUiEvents()
	const isReadonlyMode = useReadonly()
	const oneSelected = useUnlockedSelectedShapesCount(1)

	if (!oneSelected) return null
	if (isReadonlyMode) return null

	return (
		<AnnotatorUiMenuSubmenu id="move-to-page" label="context-menu.move-to-page" size="small">
			<AnnotatorUiMenuGroup id="pages">
				{pages.map((page) => (
					<AnnotatorUiMenuItem
						id={page.id}
						key={page.id}
						disabled={currentPageId === page.id}
						label={page.name.length > 30 ? `${page.name.slice(0, 30)}…` : page.name}
						onSelect={() => {
							editor.markHistoryStoppingPoint('move_shapes_to_page')
							editor.moveShapesToPage(editor.getSelectedShapeIds(), page.id as TLPageId)

							const toPage = editor.getPage(page.id)

							if (toPage) {
								addToast({
									title: 'Changed Page',
									description: `Moved to ${toPage.name}.`,
									actions: [
										{
											label: 'Go Back',
											type: 'primary',
											onClick: () => {
												editor.markHistoryStoppingPoint('change-page')
												editor.setCurrentPage(currentPageId)
											},
										},
									],
								})
							}
							trackEvent('move-to-page', { source: 'context-menu' })
						}}
					/>
				))}
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup id="new-page">
				<AnnotatorUiMenuActionItem actionId="move-to-new-page" />
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public @react */
export function ConvertToBookmarkMenuItem() {
	const editor = useEditor()

	const oneEmbedSelected = useValue(
		'oneEmbedSelected',
		() => {
			const onlySelectedShape = editor.getOnlySelectedShape()
			if (!onlySelectedShape) return false
			return !!(
				false &&
				onlySelectedShape.props.url &&
				!editor.isShapeOrAncestorLocked(onlySelectedShape)
			)
		},
		[editor]
	)

	if (!oneEmbedSelected) return null

	return <AnnotatorUiMenuActionItem actionId="convert-to-bookmark" />
}



/* ------------------- Preferences ------------------ */

/** @public @react */
export function ToggleSnapModeItem() {
	const editor = useEditor()
	const isSnapMode = useValue('isSnapMode', () => editor.user.getIsSnapMode(), [editor])

	return <AnnotatorUiMenuActionCheckboxItem actionId="toggle-snap-mode" checked={isSnapMode} />
}

/** @public @react */
export function ToggleToolLockItem() {
	const editor = useEditor()
	const isToolLock = useValue('isToolLock', () => editor.getInstanceState().isToolLocked, [editor])

	return <AnnotatorUiMenuActionCheckboxItem actionId="toggle-tool-lock" checked={isToolLock} />
}

/** @public @react */
export function ToggleGridItem() {
	const editor = useEditor()
	const isGridMode = useValue('isGridMode', () => editor.getInstanceState().isGridMode, [editor])

	return <AnnotatorUiMenuActionCheckboxItem actionId="toggle-grid" checked={isGridMode} />
}

/** @public @react */
export function ToggleWrapModeItem() {
	const editor = useEditor()
	const isWrapMode = useValue('isWrapMode', () => editor.user.getIsWrapMode(), [editor])

	return <AnnotatorUiMenuActionCheckboxItem actionId="toggle-wrap-mode" checked={isWrapMode} />
}

/** @public @react */
export function ToggleDarkModeItem() {
	const editor = useEditor()
	const isDarkMode = useValue('isDarkMode', () => editor.user.getIsDarkMode(), [editor])

	return <AnnotatorUiMenuActionCheckboxItem actionId="toggle-dark-mode" checked={isDarkMode} />
}

/** @public @react */
export function ToggleFocusModeItem() {
	const editor = useEditor()
	const isFocusMode = useValue('isFocusMode', () => editor.getInstanceState().isFocusMode, [editor])

	return <AnnotatorUiMenuActionCheckboxItem actionId="toggle-focus-mode" checked={isFocusMode} />
}

/** @public @react */
export function ToggleEdgeScrollingItem() {
	const editor = useEditor()
	const edgeScrollSpeed = useValue('edgeScrollSpeed', () => editor.user.getEdgeScrollSpeed(), [
		editor,
	])

	return (
		<AnnotatorUiMenuActionCheckboxItem
			actionId="toggle-edge-scrolling"
			checked={edgeScrollSpeed === 1}
		/>
	)
}

/** @public @react */
export function ToggleReduceMotionItem() {
	const editor = useEditor()
	const animationSpeed = useValue('animationSpeed', () => editor.user.getAnimationSpeed(), [editor])

	return (
		<AnnotatorUiMenuActionCheckboxItem
			actionId="toggle-reduce-motion"
			checked={animationSpeed === 0}
		/>
	)
}

/** @public @react */
export function ToggleKeyboardShortcutsItem() {
	const editor = useEditor()
	const keyboardShortcuts = useValue(
		'keyboardShortcuts',
		() => editor.user.getAreKeyboardShortcutsEnabled(),
		[editor]
	)

	return (
		<AnnotatorUiMenuActionCheckboxItem
			actionId="toggle-keyboard-shortcuts"
			checked={keyboardShortcuts}
		/>
	)
}

/** @public @react */
export function ToggleDebugModeItem() {
	const editor = useEditor()
	const isDebugMode = useValue('isDebugMode', () => editor.getInstanceState().isDebugMode, [editor])
	return <AnnotatorUiMenuActionCheckboxItem actionId="toggle-debug-mode" checked={isDebugMode} />
}

/** @public @react */
export function ToggleDynamicSizeModeItem() {
	const editor = useEditor()
	const isDynamicResizeMode = useValue(
		'dynamic resize',
		() => editor.user.getIsDynamicResizeMode(),
		[editor]
	)

	return (
		<AnnotatorUiMenuActionCheckboxItem
			actionId="toggle-dynamic-size-mode"
			checked={isDynamicResizeMode}
		/>
	)
}

/** @public @react */
export function TogglePasteAtCursorItem() {
	const editor = useEditor()
	const pasteAtCursor = useValue('paste at cursor', () => editor.user.getIsPasteAtCursorMode(), [
		editor,
	])

	return (
		<AnnotatorUiMenuActionCheckboxItem actionId="toggle-paste-at-cursor" checked={pasteAtCursor} />
	)
}

/* ---------------------- Print --------------------- */

/** @public @react */
export function PrintItem() {
	const editor = useEditor()
	const emptyPage = useValue('emptyPage', () => editor.getCurrentPageShapeIds().size === 0, [
		editor,
	])

	return <AnnotatorUiMenuActionItem actionId="print" disabled={emptyPage} />
}

/* ---------------------- Multiplayer --------------------- */

/** @public @react */
export function CursorChatItem() {
	const editor = useEditor()
	const shouldShow = useValue(
		'show cursor chat',
		() => editor.getCurrentToolId() === 'select' && !editor.getInstanceState().isCoarsePointer,
		[editor]
	)

	if (!shouldShow) return null

	return <AnnotatorUiMenuActionItem actionId="open-cursor-chat" />
}
