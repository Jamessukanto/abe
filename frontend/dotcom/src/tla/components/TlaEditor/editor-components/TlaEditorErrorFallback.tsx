import { Editor } from 'annotator'

export function TlaEditorErrorFallback({ error }: { error: unknown; editor?: Editor }) {
	throw error
	return null
}
