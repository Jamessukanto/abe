import {
	PageRecordType,
	TLPageId,
	stopEventPropagation,
	useEditor,
	useValue,
} from '@annotator/editor'
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { usePrevious } from '../../hooks/usePrevious'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonCheck } from '../primitives/Button/AnnotatorUiButtonCheck'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiButtonLabel } from '../primitives/Button/AnnotatorUiButtonLabel'
import { PageItemInput } from './PageItemInput'
import { PageItemSubmenu } from './PageItemSubmenu'
import { onMovePage } from './edit-pages-shared'

/** @public @react */
export const DefaultPageMenu = memo(function DefaultPageMenu() {
	const editor = useEditor()
	const trackEvent = useUiEvents()
	const msg = useTranslation()

	const ITEM_HEIGHT = 36

	const rSortableContainer = useRef<HTMLDivElement>(null)

	const pages = useValue('pages', () => editor.getPages(), [editor])
	const currentPage = useValue('currentPage', () => editor.getCurrentPage(), [editor])	
	const { prevPage, nextPage } = useValue('currentPageIndex', () => {
		const currentIdx = pages.findIndex(page => page.id === currentPage.id)
		const prevPage = currentIdx > 0 ? pages[currentIdx - 1] : null
		const nextPage = currentIdx < pages.length - 1 ? pages[currentIdx + 1] : null
		return { prevPage, nextPage }
	}, [currentPage])

	const changePage = useCallback(
		(id: TLPageId) => {
			editor.setCurrentPage(id)
			trackEvent('change-page', { source: 'page-menu' })
		},
		[editor, trackEvent]
	)

	return (

		<>
	
			<AnnotatorUiButton
				type="normal"
				className="tlui-page-menu__item__button"
				onClick={() => changePage(prevPage.id)}
				title={msg('page-menu.go-to-page')}
			>
				<AnnotatorUiButtonIcon icon="chevron-left" />
			</AnnotatorUiButton>		
			
			<AnnotatorUiButton
				type="normal"
				className="tlui-page-menu__item__button"
				onClick={() => changePage(nextPage.id)}
				title={msg('page-menu.go-to-page')}
			>
				<AnnotatorUiButtonIcon icon="chevron-right" />
			</AnnotatorUiButton>

		</>

	)
})



	// const handleCreatePageClick = useCallback(() => {
	// 	if (isReadonlyMode) return

	// 	editor.run(() => {
	// 		editor.markHistoryStoppingPoint('creating page')
	// 		const newPageId = PageRecordType.createId()
	// 		editor.createPage({ name: msg('page-menu.new-page-initial-name'), id: newPageId })
	// 		editor.setCurrentPage(newPageId)

			// setIsEditing(true)

	// 		editor.timers.requestAnimationFrame(() => {
	// 			const elm = document.querySelector(`[data-pageid="${newPageId}"]`) as HTMLDivElement

	// 			if (elm) {
	// 				elm.querySelector('button')?.focus()
	// 			}
	// 		})
	// 	})
	// 	trackEvent('new-page', { source: 'page-menu' })
	// }, [editor, msg, isReadonlyMode, trackEvent])