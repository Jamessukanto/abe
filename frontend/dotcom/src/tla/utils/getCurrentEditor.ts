import { Editor } from 'annotator'

export function getCurrentEditor() {
	return (window as any).editor as Editor | undefined
}
