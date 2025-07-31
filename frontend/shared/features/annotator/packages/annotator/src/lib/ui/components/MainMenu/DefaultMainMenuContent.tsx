import { useCanRedo, useCanUndo } from '../../hooks/menu-hooks'
import { ColorSchemeMenu } from '../ColorSchemeMenu'
import { KeyboardShortcutsMenuItem } from '../HelpMenu/DefaultHelpMenuContent'
import { LanguageMenu } from '../LanguageMenu'
import {
	ClipboardMenuGroup,
	ConversionsMenuGroup,
	ConvertToBookmarkMenuItem,

	EditLinkMenuItem,
	FitFrameToContentMenuItem,
	FlattenMenuItem,
	GroupMenuItem,
	RemoveFrameMenuItem,
	SelectAllMenuItem,
	ToggleAutoSizeMenuItem,
	ToggleDebugModeItem,
	ToggleDynamicSizeModeItem,
	ToggleEdgeScrollingItem,
	ToggleFocusModeItem,
	ToggleGridItem,
	ToggleKeyboardShortcutsItem,
	ToggleLockMenuItem,
	TogglePasteAtCursorItem,
	ToggleReduceMotionItem,
	ToggleSnapModeItem,
	ToggleToolLockItem,
	ToggleTransparentBgMenuItem,
	ToggleWrapModeItem,
	UngroupMenuItem,
	UnlockAllMenuItem,
	ZoomTo100MenuItem,
	ZoomToFitMenuItem,
	ZoomToSelectionMenuItem,
} from '../menu-items'
import { AnnotatorUiMenuActionItem } from '../primitives/menus/AnnotatorUiMenuActionItem'
import { AnnotatorUiMenuGroup } from '../primitives/menus/AnnotatorUiMenuGroup'
import { AnnotatorUiMenuSubmenu } from '../primitives/menus/AnnotatorUiMenuSubmenu'

/** @public @react */
export function DefaultMainMenuContent() {
	return (
		<>
			<AnnotatorUiMenuGroup id="basic">
				<EditSubmenu />
				<ViewSubmenu />
				<ExportFileContentSubMenu />
				<ExtrasGroup />
			</AnnotatorUiMenuGroup>
			<PreferencesGroup />
		</>
	)
}

/** @public @react */
export function ExportFileContentSubMenu() {
	return (
		<AnnotatorUiMenuSubmenu id="export-all-as" label="context-menu.export-all-as" size="small">
			<AnnotatorUiMenuGroup id="export-all-as-group">
				<AnnotatorUiMenuActionItem actionId="export-all-as-svg" />
				<AnnotatorUiMenuActionItem actionId="export-all-as-png" />
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup id="export-all-as-bg">
				<ToggleTransparentBgMenuItem />
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public @react */
export function EditSubmenu() {
	return (
		<AnnotatorUiMenuSubmenu id="edit" label="menu.edit">
			<UndoRedoGroup />
			<ClipboardMenuGroup />
			<ConversionsMenuGroup />
			<MiscMenuGroup />
			<LockGroup />
			<AnnotatorUiMenuGroup id="select-all">
				<SelectAllMenuItem />
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public @react */
export function MiscMenuGroup() {
	return (
		<AnnotatorUiMenuGroup id="misc">
			<GroupMenuItem />
			<UngroupMenuItem />
			<EditLinkMenuItem />
			<ToggleAutoSizeMenuItem />
			<RemoveFrameMenuItem />
			<FitFrameToContentMenuItem />

			<ConvertToBookmarkMenuItem />
			<FlattenMenuItem />
		</AnnotatorUiMenuGroup>
	)
}

/** @public @react */
export function LockGroup() {
	return (
		<AnnotatorUiMenuGroup id="lock">
			<ToggleLockMenuItem />
			<UnlockAllMenuItem />
		</AnnotatorUiMenuGroup>
	)
}

/** @public @react */
export function UndoRedoGroup() {
	const canUndo = useCanUndo()
	const canRedo = useCanRedo()
	return (
		<AnnotatorUiMenuGroup id="undo-redo">
			<AnnotatorUiMenuActionItem actionId="undo" disabled={!canUndo} />
			<AnnotatorUiMenuActionItem actionId="redo" disabled={!canRedo} />
		</AnnotatorUiMenuGroup>
	)
}

/** @public @react */
export function ViewSubmenu() {
	return (
		<AnnotatorUiMenuSubmenu id="view" label="menu.view">
			<AnnotatorUiMenuGroup id="view-actions">
				<AnnotatorUiMenuActionItem actionId="zoom-in" />
				<AnnotatorUiMenuActionItem actionId="zoom-out" />
				<ZoomTo100MenuItem />
				<ZoomToFitMenuItem />
				<ZoomToSelectionMenuItem />
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public @react */
export function ExtrasGroup() {
	return (
		<>
		</>
	)
}

/* ------------------- Preferences ------------------ */

/** @public @react */
export function PreferencesGroup() {
	return (
		<AnnotatorUiMenuGroup id="preferences">
			<AnnotatorUiMenuSubmenu id="preferences" label="menu.preferences">
				<AnnotatorUiMenuGroup id="preferences-actions">
					<ToggleSnapModeItem />
					<ToggleToolLockItem />
					<ToggleGridItem />
					<ToggleWrapModeItem />
					<ToggleFocusModeItem />
					<ToggleEdgeScrollingItem />
					<ToggleReduceMotionItem />
					<ToggleKeyboardShortcutsItem />
					<ToggleDynamicSizeModeItem />
					<TogglePasteAtCursorItem />
					<ToggleDebugModeItem />
				</AnnotatorUiMenuGroup>
				<AnnotatorUiMenuGroup id="color-scheme">
					<ColorSchemeMenu />
				</AnnotatorUiMenuGroup>
			</AnnotatorUiMenuSubmenu>
			<LanguageMenu />
			<KeyboardShortcutsMenuItem />
		</AnnotatorUiMenuGroup>
	)
}
