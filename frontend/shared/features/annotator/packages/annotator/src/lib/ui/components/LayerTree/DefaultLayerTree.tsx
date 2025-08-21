import {
	TLShapeId,
	TLShape,
	releasePointerCapture,
	setPointerCapture,
	stopEventPropagation,
	tlenv,
	useEditor,
	useReversedChildrenShapes, 
	useCurrentPageId,
} from '@annotator/editor'
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { useSelectedShapeIds } from '../../hooks/useSelectedShapeIds'
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
	const selectedShapeIds = useSelectedShapeIds()

	const rMutables = useRef({
		isPointing: false,
		status: 'idle' as 'idle' | 'pointing' | 'dragging',
		pointing: null as { id: string; index: number } | null,
		startY: 0,
		startIndex: 0,
		dragIndex: 0,
	})

	const [expandedGroupIds, setExpandedGroupIds] = useState<Set<TLShapeId>>(new Set())
	const toggleExpandedGroup = useCallback((groupId: TLShapeId) => {
		setExpandedGroupIds(prev => {
			const newSet = new Set(prev)
			newSet.has(groupId) ? newSet.delete(groupId) : newSet.add(groupId)
			return newSet
		})
	}, [])

	const visibleShapes: TLShape[] = useMemo(() => {
		const acc: TLShape[] = []
		const walk = (shape: TLShape) => {
			acc.push(shape)
			if (shape.type === 'group' && expandedGroupIds.has(shape.id)) {
				const reversedChildren = editor.getSortedChildIdsForParent(shape.id)
					.map(id => editor.getShape(id))
					.filter((shape): shape is TLShape => shape !== undefined)
					.sort((a, b) => {
						if (a.index < b.index) return 1
						if (a.index > b.index) return -1
						return 0
					})
				for (const c of reversedChildren) walk(c)
			}
		}
		for (const c of childrenShapes) walk(c)
		return acc
	}, [editor, expandedGroupIds, childrenShapes])

	const [rowPositions, setRowPositions] = useState<
		Record<string, { y: number; offsetY: number }>
	>({})

	useLayoutEffect(() => {
		setRowPositions(
			Object.fromEntries(visibleShapes.map((shape, i) => {
				return [shape.id, { y: i * ITEM_HEIGHT, offsetY: 0 }]
			}))
		)
	}, [visibleShapes])

	// Drag handlers

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
			const current = rowPositions[id]
			const dragY = current.y

			mut.startY = clientY
			mut.startIndex = Math.max(0, Math.min(Math.round(dragY / ITEM_HEIGHT), visibleShapes.length - 1))
		},
		[ITEM_HEIGHT, visibleShapes, rowPositions]
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
				const current = rowPositions[mut.pointing!.id]

				const { startIndex, pointing } = mut
				const dragY = current.y + offsetY
				const dragIndex = Math.max(0, Math.min(Math.round(dragY / ITEM_HEIGHT), visibleShapes.length - 1))

				const next = { ...rowPositions }
				next[pointing!.id] = {
					y: current.y,
					offsetY,
					// isSelected: true,
				}

				if (dragIndex !== mut.dragIndex) {
					mut.dragIndex = dragIndex

					for (let i = 0; i < visibleShapes.length; i++) {
						const item = visibleShapes[i]
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
				setRowPositions(next)
			}
		},
		[ITEM_HEIGHT, visibleShapes, rowPositions]
	)

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			const mut = rMutables.current

			if (mut.status === 'dragging') {
				const { id, index } = mut.pointing!
				onMoveShape(editor, visibleShapes, id as TLShapeId, index, mut.dragIndex, trackEvent)
				// onMoveShape(editor, childrenShapes, id as TLShapeId, index, mut.dragIndex, trackEvent)
			}
			releasePointerCapture(e.currentTarget, e)
			mut.status = 'idle'

			const selectedShapeId = e.currentTarget.dataset.id
			editor.setSelectedShapes([selectedShapeId as TLShapeId])
		},
		[editor, trackEvent, visibleShapes]
	)

	return (
		<div  className={classNames('tlui-layer-panel__wrapper')}>

			<div className="tlui-layer-panel__header">
				<div className="tlui-layer-panel__header__title">
					{msg('layer-panel.title')}
				</div>
			</div>

			<div className="tlui-layer-panel--scroll-content">
				<div className="tlui-layer-panel">
					{(() => {
						return childrenShapes.map((shape, childIndex, ) => {
							const rowPosition = rowPositions[shape.id] ?? {y: 0, offsetY: 0}
							return <LayerTreeRow
								key={shape.id}
								shapeId={shape.id}
								positionY={rowPosition.y}
								offsetY={rowPosition.offsetY}
								depth={0}
								isSelected={selectedShapeIds.includes(shape.id)}

								expandedGroupIds={expandedGroupIds}
								toggleExpandedGroup={toggleExpandedGroup}
								visibleShapes={visibleShapes}
								index={visibleShapes.findIndex(s => s.id === shape.id)}
								rowPositions={rowPositions}
								itemHeight={ITEM_HEIGHT}

								handlePointerDown={handlePointerDown}
								handlePointerMove={handlePointerMove}
								handlePointerUp={handlePointerUp}
								// handleKeyDown={handleKeyDown}
							/>
						})
					})()}
				</div>
			</div>
		</div>
	)
})



