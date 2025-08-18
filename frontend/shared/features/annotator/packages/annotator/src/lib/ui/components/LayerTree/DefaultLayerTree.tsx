import {
	PageRecordType,
	TLShapeId,
	TLShape,
	TLGroupShape,
	releasePointerCapture,
	setPointerCapture,
	stopEventPropagation,
	tlenv,
	useEditor,
	useValue,
	useRefState,
} from '@annotator/editor'
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'

import { LayerTreeRow } from './LayerTreeRow'
import { onMoveShape } from './edit-shapes-shared'
import classNames from 'classnames'

const ITEM_HEIGHT = 36


/** @public @react */
export const DefaultLayerTree = memo(function DefaultLayerTree() {
	const editor = useEditor()
	const msg = useTranslation()
	const trackEvent = useUiEvents()

	const selectedShapeIds = useValue('selectedShapeIds', () => 
		editor.getSelectedShapeIds(), [editor]
	)
	const currentPageId = editor.getCurrentPageId()
	const childrenShapes = useValue('childrenShapes', () => {
		return editor.getSortedChildIdsForParent(currentPageId)
			.map(id => editor.getShape(id))
			.filter((shape): shape is TLShape => shape !== undefined)
			.reverse() // Reverse positions in array only, not z-index
	}, [editor])

	const rMutables = useRef({
		isPointing: false,
		status: 'idle' as 'idle' | 'pointing' | 'dragging',
		pointing: null as { id: string; index: number } | null,
		startY: 0,
		startIndex: 0,
		dragIndex: 0,
	})

	const expandedGroupsRef = useRef(new Set<TLShapeId>())

	const [sortablePositionItems, setSortablePositionItems] = useRefState<
		Record<string, { y: number; offsetY: number }>
	>({})
	useLayoutEffect(() => {
		setSortablePositionItems(
			Object.fromEntries(childrenShapes.map(
				(shape, i) => [shape.id, { y: i * ITEM_HEIGHT, offsetY: 0 }]
			))
		)
	}, [ITEM_HEIGHT, childrenShapes])

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			const { clientY, currentTarget } = e
			const { dataset: { id, index } } = currentTarget
			if (!id || !index) return

			const mut = rMutables.current
			setPointerCapture(e.currentTarget, e)

			mut.status = 'pointing'
			mut.pointing = { id, index: +index! }
			const current = sortablePositionItems[id]
			const dragY = current.y

			mut.startY = clientY
			mut.startIndex = Math.max(0, Math.min(
				Math.round(dragY / ITEM_HEIGHT),
				childrenShapes.length - 1
			))
		},
		[ITEM_HEIGHT, childrenShapes.length, sortablePositionItems]
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
				const dragIndex = Math.max(0, Math.min(
					Math.round(dragY / ITEM_HEIGHT), childrenShapes.length - 1
				))
				const next = { ...sortablePositionItems }
				next[pointing!.id] = {
					y: current.y,
					offsetY,
					// isSelected: true,
				}

				if (dragIndex !== mut.dragIndex) {
					mut.dragIndex = dragIndex

					for (let i = 0; i < childrenShapes.length; i++) {
						const item = childrenShapes[i]
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
							next[item.id] = { y, offsetY: 0 }
							// next[item.id] = { y, offsetY: 0, isSelected: true }
						}
					}
				}
				setSortablePositionItems(next)
			}
		},
		[ITEM_HEIGHT, childrenShapes, sortablePositionItems]
	)

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			const mut = rMutables.current

			if (mut.status === 'dragging') {
				const { id, index } = mut.pointing!
				onMoveShape(editor, childrenShapes, id as TLShapeId, index, mut.dragIndex, trackEvent)
			}

			releasePointerCapture(e.currentTarget, e)
			mut.status = 'idle'

			editor.setSelectedShapes([mut.pointing!.id as TLShapeId])
		},
		[editor, trackEvent, childrenShapes]
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLButtonElement>) => {
			const mut = rMutables.current
			if (e.key === 'Escape') {
				if (mut.status === 'dragging') {
					setSortablePositionItems(Object.fromEntries(
						childrenShapes.map((shape, i) => [
							shape.id,
							{ y: i * ITEM_HEIGHT, offsetY: 0 },
							// { y: i * ITEM_HEIGHT, offsetY: 0, isSelected: false },
						])
					))
				}
				mut.status = 'idle'
			}
		},
		[ITEM_HEIGHT, childrenShapes]
	)

	return (
		<div
			data-testid="page-menu.list"
			className={classNames('tlui-layer-panel', 'tlui-page-menu__list')}
			style={{
				height: '100%'
			}}
		>
			{childrenShapes.map((shape, index) => {

				const position = sortablePositionItems[shape.id] ?? {
					y: index * ITEM_HEIGHT,
					offsetY: 0,
				}

				return <LayerTreeRow
					key={shape.id}
					shapeId={shape.id}
					isSelected={selectedShapeIds.includes(shape.id)}
					depth={0}
					expandedGroupsRef={expandedGroupsRef}
					index={index}
					y={position.y}
					offsetY={position.offsetY}
					handlePointerDown={handlePointerDown}
					handlePointerMove={handlePointerMove}
					handlePointerUp={handlePointerUp}
					handleKeyDown={handleKeyDown}
					listSize={childrenShapes.length}
					itemHeight={ITEM_HEIGHT}
				/>

			})}
		</div>

	)
})



