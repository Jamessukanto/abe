import { useValue } from '@annotator/state-react'
import { useEditor } from './useEditor'
import { TLShape, TLParentId } from '@annotator/tlschema'

export const useReversedChildrenShapes = (parentId: TLParentId) => {
	const editor = useEditor()
	
	return useValue('reversedChildrenShapes', () => {
		return editor.getSortedChildIdsForParent(parentId)
			.map(id => editor.getShape(id))
			.filter((shape): shape is TLShape => shape !== undefined)
			.reverse()
	}, [editor, parentId])
}
