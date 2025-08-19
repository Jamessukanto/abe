import { useEditor, useValue } from '@annotator/editor'

/**
 * Hook that returns the currently selected shape IDs.
 * Updates reactively when the selection changes.
 * 
 * @public
 */
export function useSelectedShapeIds() {
	const editor = useEditor()
	return useValue('selectedShapeIds', () => editor.getSelectedShapeIds(), [editor])
}
