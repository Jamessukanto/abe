import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../routeDefs'
import { useMaybeApp } from '../tla/hooks/useAppState'
import { useAnnotatorAppUiEvents } from '../tla/utils/app-ui-events'

export function Component() {
	const app = useMaybeApp()
	const navigate = useNavigate()
	const trackEvent = useAnnotatorAppUiEvents()
	useEffect(() => {
		const createFile = async () => {
			if (!app) {
				navigate(routes.abeRoot(), { replace: true })
				return
			}
			const res = await app.createFile()
			if (res.ok) {
				const { file } = res.value
				navigate(routes.tlaFile(file.id), { replace: true })
				trackEvent('create-file', { source: 'new-page' })
			} else {
				navigate(routes.abeRoot(), { replace: true })
			}
		}
		createFile()
	}, [app, navigate, trackEvent])
	return null
}
