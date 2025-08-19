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





// 	const below = from > to ? pages[to - 1] : pages[to]
// 	const above = from > to ? pages[to] : pages[to + 1]

// 	if (below && !above) {
// 		index = getIndexAbove(below.index)
// 	} else if (!below && above) {
// 		index = getIndexBelow(pages[0].index)
// 	} else {
// 		index = getIndexBetween(below.index, above.index)
// 	}

// 	if (index !== pages[from].index) {
// 		editor.markHistoryStoppingPoint('moving page')
// 		editor.updatePage({
// 			id: id as TLPageId,
// 			index,
// 		})
// 		trackEvent('move-page', { source: 'page-menu' })
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
	let index: IndexKey
	const sortedShapes = [...shapes].reverse()
	
	// Map visual positions to actual sorted positions
	const actualTo = sortedShapes.length - 1 - to
	const actualFrom = sortedShapes.length - 1 - from
	
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
	const shapeToMove = sortedShapes.find(s => s.id === id)
	if (!shapeToMove) return

	if (index !== shapeToMove.index) {
		editor.markHistoryStoppingPoint('moving shape')
		editor.updateShapes([{
			id: id as TLShapeId,
			type: shapeToMove.type,
			index,
		}])
		trackEvent('move-shape', { source: 'layer-tree' })
	}


	
}



// The key insight is that you need to transform the visual positions 
// (from, to) into actual sorted positions before using them to index into sortedShapes. 
// This way you maintain the visual ordering you want while ensuring the fractional 
// indexing gets the correct key relationships.