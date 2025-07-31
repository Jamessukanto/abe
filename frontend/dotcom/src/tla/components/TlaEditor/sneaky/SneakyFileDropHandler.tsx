import { useAuth } from '@clerk/clerk-react'
import { memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditor, useToasts, useTranslation } from 'annotator'
import { routes } from '../../../../routeDefs'
import { useMaybeApp } from '../../../hooks/useAppState'

export const SneakyAnnotatorFileDropHandler = memo(function SneakyAnnotatorFileDropHandler() {
	const editor = useEditor()
	const app = useMaybeApp()
	const auth = useAuth()
	const toasts = useToasts()
	const msg = useTranslation()
	const navigate = useNavigate()
	useEffect(() => {
		if (!auth) return
		if (!app) return
		editor.registerExternalContentHandler('files', async (content) => {
			const { files } = content
			const annotatorFiles = files.filter((file) => file.name.endsWith('.tldr'))
			if (annotatorFiles.length > 0) {
				await app.uploadTldrFiles(annotatorFiles, (file) => {
					navigate(routes.tlaFile(file.id), { state: { mode: 'create' } })
				})
			} else {
				// File handling has been removed
				toasts.addToast({
					title: 'File upload not supported',
					description: 'File upload functionality has been removed.',
					severity: 'error',
				})
			}
		})
	}, [editor, app, auth, toasts, msg, navigate])
	return null
})
