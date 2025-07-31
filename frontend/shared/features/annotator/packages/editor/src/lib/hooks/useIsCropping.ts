import { useValue } from '@annotator/state-react'
import { TLShapeId } from '@annotator/tlschema'
import { useEditor } from './useEditor'

/** @public */
export function useIsCropping(shapeId: TLShapeId) {
	const editor = useEditor()
	return useValue('isCropping', () => editor.getCroppingShapeId() === shapeId, [editor, shapeId])
}
