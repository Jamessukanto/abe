import { ClerkProvider } from '@clerk/clerk-react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import '../sentry.client.config'
import '../styles/globals.css'
import { Head } from './components/Head/Head'
import { routes } from './routeDefs'
import { router } from './routes'

const browserRouter = createBrowserRouter(router)

// @ts-ignore this is fine
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
	throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local')
}

createRoot(document.getElementById('root')!).render(
	<ClerkProvider
		publishableKey={PUBLISHABLE_KEY}
		afterSignOutUrl={routes.abeRoot()}
		signInUrl="/"
		signInFallbackRedirectUrl={routes.abeRoot()}
		signUpFallbackRedirectUrl={routes.abeRoot()}
	>
		<HelmetProvider>
			<Head />
			<RouterProvider router={browserRouter} />
		</HelmetProvider>
	</ClerkProvider>
)
