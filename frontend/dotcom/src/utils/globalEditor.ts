import { atom, Editor, useValue } from 'annotator'

export const globalEditor = atom<Editor | null>('globalEditor', null)
export function useGlobalEditor() {
	return useValue(globalEditor)
}
