import {
	TLPageId,
	TLShapeId,
	releasePointerCapture,
	setPointerCapture,
	stopEventPropagation,
	tlenv,
	useEditor,
	useValue,
	useReversedChildrenShapes, 
	useCurrentPageId,
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

	const currentPageId = useCurrentPageId()
	const childrenShapes = useReversedChildrenShapes(currentPageId)

	const [editingRowId, setEditingRowId] = useState<TLShapeId | null>(null)
	const startEditingRow = useCallback((shapeId: TLShapeId) => { 
		setEditingRowId(shapeId) 
	}, [])
	const stopEditingRow = useCallback(() => { 
		setEditingRowId(null) 
	}, [])

	const expandedGroupsRef = useRef(new Set<TLShapeId>())


	const visibleRowsRef = useRef(Object.fromEntries(
		childrenShapes.map((shape, i) => [shape.id, { index: i }])
	))
	const rMutables = useRef({
		isPointing: false,
		status: 'idle' as 'idle' | 'pointing' | 'dragging',
		pointing: null as { id: string; index: number } | null,
		startY: 0,
		startIndex: 0,
		dragIndex: 0,
	})

	const [sortablePositionItems, setSortablePositionItems] = useState(Object.fromEntries(
		childrenShapes.map((shape, i) => [shape.id, { y: i * ITEM_HEIGHT, offsetY: 0 }])
	))

	// Update the sortable position items when the childrenShapes change
	useLayoutEffect(() => {
		setSortablePositionItems(
			Object.fromEntries(
				childrenShapes.map((shape, i) => [shape.id, { y: i * ITEM_HEIGHT, offsetY: 0 }])
			)
		)
	}, [ITEM_HEIGHT, childrenShapes])

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
			mut.startIndex = Math.max(0, Math.min(Math.round(dragY / ITEM_HEIGHT), childrenShapes.length - 1))
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
				const dragIndex = Math.max(0, Math.min(Math.round(dragY / ITEM_HEIGHT), childrenShapes.length - 1))

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
							// next[item.id] = { y, offsetY: 0, isSelected: true }
							next[item.id] = { y, offsetY: 0 }
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
		},
		[editor, trackEvent]
	)

	const renameShape = useCallback(
		(id: TLShapeId, name: string) => {
			const shape = editor.getShape(id)
			if (shape) {
				editor.updateShapes([{
					id,
					type: shape.type,
					meta: { customName: name }
				}])
			}
			trackEvent('rename-shape', { source: 'layer-tree' })
		},
		[editor, trackEvent]
	)

	return (
		<div style={ { height: '100%', display: 'flex', flexDirection: 'column' } }>

			<div
				// data-testid="page-menu.list"
				className={classNames('tlui-layer-panel')}
				// className={classNames('tlui-layer-panel', 'tlui-page-menu__list')}
				style={{ height: ITEM_HEIGHT * childrenShapes.length + 4 }}
			>
				
				{childrenShapes.map((shape, childIndex, ) => {
					const position = sortablePositionItems[shape.id] ?? {
						position: childIndex * 40,
						offsetY: 0,
					}
					// const rowIndex = getRowIndex(shape.id)
					// const yPosition = getRowPosition(rowIndex)
					return <LayerTreeRow
						key={shape.id}
						shapeId={shape.id}
						positionY={position.y}
						offsetY={position.offsetY}
						isSelected={shape.id === editingRowId}
						depth={0}

						expandedGroupsRef={expandedGroupsRef}
						// visibleRowsRef={visibleRowsRef}
						index={childIndex}
						handlePointerDown={handlePointerDown}
						handlePointerMove={handlePointerMove}
						handlePointerUp={handlePointerUp}
						// handleKeyDown={handleKeyDown}
						setSortablePositionItems={setSortablePositionItems}	
						listSize={childrenShapes.length}
						itemHeight={ITEM_HEIGHT}
					/>
				})}
			</div>

		</div>
	)
})



