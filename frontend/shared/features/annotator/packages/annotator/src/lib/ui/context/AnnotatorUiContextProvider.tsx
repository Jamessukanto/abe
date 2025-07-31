import { RecursivePartial, defaultUserPreferences, track, useMaybeEditor } from '@annotator/editor'
import { ReactNode } from 'react'
import { TLUiAssetUrls, useDefaultUiAssetUrlsWithOverrides } from '../assetUrls'
import { ToolsProvider } from '../hooks/useTools'
import { AnnotatorUiTranslationProvider } from '../hooks/useTranslation/useTranslation'
import {
	MimeTypeContext,
	TLUiOverrides,
	useMergedOverrides,
	useMergedTranslationOverrides,
} from '../overrides'
import { AnnotatorUiA11yProvider } from './a11y'
import { ActionsProvider } from './actions'
import { AssetUrlsProvider } from './asset-urls'
import { BreakPointProvider } from './breakpoints'
import { TLUiComponents, AnnotatorUiComponentsProvider } from './components'
import { AnnotatorUiDialogsProvider } from './dialogs'
import { TLUiEventHandler, AnnotatorUiEventsProvider } from './events'
import { AnnotatorUiToastsProvider } from './toasts'

/** @public */
export interface TLUiContextProviderProps {
	/**
	 * Urls for where to find fonts and other assets for the UI.
	 */
	assetUrls?: RecursivePartial<TLUiAssetUrls>

	/**
	 * Overrides for the UI.
	 */
	overrides?: TLUiOverrides | TLUiOverrides[]

	/**
	 * Overrides for the UI components.
	 */
	components?: TLUiComponents

	/**
	 * Callback for when an event occurs in the UI.
	 */
	onUiEvent?: TLUiEventHandler

	/**
	 * Whether to always should the mobile breakpoints.
	 */
	forceMobile?: boolean

	/**
	 * The component's children.
	 */
	children?: ReactNode

	/**
	 * Supported mime types for media files.
	 */
	mediaMimeTypes?: string[]
}

/** @public @react */
export const AnnotatorUiContextProvider = track(function AnnotatorUiContextProvider({
	overrides,
	components,
	assetUrls,
	onUiEvent,
	forceMobile,
	mediaMimeTypes,
	children,
}: TLUiContextProviderProps) {
	// To allow mounting the sidebar without an editor running, we use a 'maybe' editor here
	// The sidebar makes use of toasts and dialogs etc, which typically require an editor to be present
	// but we are overriding the providers to allow them to be used without an editor.
	const editor = useMaybeEditor()
	return (
		<MimeTypeContext.Provider value={mediaMimeTypes}>
			<AssetUrlsProvider assetUrls={useDefaultUiAssetUrlsWithOverrides(assetUrls)}>
				<AnnotatorUiTranslationProvider
					overrides={useMergedTranslationOverrides(overrides)}
					locale={editor?.user.getLocale() ?? defaultUserPreferences.locale}
				>
					<AnnotatorUiEventsProvider onEvent={onUiEvent}>
						<AnnotatorUiToastsProvider>
							<AnnotatorUiDialogsProvider context={'tla'}>
								<AnnotatorUiA11yProvider>
									<BreakPointProvider forceMobile={forceMobile}>
										<AnnotatorUiComponentsProvider overrides={components}>
											<InternalProviders overrides={overrides}>{children}</InternalProviders>
										</AnnotatorUiComponentsProvider>
									</BreakPointProvider>
								</AnnotatorUiA11yProvider>
							</AnnotatorUiDialogsProvider>
						</AnnotatorUiToastsProvider>
					</AnnotatorUiEventsProvider>
				</AnnotatorUiTranslationProvider>
			</AssetUrlsProvider>
		</MimeTypeContext.Provider>
	)
})

function InternalProviders({
	overrides,
	children,
}: Omit<TLUiContextProviderProps, 'assetBaseUrl'>) {
	const mergedOverrides = useMergedOverrides(overrides)
	return (
		<ActionsProvider overrides={mergedOverrides.actions}>
			<ToolsProvider overrides={mergedOverrides.tools}>{children}</ToolsProvider>
		</ActionsProvider>
	)
}
