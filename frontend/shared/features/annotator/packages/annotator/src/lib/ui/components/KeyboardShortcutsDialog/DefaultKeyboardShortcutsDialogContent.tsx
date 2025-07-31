import { useShowCollaborationUi } from '../../hooks/useCollaborationStatus'
import { AnnotatorUiMenuActionItem } from '../primitives/menus/AnnotatorUiMenuActionItem'
import { AnnotatorUiMenuGroup } from '../primitives/menus/AnnotatorUiMenuGroup'
import { AnnotatorUiMenuItem } from '../primitives/menus/AnnotatorUiMenuItem'
import { AnnotatorUiMenuToolItem } from '../primitives/menus/AnnotatorUiMenuToolItem'

/** @public @react */
export function DefaultKeyboardShortcutsDialogContent() {
	const showCollaborationUi = useShowCollaborationUi()
	return (
		<>
			<AnnotatorUiMenuGroup label="shortcuts-dialog.tools" id="tools">
				<AnnotatorUiMenuActionItem actionId="toggle-tool-lock" />
				<AnnotatorUiMenuToolItem toolId="select" />
				<AnnotatorUiMenuToolItem toolId="draw" />
				<AnnotatorUiMenuToolItem toolId="eraser" />
				<AnnotatorUiMenuToolItem toolId="hand" />
				<AnnotatorUiMenuToolItem toolId="rectangle" />
				<AnnotatorUiMenuToolItem toolId="ellipse" />
				<AnnotatorUiMenuToolItem toolId="arrow" />
				<AnnotatorUiMenuToolItem toolId="line" />
				<AnnotatorUiMenuToolItem toolId="text" />
				<AnnotatorUiMenuToolItem toolId="frame" />
				<AnnotatorUiMenuToolItem toolId="note" />
				<AnnotatorUiMenuToolItem toolId="laser" />
				<AnnotatorUiMenuItem
					id="pointer-down"
					label="tool.pointer-down"
					kbd=","
					onSelect={() => {
						/* do nothing */
					}}
				/>
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup label="shortcuts-dialog.preferences" id="preferences">
				<AnnotatorUiMenuActionItem actionId="toggle-dark-mode" />
				<AnnotatorUiMenuActionItem actionId="toggle-focus-mode" />
				<AnnotatorUiMenuActionItem actionId="toggle-grid" />
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup label="shortcuts-dialog.edit" id="edit">
				<AnnotatorUiMenuActionItem actionId="undo" />
				<AnnotatorUiMenuActionItem actionId="redo" />
				<AnnotatorUiMenuActionItem actionId="cut" />
				<AnnotatorUiMenuActionItem actionId="copy" />
				<AnnotatorUiMenuActionItem actionId="paste" />
				<AnnotatorUiMenuActionItem actionId="select-all" />
				<AnnotatorUiMenuActionItem actionId="delete" />
				<AnnotatorUiMenuActionItem actionId="duplicate" />
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup label="shortcuts-dialog.view" id="view">
				<AnnotatorUiMenuActionItem actionId="zoom-in" />
				<AnnotatorUiMenuActionItem actionId="zoom-out" />
				<AnnotatorUiMenuActionItem actionId="zoom-to-100" />
				<AnnotatorUiMenuActionItem actionId="zoom-to-fit" />
				<AnnotatorUiMenuActionItem actionId="zoom-to-selection" />
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup label="shortcuts-dialog.transform" id="transform">
				<AnnotatorUiMenuActionItem actionId="bring-to-front" />
				<AnnotatorUiMenuActionItem actionId="bring-forward" />
				<AnnotatorUiMenuActionItem actionId="send-backward" />
				<AnnotatorUiMenuActionItem actionId="send-to-back" />
				<AnnotatorUiMenuActionItem actionId="group" />
				<AnnotatorUiMenuActionItem actionId="ungroup" />
				<AnnotatorUiMenuActionItem actionId="flip-horizontal" />
				<AnnotatorUiMenuActionItem actionId="flip-vertical" />
				<AnnotatorUiMenuActionItem actionId="align-top" />
				<AnnotatorUiMenuActionItem actionId="align-center-vertical" />
				<AnnotatorUiMenuActionItem actionId="align-bottom" />
				<AnnotatorUiMenuActionItem actionId="align-left" />
				<AnnotatorUiMenuActionItem actionId="align-center-horizontal" />
				<AnnotatorUiMenuActionItem actionId="align-right" />
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup label="shortcuts-dialog.text-formatting" id="text">
				<AnnotatorUiMenuItem
					id="text-bold"
					label="tool.rich-text-bold"
					kbd="cmd+b"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-italic"
					label="tool.rich-text-italic"
					kbd="cmd+i"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-code"
					label="tool.rich-text-code"
					kbd="cmd+e"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-highlight"
					label="tool.rich-text-highlight"
					kbd="cmd+shift+h"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-strikethrough"
					label="tool.rich-text-strikethrough"
					kbd="cmd+shift+s"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-link"
					label="tool.rich-text-link"
					kbd="cmd+shift+k"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-header"
					label="tool.rich-text-header"
					kbd="cmd+shift+[[1-6]]"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-orderedList"
					label="tool.rich-text-orderedList"
					kbd="cmd+shift+7"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="text-bulletedlist"
					label="tool.rich-text-bulletList"
					kbd="cmd+shift+8"
					onSelect={() => {
						/* do nothing */
					}}
				/>
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup label="shortcuts-dialog.a11y" id="a11y">
				<AnnotatorUiMenuItem
					id="a11y-select-next-shape"
					label="a11y.select-shape"
					kbd="[[Tab]]"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="a11y-select-next-shape-direction"
					label="a11y.select-shape-direction"
					kbd="cmd+↑→↓←"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="a11y-select-next-shape-container"
					label="a11y.enter-leave-container"
					kbd="cmd+shift+↑→"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="a11y-pan-camera"
					label="a11y.pan-camera"
					kbd="[[Space]]+↑→↓←"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="adjust-shape-styles"
					label="a11y.adjust-shape-styles"
					kbd="cmd+[[Enter]]"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="open-context-menu"
					label="a11y.open-context-menu"
					kbd="cmd+shift+[[Enter]]"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="a11y-move-shape"
					label="a11y.move-shape"
					kbd="↑→↓←"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuItem
					id="a11y-move-shape-faster"
					label="a11y.move-shape-faster"
					kbd="shift+↑→↓←"
					onSelect={() => {
						/* do nothing */
					}}
				/>
				<AnnotatorUiMenuActionItem actionId="enlarge-shapes" />
				<AnnotatorUiMenuActionItem actionId="shrink-shapes" />
				<AnnotatorUiMenuActionItem actionId="a11y-repeat-shape-announce" />
				<AnnotatorUiMenuItem
					id="a11y-open-keyboard-shortcuts"
					label="a11y.open-keyboard-shortcuts"
					kbd="cmd+alt+/"
					onSelect={() => {
						/* do nothing */
					}}
				/>
			</AnnotatorUiMenuGroup>
			{showCollaborationUi && (
				<AnnotatorUiMenuGroup label="shortcuts-dialog.collaboration" id="collaboration">
					<AnnotatorUiMenuActionItem actionId="open-cursor-chat" />
				</AnnotatorUiMenuGroup>
			)}
		</>
	)
}
