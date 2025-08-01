import { useAuth, useUser as useClerkUser } from '@clerk/clerk-react'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { assertExists, atom } from 'annotator'
import { AnnotatorApp } from '../app/annotatorApp'
import { useAnnotatorAppUiEvents } from '../utils/app-ui-events'

const appContext = createContext<AnnotatorApp | null>(null)

export const isClientTooOld$ = atom('isClientTooOld', false)

export function AppStateProvider({ children }: { children: ReactNode }) {
	const [app, setApp] = useState(null as AnnotatorApp | null)
	const auth = useAuth()
	const { user, isLoaded } = useClerkUser()

	useEffect(() => {
		if (!auth.isSignedIn || !user || !isLoaded) {
			return
		}
	})
	const trackEvent = useAnnotatorAppUiEvents()

	if (!auth.isSignedIn || !user || !isLoaded) {
		throw new Error('should have redirected in AbeRootProviders')
	}

	useEffect(() => {
		let _app: AnnotatorApp

		// Create the new user
		let didCancel = false
		auth.getToken().then((token) => {
			if (!token) throw new Error('no token')
			AnnotatorApp.create({
				userId: auth.userId,
				fullName: user.fullName || '',
				email: user.emailAddresses[0]?.emailAddress || '',
				avatar: user.imageUrl || '',
				getToken: async () => {
					const token = await auth.getToken()
					return token || undefined
				},
				onClientTooOld: () => {
					isClientTooOld$.set(true)
				},
				trackEvent,
			}).then(({ app }) => {
				if (didCancel) {
					app.dispose()
					return
				}
				_app = app
				setApp(app)
			})
		})

		return () => {
			didCancel = true
			if (_app) {
				_app.dispose()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth.userId, user])

	if (!app) {
		// We used to show a Loading... here but it was causing too much flickering.
		return null
	}

	return <appContext.Provider value={app}>{children}</appContext.Provider>
}

export function useMaybeApp() {
	return useContext(appContext)
}
export function useApp(): AnnotatorApp {
	return assertExists(useContext(appContext), 'useApp must be used within AppStateProvider')
}
