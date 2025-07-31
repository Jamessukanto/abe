import { PageRecordType, TLPageId, track, useEditor } from '@annotator/editor'
import { useCallback } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import {
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuTrigger,
} from '../primitives/AnnotatorUiDropdownMenu'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { AnnotatorUiMenuGroup } from '../primitives/menus/AnnotatorUiMenuGroup'
import { AnnotatorUiMenuItem } from '../primitives/menus/AnnotatorUiMenuItem'
import { onMovePage } from './edit-pages-shared'
/** @public */
export interface PageItemSubmenuProps {
	index: number
	item: { id: string; name: string }
	listSize: number
	onRename?(): void
}
/** @public */
export const PageItemSubmenu = track(function PageItemSubmenu({
	index,
	listSize,
	item,
	onRename,
}: PageItemSubmenuProps) {
	const editor = useEditor()
	const msg = useTranslation()
	const pages = editor.getPages()
	const trackEvent = useUiEvents()

	const onDuplicate = useCallback(() => {
		editor.markHistoryStoppingPoint('creating page')
		const newId = PageRecordType.createId()
		editor.duplicatePage(item.id as TLPageId, newId)
		trackEvent('duplicate-page', { source: 'page-menu' })
	}, [editor, item, trackEvent])

	const onMoveUp = useCallback(() => {
		onMovePage(editor, item.id as TLPageId, index, index - 1, trackEvent)
	}, [editor, item, index, trackEvent])

	const onMoveDown = useCallback(() => {
		onMovePage(editor, item.id as TLPageId, index, index + 1, trackEvent)
	}, [editor, item, index, trackEvent])

	const onDelete = useCallback(() => {
		editor.markHistoryStoppingPoint('deleting page')
		editor.deletePage(item.id as TLPageId)
		trackEvent('delete-page', { source: 'page-menu' })
	}, [editor, item, trackEvent])

	return (
		<AnnotatorUiDropdownMenuRoot id={`page item submenu ${index}`}>
			<AnnotatorUiDropdownMenuTrigger>
				<AnnotatorUiButton type="icon" title={msg('page-menu.submenu.title')}>
					<AnnotatorUiButtonIcon icon="dots-vertical" small />
				</AnnotatorUiButton>
			</AnnotatorUiDropdownMenuTrigger>
			<AnnotatorUiDropdownMenuContent alignOffset={0} side="right" sideOffset={-4}>
				<AnnotatorUiMenuContextProvider type="menu" sourceId="page-menu">
					<AnnotatorUiMenuGroup id="modify">
						{onRename && (
							<AnnotatorUiMenuItem id="rename" label="page-menu.submenu.rename" onSelect={onRename} />
						)}
						<AnnotatorUiMenuItem
							id="duplicate"
							label="page-menu.submenu.duplicate-page"
							onSelect={onDuplicate}
							disabled={pages.length >= editor.options.maxPages}
						/>
						{index > 0 && (
							<AnnotatorUiMenuItem
								id="move-up"
								onSelect={onMoveUp}
								label="page-menu.submenu.move-up"
							/>
						)}
						{index < listSize - 1 && (
							<AnnotatorUiMenuItem
								id="move-down"
								label="page-menu.submenu.move-down"
								onSelect={onMoveDown}
							/>
						)}
					</AnnotatorUiMenuGroup>
					{listSize > 1 && (
						<AnnotatorUiMenuGroup id="delete">
							<AnnotatorUiMenuItem id="delete" onSelect={onDelete} label="page-menu.submenu.delete" />
						</AnnotatorUiMenuGroup>
					)}
				</AnnotatorUiMenuContextProvider>
			</AnnotatorUiDropdownMenuContent>
		</AnnotatorUiDropdownMenuRoot>
	)
})
