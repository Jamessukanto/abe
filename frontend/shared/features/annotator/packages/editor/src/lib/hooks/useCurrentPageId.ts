import { useValue } from '@annotator/state-react'
import { useEditor } from './useEditor'
import { TLPageId } from '@annotator/tlschema'

export const useCurrentPageId = (): TLPageId => {
	const editor = useEditor()
	
	return useValue('currentPageId', () => {
		return editor.getCurrentPageId()
	}, [editor])
}
