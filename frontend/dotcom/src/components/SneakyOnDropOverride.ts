import { memo, useEffect } from 'react'
import {
	parseAndLoadDocument,
	useDialogs,
	useEditor,
	useToasts,
	useTranslation,
} from 'annotator'
import { shouldOverrideDocument } from '../utils/shouldOverrideDocument'

export const SneakyOnDropOverride = memo(function SneakyOnDropOverride({
	isMultiplayer,
}: {
	isMultiplayer: boolean
}) {
	const editor = useEditor()
	const toasts = useToasts()
	const dialogs = useDialogs()
	const msg = useTranslation()

	useEffect(() => {
		editor.registerExternalContentHandler('files', async (content) => {
			const { files } = content
			const annotatorFiles = files.filter((file) => file.name.endsWith('.tldr'))
			if (annotatorFiles.length > 0) {
				if (isMultiplayer) {
					toasts.addToast({
						title: msg('file-system.shared-document-file-open-error.title'),
						description: msg('file-system.shared-document-file-open-error.description'),
						severity: 'error',
					})
				} else {
					const shouldOverride = await shouldOverrideDocument(dialogs.addDialog)
					if (!shouldOverride) return
					await parseAndLoadDocument(editor, await annotatorFiles[0].text(), msg, toasts.addToast)
				}
			} else {
				// File handling has been removed
				toasts.addToast({
					title: 'File upload not supported',
					description: 'File upload functionality has been removed.',
					severity: 'error',
				})
			}
		})
	}, [isMultiplayer, editor, toasts, msg, dialogs])

	return null
})
