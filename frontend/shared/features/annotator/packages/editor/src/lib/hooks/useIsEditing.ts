import { useValue } from '@annotator/state-react'
import { TLShapeId } from '@annotator/tlschema'
import { useEditor } from './useEditor'

/** @public */
export function useIsEditing(shapeId: TLShapeId) {
	const editor = useEditor()
	return useValue('isEditing', () => editor.getEditingShapeId() === shapeId, [editor, shapeId])
}
