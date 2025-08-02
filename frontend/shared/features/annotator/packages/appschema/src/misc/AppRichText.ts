import { T } from '@annotator/validate'

/** @public */
export const richTextValidator = T.object({ type: T.string, content: T.arrayOf(T.unknown) })

/** @public */
export type AppRichText = T.TypeOf<typeof richTextValidator>

/** @public */
export function toRichText(text: string): AppRichText {
	const lines = text.split('\n')
	const content = lines.map((text) => {
		if (!text) {
			return {
				type: 'paragraph',
			}
		}

		return {
			type: 'paragraph',
			content: [{ type: 'text', text }],
		}
	})

	return {
		type: 'doc',
		content,
	}
}
