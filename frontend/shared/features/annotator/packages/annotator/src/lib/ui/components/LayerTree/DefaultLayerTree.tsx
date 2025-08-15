import {
	PageRecordType,
	TLPageId,
	releasePointerCapture,
	setPointerCapture,
	stopEventPropagation,
	tlenv,
	useEditor,
	useValue,
} from '@annotator/editor'
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'

import { LayerTreeRow } from './LayerTreeRow'
import { onMovePage } from './edit-pages-shared'
import classNames from 'classnames'


/** @public @react */
export const DefaultLayerTree = memo(function DefaultLayerTree() {
	const ITEM_HEIGHT = 36

	const editor = useEditor()
	const msg = useTranslation()
	const trackEvent = useUiEvents()
	const rSortableContainer = useRef<HTMLDivElement>(null)

	const pages = useValue('pages', () => editor.getPages(), [editor])
	const currentPageId = useValue('currentPageId', () => editor.getCurrentPageId(), [editor])
	const [editingPageId, setEditingPageId] = useState<string | null>(null)

	const startEditingPage = useCallback((pageId: string) => { 
		setEditingPageId(pageId) 
	}, [])

	const stopEditingPage = useCallback(() => { 
		setEditingPageId(null) 
	}, [])

	const rMutables = useRef({
		isPointing: false,
		status: 'idle' as 'idle' | 'pointing' | 'dragging',
		pointing: null as { id: string; index: number } | null,
		startY: 0,
		startIndex: 0,
		dragIndex: 0,
	})

	const [sortablePositionItems, setSortablePositionItems] = useState(
		Object.fromEntries(
			pages.map((page, i) => [page.id, { y: i * ITEM_HEIGHT, offsetY: 0, isSelected: false }])
		)
	)

	// Update the sortable position items when the pages change
	useLayoutEffect(() => {
		setSortablePositionItems(
			Object.fromEntries(
				pages.map((page, i) => [page.id, { y: i * ITEM_HEIGHT, offsetY: 0, isSelected: false }])
			)
		)
	}, [ITEM_HEIGHT, pages])

	// Scroll the current page into view when the menu opens / when current page changes
	useEffect(() => {
		editor.timers.requestAnimationFrame(() => {
			const elm = document.querySelector(`[data-pageid="${currentPageId}"]`) as HTMLDivElement

			if (elm) {
				elm.querySelector('button')?.focus()

				const container = rSortableContainer.current
				if (!container) return
				// Scroll into view is slightly borked on iOS Safari

				// if top of less than top cuttoff, scroll into view at top
				const elmTopPosition = elm.offsetTop
				const containerScrollTopPosition = container.scrollTop
				if (elmTopPosition < containerScrollTopPosition) {
					container.scrollTo({ top: elmTopPosition })
				}
				// if bottom position is greater than bottom cutoff, scroll into view at bottom
				const elmBottomPosition = elmTopPosition + ITEM_HEIGHT
				const containerScrollBottomPosition = container.scrollTop + container.offsetHeight
				if (elmBottomPosition > containerScrollBottomPosition) {
					container.scrollTo({ top: elmBottomPosition - container.offsetHeight })
				}
			}
		})
	}, [ITEM_HEIGHT, currentPageId, editor])

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			const { clientY, currentTarget } = e
			const {
				dataset: { id, index },
			} = currentTarget

			if (!id || !index) return

			const mut = rMutables.current

			setPointerCapture(e.currentTarget, e)

			mut.status = 'pointing'
			mut.pointing = { id, index: +index! }
			const current = sortablePositionItems[id]
			const dragY = current.y

			mut.startY = clientY
			mut.startIndex = Math.max(0, Math.min(Math.round(dragY / ITEM_HEIGHT), pages.length - 1))
		},
		[ITEM_HEIGHT, pages.length, sortablePositionItems]
	)

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			const mut = rMutables.current
			if (mut.status === 'pointing') {
				const { clientY } = e
				const offset = clientY - mut.startY
				if (Math.abs(offset) > 5) {
					mut.status = 'dragging'
				}
			}

			if (mut.status === 'dragging') {
				const { clientY } = e
				const offsetY = clientY - mut.startY
				const current = sortablePositionItems[mut.pointing!.id]

				const { startIndex, pointing } = mut
				const dragY = current.y + offsetY
				const dragIndex = Math.max(0, Math.min(Math.round(dragY / ITEM_HEIGHT), pages.length - 1))

				const next = { ...sortablePositionItems }
				next[pointing!.id] = {
					y: current.y,
					offsetY,
					isSelected: true,
				}

				if (dragIndex !== mut.dragIndex) {
					mut.dragIndex = dragIndex

					for (let i = 0; i < pages.length; i++) {
						const item = pages[i]
						if (item.id === mut.pointing!.id) {
							continue
						}

						let { y } = next[item.id]

						if (dragIndex === startIndex) {
							y = i * ITEM_HEIGHT
						} else if (dragIndex < startIndex) {
							if (dragIndex <= i && i < startIndex) {
								y = (i + 1) * ITEM_HEIGHT
							} else {
								y = i * ITEM_HEIGHT
							}
						} else if (dragIndex > startIndex) {
							if (dragIndex >= i && i > startIndex) {
								y = (i - 1) * ITEM_HEIGHT
							} else {
								y = i * ITEM_HEIGHT
							}
						}

						if (y !== next[item.id].y) {
							next[item.id] = { y, offsetY: 0, isSelected: true }
						}
					}
				}

				setSortablePositionItems(next)
			}
		},
		[ITEM_HEIGHT, pages, sortablePositionItems]
	)

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			const mut = rMutables.current

			if (mut.status === 'dragging') {
				const { id, index } = mut.pointing!
				onMovePage(editor, id as TLPageId, index, mut.dragIndex, trackEvent)
			}

			releasePointerCapture(e.currentTarget, e)
			mut.status = 'idle'
		},
		[editor, trackEvent]
	)

	const changePage = useCallback(
		(id: TLPageId) => {
			editor.setCurrentPage(id)
			trackEvent('change-page', { source: 'page-menu' })
		},
		[editor, trackEvent]
	)

	const renamePage = useCallback(
		(id: TLPageId, name: string) => {
			editor.renamePage(id, name)
			trackEvent('rename-page', { source: 'page-menu' })
		},
		[editor, trackEvent]
	)

	return (
		<div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

			<div className="tlui-layer-panel__header">
				<div className="tlui-layer-panel__header__title">{msg('layer-panel.title')}</div>
			</div>

			<div
				// data-testid="page-menu.list"
				className={classNames('tlui-layer-panel')}
				// className={classNames('tlui-layer-panel', 'tlui-page-menu__list')}
				style={{ height: ITEM_HEIGHT * pages.length + 4 }}
				ref={rSortableContainer}
			>
				
				{pages.map((page, index, ) => {
					const position = sortablePositionItems[page.id] ?? {
						position: index * 40,
						offsetY: 0,
					}
					return <LayerTreeRow
						page={page}
						index={index}
						position={position}
						handlePointerDown={handlePointerDown}
						handlePointerMove={handlePointerMove}
						handlePointerUp={handlePointerUp}
						changePage={changePage}
						startEditingPage={startEditingPage}
						stopEditingPage={stopEditingPage}
						editingPageId={editingPageId as TLPageId | null}
						listSize={pages.length}
					/>
				})}
			</div>

		</div>
	)
})



