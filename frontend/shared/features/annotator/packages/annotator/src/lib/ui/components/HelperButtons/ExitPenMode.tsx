import { useEditor, useValue } from '@annotator/editor'
import { AnnotatorUiMenuActionItem } from '../primitives/menus/AnnotatorUiMenuActionItem'

export function ExitPenMode() {
	const editor = useEditor()
	const isPenMode = useValue('is pen mode', () => editor.getInstanceState().isPenMode, [editor])

	if (!isPenMode) return null

	return <AnnotatorUiMenuActionItem actionId="exit-pen-mode" />
}
