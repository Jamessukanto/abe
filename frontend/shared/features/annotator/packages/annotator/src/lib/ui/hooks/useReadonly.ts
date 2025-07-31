import { useMaybeEditor, useValue } from '@annotator/editor'

/** @public */
export function useReadonly() {
	const editor = useMaybeEditor()
	return useValue('isReadonlyMode', () => !!editor?.getIsReadonly(), [editor])
}
