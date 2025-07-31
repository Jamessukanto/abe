import { useEditor, useValue } from '@annotator/editor'
import { useShowCollaborationUi } from '../../hooks/useCollaborationStatus'
import {
	ArrangeMenuSubmenu,
	ClipboardMenuGroup,
	ConversionsMenuGroup,
	CursorChatItem,
	EditMenuSubmenu,
	MoveToPageMenu,
	ReorderMenuSubmenu,
	SelectAllMenuItem,
} from '../menu-items'
import { AnnotatorUiMenuGroup } from '../primitives/menus/AnnotatorUiMenuGroup'

/** @public @react */
export function DefaultContextMenuContent() {
	const editor = useEditor()
	const showCollaborationUi = useShowCollaborationUi()

	const selectToolActive = useValue(
		'isSelectToolActive',
		() => editor.getCurrentToolId() === 'select',
		[editor]
	)
	const isSinglePageMode = useValue('isSinglePageMode', () => editor.options.maxPages <= 1, [
		editor,
	])

	if (!selectToolActive) return null

	return (
		<>
			{showCollaborationUi && <CursorChatItem />}
			<AnnotatorUiMenuGroup id="modify">
				<EditMenuSubmenu />
				<ArrangeMenuSubmenu />
				<ReorderMenuSubmenu />
				{!isSinglePageMode && <MoveToPageMenu />}
			</AnnotatorUiMenuGroup>
			<ClipboardMenuGroup />
			<ConversionsMenuGroup />
			<AnnotatorUiMenuGroup id="select-all">
				<SelectAllMenuItem />
			</AnnotatorUiMenuGroup>
		</>
	)
}
