import { TlaFile, TlaUser } from '@annotator/dotcom-shared'
import { ReactNode, createContext, useContext } from 'react'
import { trackEvent } from '../../utils/analytics'
import { AnnotatorAppSessionState } from './local-session-state'

/** @public */
export type TLAppUiEventSource =
	| 'sidebar'
	| 'sidebar-context-menu'
	| 'user-preferences'
	| 'file-rename-dialog'
	| 'file-menu'
	| 'file-share-menu'
	| 'file-header'
	| 'anon-landing-page'
	| 'anon-top-bar'
	| 'account-menu'
	| 'top-bar'
	| 'new-page'
	| 'app'
	| 'cookie-settings'

/** @public */
export interface TLAppUiEventMap {
	'create-file': null
	'delete-file': null
	'rename-file': { name: string }
	'duplicate-file': null
	'download-file': null
	'drop-tldr-file': null
	'import-tldr-file': null
	'change-user-name': null
	'open-share-menu': null
	'change-share-menu-tab': { tab: AnnotatorAppSessionState['shareMenuActiveTab'] }
	'copy-share-link': null
	'copy-file-link': null
	'toggle-shared': { shared: boolean }
	'set-theme': { theme: 'dark' | 'light' | 'auto' }
	'toggle-export-padding': { padding: boolean }
	'toggle-export-background': { background: TlaUser['exportBackground'] }
	'set-export-format': { format: TlaUser['exportFormat'] }
	'set-export-theme': { theme: TlaUser['exportTheme'] }
	'export-image': {
		fullPage: boolean
		theme: TlaUser['exportTheme']
		format: TlaUser['exportFormat']
		padding: TlaUser['exportPadding']
		background: TlaUser['exportBackground']
	}
	'set-shared-link-type': { type: TlaFile['sharedLinkType'] | 'no-access' }
	'open-url': { url: string }
	'publish-file': null
	'unpublish-file': null
	'copy-publish-link': null
	'sign-up-clicked': { ctaMessage: string }
	'sign-out-clicked': null
	'learn-more-button': null
	'sidebar-toggle': { value: boolean }
	'click-file-link': null
	'open-preview-sign-up-modal': null
	'create-user': null
}

/** @public */
export type TLAppUiHandler = <T extends keyof TLAppUiEventMap>(
	name: T,
	data: { source: TLAppUiEventSource } & (TLAppUiEventMap[T] extends null
		? object
		: TLAppUiEventMap[T])
) => void

/** @public */
export type TLAppUiContextType = TLAppUiHandler

/** @internal */
const defaultEventHandler: TLAppUiContextType = trackEvent

/** @internal */
export const EventsContext = createContext<TLAppUiContextType>(defaultEventHandler)

/** @public */
export interface AnnotatorAppUiEventsProviderProps {
	onEvent?: TLAppUiHandler
	children: ReactNode
}

/** @public @react */
export function AnnotatorAppUiEventsProvider({ onEvent, children }: AnnotatorAppUiEventsProviderProps) {
	return (
		<EventsContext.Provider value={onEvent ?? defaultEventHandler}>
			{children}
		</EventsContext.Provider>
	)
}

/** @public */
export function useAnnotatorAppUiEvents(): TLAppUiContextType {
	const eventHandler = useContext(EventsContext)
	return eventHandler
}
