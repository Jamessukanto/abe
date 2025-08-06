import {
	TLEditorComponents,
	TLOnMountHandler,
	TLTextOptions,
	AnnotatorEditor,
	AnnotatorEditorBaseProps,
	AnnotatorEditorStoreProps,
	defaultUserPreferences,
	mergeArraysAndReplaceDefaults,
	useEditor,
	useEditorComponents,
	useOnMount,
	useShallowArrayIdentity,
	useShallowObjectIdentity,
} from '@annotator/editor'
import { useMemo } from 'react'
import { AnnotatorHandles } from './canvas/AnnotatorHandles'
import { AnnotatorOverlays } from './canvas/AnnotatorOverlays'
import { AnnotatorScribble } from './canvas/AnnotatorScribble'
import { AnnotatorSelectionForeground } from './canvas/AnnotatorSelectionForeground'
import { AnnotatorShapeIndicators } from './canvas/AnnotatorShapeIndicators'
import { defaultBindingUtils } from './defaultBindingUtils'

import {
	TLExternalContentProps,
	registerDefaultExternalContentHandlers,
} from './defaultExternalContentHandlers'
import { defaultShapeTools } from './defaultShapeTools'
import { defaultShapeUtils } from './defaultShapeUtils'
import { registerDefaultSideEffects } from './defaultSideEffects'
import { defaultTools } from './defaultTools'

import { allDefaultFontFaces } from './shapes/shared/defaultFonts'
import { AnnotatorUi, AnnotatorUiProps } from './ui/AnnotatorUi'
import { TLUiAssetUrlOverrides, useDefaultUiAssetUrlsWithOverrides } from './ui/assetUrls'
import { LoadingScreen } from './ui/components/LoadingScreen'
import { Spinner } from './ui/components/Spinner'
import { AssetUrlsProvider } from './ui/context/asset-urls'
import { TLUiComponents, useAnnotatorUiComponents } from './ui/context/components'
import { useUiEvents } from './ui/context/events'
import { useToasts } from './ui/context/toasts'
import {
	AnnotatorUiTranslationProvider,
	useTranslation,
} from './ui/hooks/useTranslation/useTranslation'
import { useMergedTranslationOverrides } from './ui/overrides'
import { useDefaultEditorAssetsWithOverrides } from './utils/static-assets/assetUrls'
import { defaultAddFontsFromNode, tipTapDefaultExtensions } from './utils/text/richText'

/**
 * Override the default react components used by the editor and UI. Set components to null to
 * disable them entirely.
 *
 * @example
 * ```tsx
 * import {Annotator, TLComponents} from 'annotator'
 *
 * const components: TLComponents = {
 *    Scribble: MyCustomScribble,
 * }
 *
 * export function MyApp() {
 *   return <Annotator components={components} />
 * }
 * ```
 *
 *
 * @public
 */
export interface TLComponents extends TLEditorComponents, TLUiComponents {}

/** @public */
export interface AnnotatorBaseProps
	extends AnnotatorUiProps,
		AnnotatorEditorBaseProps,
		TLExternalContentProps {
	/** Urls for custom assets.
	 *
	 * ⚠︎ Important! This must be memoized (with useMemo) or defined outside of any React component.
	 */
	assetUrls?: TLUiAssetUrlOverrides
	/** Overrides for annotator's components.
	 *
	 * ⚠︎ Important! This must be memoized (with useMemo) or defined outside of any React component.
	 */
	components?: TLComponents

}

/** @public */
export type AnnotatorProps = AnnotatorBaseProps & AnnotatorEditorStoreProps

const allDefaultTools = [...defaultTools, ...defaultShapeTools]

