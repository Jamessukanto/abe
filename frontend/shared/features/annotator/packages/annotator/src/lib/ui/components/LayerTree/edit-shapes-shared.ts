import {
	Editor,
	getIndexAbove,
	getIndexBelow,
	getIndexBetween,
	IndexKey,
	TLShape,
	TLShapeId,
} from '@annotator/editor'
import { TLUiEventContextType } from '../../context/events'

// export const onMoveShape = (
// 	editor: Editor,
// 	shapes: TLShape[],
// 	id: TLShapeId,
// 	from: number,
// 	to: number,
// 	trackEvent: TLUiEventContextType
// ) => {
// 	const sortedShapes = [...shapes].sort((a, b) => a.index.localeCompare(b.index))

// 	let index: IndexKey
// 	const prev = from > to ? sortedShapes[to - 1] : sortedShapes[to]
// 	const next = from > to ? sortedShapes[to] : sortedShapes[to + 1]

// 	if (prev && !next) {
// 		index = getIndexAbove(prev.index)
// 	} else if (!prev && next) {
// 		index = getIndexBelow(sortedShapes[0].index)
// 	} else {
// 		index = getIndexBetween(prev.index, next.index)
// 	}

// 	if (index !== sortedShapes[from].index) {
// 		editor.markHistoryStoppingPoint('moving shape')
// 		editor.updateShape({
// 			id: id as TLShapeId,
// 			type: sortedShapes[from].type,
// 			index,
// 		})
// 		trackEvent('move-shape', { source: 'layer-tree' })
// 	}
// }

export const onMoveShape = (
	editor: Editor,
	shapes: TLShape[],
	id: TLShapeId,
	from: number,
	to: number,
	trackEvent: TLUiEventContextType
) => {
	const sortedShapes = [...shapes].reverse()
	
	// Map visual positions to actual sorted positions
	const actualTo = shapes.length - 1 - to
	const actualFrom = shapes.length - 1 - from
	
	let index: IndexKey
	const prev = actualFrom > actualTo ? sortedShapes[actualTo - 1] : sortedShapes[actualTo]
	const next = actualFrom > actualTo ? sortedShapes[actualTo] : sortedShapes[actualTo + 1]

	if (prev && !next) {
		index = getIndexAbove(prev.index)
	} else if (!prev && next) {
		index = getIndexBelow(sortedShapes[0].index)
	} else {
		index = getIndexBetween(prev.index, next.index)
	}

	// Find the shape by ID to get the correct type
	const shapeToMove = shapes.find(s => s.id === id)
	if (!shapeToMove) return

	if (index !== shapeToMove.index) {
		editor.markHistoryStoppingPoint('moving shape')
		editor.updateShape({
			id: id as TLShapeId,
			type: shapeToMove.type,
			index,
		})
		trackEvent('move-shape', { source: 'layer-tree' })
	}
}



// The key insight is that you need to transform the visual positions 
// (from, to) into actual sorted positions before using them to index into sortedShapes. 
// This way you maintain the visual ordering you want while ensuring the fractional 
// indexing gets the correct key relationships.