/** @public @react */
export function Annotator(props: AnnotatorProps) {
	const {
		children,
		maxImageDimension,
		maxAssetSize,
		onMount,
		components = {},
		shapeUtils = [],
		bindingUtils = [],
		tools = [],
		textOptions,
		...rest
	} = props

	const _components = useShallowObjectIdentity(components)

	console.log('\n\nA\n', components)
	console.log('\n\nB\n', _components)

	const componentsWithDefault = useMemo(
		() => ({
			Scribble: AnnotatorScribble,
			ShapeIndicators: AnnotatorShapeIndicators,
			CollaboratorScribble: AnnotatorScribble,
			SelectionForeground: AnnotatorSelectionForeground,
			Handles: AnnotatorHandles,
			Overlays: AnnotatorOverlays,
			Spinner,
			LoadingScreen,
			..._components,
		}),
		[_components]
	)

	const _shapeUtils = useShallowArrayIdentity(shapeUtils)
	const shapeUtilsWithDefaults = useMemo(
		() => mergeArraysAndReplaceDefaults('type', _shapeUtils, defaultShapeUtils),
		[_shapeUtils]
	)

	const _bindingUtils = useShallowArrayIdentity(bindingUtils)
	const bindingUtilsWithDefaults = useMemo(
		() => mergeArraysAndReplaceDefaults('type', _bindingUtils, defaultBindingUtils),
		[_bindingUtils]
	)

	const _tools = useShallowArrayIdentity(tools)
	const toolsWithDefaults = useMemo(
		() => mergeArraysAndReplaceDefaults('id', _tools, allDefaultTools),
		[_tools]
	)

	const textOptionsWithDefaults = useMemo((): TLTextOptions => {
		return {
			addFontsFromNode: defaultAddFontsFromNode,
			...textOptions,
			tipTapConfig: {
				extensions: tipTapDefaultExtensions,
				...textOptions?.tipTapConfig,
			},
		}
	}, [textOptions])



	const assets = useDefaultEditorAssetsWithOverrides(rest.assetUrls)

	return (
		// We provide an extra higher layer of asset+translations providers here so that
		// loading UI (which is rendered outside of AnnotatorUi) may be translated.
		// Ideally we would refactor to hoist all the UI context providers we can up here. Maybe later.
		<AssetUrlsProvider assetUrls={useDefaultUiAssetUrlsWithOverrides(rest.assetUrls)}>
			<AnnotatorUiTranslationProvider
				overrides={useMergedTranslationOverrides(rest.overrides)}
				locale={rest.user?.userPreferences.get().locale ?? defaultUserPreferences.locale}
			>
				<AnnotatorEditor
					initialState="select"
					{...rest}
					components={componentsWithDefault}
					shapeUtils={shapeUtilsWithDefaults}
					bindingUtils={bindingUtilsWithDefaults}
					tools={toolsWithDefaults}
					textOptions={textOptionsWithDefaults}
					assetUrls={assets}
				>
					<AnnotatorUi {...rest} components={componentsWithDefault} >
						<InsideOfEditorAndUiContext
							maxImageDimension={maxImageDimension}
							maxAssetSize={maxAssetSize}
							onMount={onMount}
						/>
						{children}
					</AnnotatorUi>
				</AnnotatorEditor>
			</AnnotatorUiTranslationProvider>
		</AssetUrlsProvider>
	)
}

// We put these hooks into a component here so that they can run inside of the context provided by AnnotatorEditor and AnnotatorUi.
function InsideOfEditorAndUiContext({
	maxImageDimension,
	maxAssetSize,
	onMount,
}: TLExternalContentProps & {
	onMount?: TLOnMountHandler
}) {
	const editor = useEditor()
	const toasts = useToasts()
	const msg = useTranslation()
	const trackEvent = useUiEvents()

	useOnMount(() => {
		const unsubs: (void | (() => void) | undefined)[] = []

		unsubs.push(registerDefaultSideEffects(editor))

		// now that the editor has mounted (and presumably pre-loaded the fonts actually in use in
		// the document), we want to preload the other default font faces in the background. These
		// won't be directly used, but mean that when adding text the user can switch between fonts
		// quickly, without having to wait for them to load in.
		editor.fonts.requestFonts(allDefaultFontFaces)

		editor.once('edit', () => trackEvent('edit', { source: 'unknown' }))

		// for content handling, first we register the default handlers...
		registerDefaultExternalContentHandlers(editor, {
			maxImageDimension,
			maxAssetSize,
			toasts,
			msg,
		})

		// ...then we call the store's on mount which may override them...
		unsubs.push(editor.store.props.onMount(editor))

		// ...then we run the user's onMount prop, which may override things again.
		unsubs.push(onMount?.(editor))

		return () => {
			unsubs.forEach((fn) => fn?.())
		}
	})

	const { Canvas } = useEditorComponents()
	const { ContextMenu } = useAnnotatorUiComponents()

	if (ContextMenu) {
		// should wrap canvas
		return <ContextMenu />
	}

	if (Canvas) {
		return <Canvas />
	}

	return null
}
