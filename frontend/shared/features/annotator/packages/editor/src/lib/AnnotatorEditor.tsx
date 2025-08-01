import { MigrationSequence, Store } from '@annotator/store'
import { TLShape, TLStore, TLStoreSnapshot } from '@annotator/tlschema'
import { Required, annotateError } from '@annotator/utils'
import React, {
	ReactNode,
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react'

import classNames from 'classnames'
import { version } from '../version'
import { OptionalErrorBoundary } from './components/ErrorBoundary'
import { DefaultErrorFallback } from './components/default-components/DefaultErrorFallback'
import { TLEditorSnapshot } from './config/TLEditorSnapshot'
import { TLStoreBaseOptions } from './config/createTLStore'
import { TLUser, createTLUser } from './config/createTLUser'
import { TLAnyBindingUtilConstructor } from './config/defaultBindings'
import { TLAnyShapeUtilConstructor } from './config/defaultShapes'
import { Editor } from './editor/Editor'
import { TLStateNodeConstructor } from './editor/tools/StateNode'
import { TLCameraOptions } from './editor/types/misc-types'
import { ContainerProvider, useContainer } from './hooks/useContainer'
import { useCursor } from './hooks/useCursor'
import { useDarkMode } from './hooks/useDarkMode'
import { EditorProvider, useEditor } from './hooks/useEditor'
import {
	EditorComponentsProvider,
	TLEditorComponents,
	useEditorComponents,
} from './hooks/useEditorComponents'
import { useEvent } from './hooks/useEvent'
import { useForceUpdate } from './hooks/useForceUpdate'
import { useShallowObjectIdentity } from './hooks/useIdentity'
import { useLocalStore } from './hooks/useLocalStore'
import { useRefState } from './hooks/useRefState'
import { useZoomCss } from './hooks/useZoomCss'

import { AnnotatorOptions } from './options'
import { TLDeepLinkOptions } from './utils/deepLinks'
import { stopEventPropagation } from './utils/dom'
import { TLTextOptions } from './utils/richText'
import { TLStoreWithStatus } from './utils/sync/StoreWithStatus'

/**
 * Props for the {@link annotator#Annotator} and {@link AnnotatorEditor} components, when passing in a
 * `TLStore` directly. If you would like annotator to create a store for you, use
 * {@link AnnotatorEditorWithoutStoreProps}.
 *
 * @public
 */
export interface AnnotatorEditorWithStoreProps {
	/**
	 * The store to use in the editor.
	 */
	store: TLStore | TLStoreWithStatus
}

/**
 * Props for the {@link annotator#Annotator} and {@link AnnotatorEditor} components, when not passing in a
 * `TLStore` directly. If you would like to pass in a store directly, use
 * {@link AnnotatorEditorWithStoreProps}.
 *
 * @public
 */
export interface AnnotatorEditorWithoutStoreProps extends TLStoreBaseOptions {
	store?: undefined

	/**
	 * Additional migrations to use in the store
	 */
	migrations?: readonly MigrationSequence[]

	/**
	 * A starting snapshot of data to pre-populate the store. Do not supply both this and
	 * `initialData`.
	 */
	snapshot?: TLEditorSnapshot | TLStoreSnapshot

	/**
	 * If you would like to persist the store to the browser's local IndexedDB storage and sync it
	 * across tabs, provide a key here. Each key represents a single annotator document.
	 */
	persistenceKey?: string

	sessionId?: string
}

/** @public */
export type AnnotatorEditorStoreProps = AnnotatorEditorWithStoreProps | AnnotatorEditorWithoutStoreProps

/**
 * Props for the {@link annotator#Annotator} and {@link AnnotatorEditor} components.
 *
 * @public
 **/
export type AnnotatorEditorProps = AnnotatorEditorBaseProps & AnnotatorEditorStoreProps

/**
 * Base props for the {@link annotator#Annotator} and {@link AnnotatorEditor} components.
 *
 * @public
 */
export interface AnnotatorEditorBaseProps {
	/**
	 * The component's children.
	 */
	children?: ReactNode

	/**
	 * An array of shape utils to use in the editor.
	 */
	shapeUtils?: readonly TLAnyShapeUtilConstructor[]

	/**
	 * An array of binding utils to use in the editor.
	 */
	bindingUtils?: readonly TLAnyBindingUtilConstructor[]

	/**
	 * An array of tools to add to the editor's state chart.
	 */
	tools?: readonly TLStateNodeConstructor[]

	/**
	 * Whether to automatically focus the editor when it mounts.
	 */
	autoFocus?: boolean

	/**
	 * Overrides for the editor's components, such as handles, collaborator cursors, etc.
	 */
	components?: TLEditorComponents

	/**
	 * Called when the editor has mounted.
	 */
	onMount?: TLOnMountHandler

	/**
	 * The editor's initial state (usually the id of the first active tool).
	 */
	initialState?: string

	/**
	 * A classname to pass to the editor's container.
	 */
	className?: string

	/**
	 * The user interacting with the editor.
	 */
	user?: TLUser

	/**
	 * Whether to infer dark mode from the user's OS. Defaults to false.
	 */
	inferDarkMode?: boolean

	/**
	 * Camera options for the editor.
	 */
	cameraOptions?: Partial<TLCameraOptions>

	/**
	 * Text options for the editor.
	 */
	textOptions?: TLTextOptions

	/**
	 * Options for the editor.
	 */
	options?: Partial<AnnotatorOptions>

	/**
	 * Options for syncing the editor's camera state with the URL.
	 */
	deepLinks?: true | TLDeepLinkOptions

	/**
	 * Predicate for whether or not a shape should be hidden.
	 *
	 * @deprecated Use {@link AnnotatorEditorBaseProps#getShapeVisibility} instead.
	 */
	isShapeHidden?(shape: TLShape, editor: Editor): boolean

	/**
	 * Provides a way to hide shapes.
	 *
	 * Hidden shapes will not render in the editor, and they will not be eligible for hit test via
	 * {@link Editor#getShapeAtPoint} and {@link Editor#getShapesAtPoint}. But otherwise they will
	 * remain in the store and participate in all other operations.
	 *
	 * @example
	 * ```ts
	 * getShapeVisibility={(shape, editor) => shape.meta.hidden ? 'hidden' : 'inherit'}
	 * ```
	 *
	 * - `'inherit' | undefined` - (default) The shape will be visible unless its parent is hidden.
	 * - `'hidden'` - The shape will be hidden.
	 * - `'visible'` - The shape will be visible.
	 *
	 * @param shape - The shape to check.
	 * @param editor - The editor instance.
	 */
	getShapeVisibility?(
		shape: TLShape,
		editor: Editor
	): 'visible' | 'hidden' | 'inherit' | null | undefined

	/**
	 * The URLs for the fonts to use in the editor.
	 */
	assetUrls?: { fonts?: { [key: string]: string | undefined } }
}

/**
 * Called when the editor has mounted.
 * @example
 * ```ts
 * <Annotator onMount={(editor) => editor.selectAll()} />
 * ```
 * @param editor - The editor instance.
 *
 * @public
 */
export type TLOnMountHandler = (editor: Editor) => (() => void | undefined) | undefined | void

declare global {
	interface Window {
		annotatorReady: boolean
	}
}

const EMPTY_SHAPE_UTILS_ARRAY = [] as const
const EMPTY_BINDING_UTILS_ARRAY = [] as const
const EMPTY_TOOLS_ARRAY = [] as const
/** @internal */
export const TL_CONTAINER_CLASS = 'tl-container'

/** @public @react */
export const AnnotatorEditor = memo(function AnnotatorEditor({
	store,
	components,
	className,
	user: _user,
	options: _options,
	...rest
}: AnnotatorEditorProps) {
	const [container, setContainer] = useState<HTMLElement | null>(null)
	const user = useMemo(() => _user ?? createTLUser(), [_user])

	const ErrorFallback =
		components?.ErrorFallback === undefined ? DefaultErrorFallback : components?.ErrorFallback

	// apply defaults. if you're using the bare @annotator/editor package, we
	// default these to the "annotator zero" configuration. We have different
	// defaults applied in annotator.
	const withDefaults = {
		...rest,
		shapeUtils: rest.shapeUtils ?? EMPTY_SHAPE_UTILS_ARRAY,
		bindingUtils: rest.bindingUtils ?? EMPTY_BINDING_UTILS_ARRAY,
		tools: rest.tools ?? EMPTY_TOOLS_ARRAY,
		components,
		options: useShallowObjectIdentity(_options),
	}

	return (
		<div
			ref={setContainer}
			data-annotator={version}
			draggable={false}
			className={classNames(`${TL_CONTAINER_CLASS} tl-theme__light`, className)}
			onPointerDown={stopEventPropagation}
			tabIndex={-1}
			role="application"
			aria-label={_options?.branding ?? 'annotator'}
		>
			<OptionalErrorBoundary
				fallback={ErrorFallback}
				onError={(error) => annotateError(error, { tags: { origin: 'react.annotator-before-app' } })}
			>
				{container && (
						<ContainerProvider container={container}>
							<EditorComponentsProvider overrides={components}>
								{store ? (
									store instanceof Store ? (
										// Store is ready to go, whether externally synced or not
										<AnnotatorEditorWithReadyStore {...withDefaults} store={store} user={user} />
									) : (
										// Store is a synced store, so handle syncing stages internally
										<AnnotatorEditorWithLoadingStore {...withDefaults} store={store} user={user} />
									)
								) : (
									// We have no store (it's undefined) so create one and possibly sync it
									<AnnotatorEditorWithOwnStore {...withDefaults} store={store} user={user} />
								)}
							</EditorComponentsProvider>
						</ContainerProvider>
				)}
			</OptionalErrorBoundary>
		</div>
	)
})

function AnnotatorEditorWithOwnStore(
	props: Required<
		AnnotatorEditorProps & { store: undefined; user: TLUser },
		'shapeUtils' | 'bindingUtils' | 'tools'
	>
) {
	const {
		defaultName,
		snapshot,
		initialData,
		shapeUtils,
		bindingUtils,
		persistenceKey,
		sessionId,
		user,
		assets,
		migrations,
	} = props

	const syncedStore = useLocalStore({
		shapeUtils,
		bindingUtils,
		initialData,
		persistenceKey,
		sessionId,
		defaultName,
		snapshot,
		assets,
		migrations,
	})

	return <AnnotatorEditorWithLoadingStore {...props} store={syncedStore} user={user} />
}

const AnnotatorEditorWithLoadingStore = memo(function AnnotatorEditorBeforeLoading({
	store,
	user,
	...rest
}: Required<
	AnnotatorEditorProps & { store: TLStoreWithStatus; user: TLUser },
	'shapeUtils' | 'bindingUtils' | 'tools'
>) {
	const container = useContainer()

	useLayoutEffect(() => {
		if (user.userPreferences.get().colorScheme === 'dark') {
			container.classList.remove('tl-theme__light')
			container.classList.add('tl-theme__dark')
		}
	}, [container, user])

	const { LoadingScreen } = useEditorComponents()

	switch (store.status) {
		case 'error': {
			// for error handling, we fall back to the default error boundary.
			// if users want to handle this error differently, they can render
			// their own error screen before the AnnotatorEditor component
			throw store.error
		}
		case 'loading': {
			return LoadingScreen ? <LoadingScreen /> : null
		}
		case 'not-synced': {
			break
		}
		case 'synced-local': {
			break
		}
		case 'synced-remote': {
			break
		}
	}

	return <AnnotatorEditorWithReadyStore {...rest} store={store.store} user={user} />
})

const noAutoFocus = () => document.location.search.includes('annotator_preserve_focus') // || !document.hasFocus() // breaks in nextjs

function AnnotatorEditorWithReadyStore({
	onMount,
	children,
	store,
	tools,
	shapeUtils,
	bindingUtils,
	user,
	initialState,
	autoFocus = true,
	inferDarkMode,
	cameraOptions,
	textOptions,
	options,
	deepLinks: _deepLinks,
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	isShapeHidden,
	getShapeVisibility,
	assetUrls,
}: Required<
	AnnotatorEditorProps & {
		store: TLStore
		user: TLUser
	},
	'shapeUtils' | 'bindingUtils' | 'tools'
>) {
	const { ErrorFallback } = useEditorComponents()
	const container = useContainer()

	const [editor, setEditor] = useRefState<Editor | null>(null)

	const canvasRef = useRef<HTMLDivElement | null>(null)

	const deepLinks = useShallowObjectIdentity(_deepLinks === true ? {} : _deepLinks)

	// props in this ref can be changed without causing the editor to be recreated.
	const editorOptionsRef = useRef({
		// for these, it's because they're only used when the editor first mounts:
		autoFocus: autoFocus && !noAutoFocus(),
		inferDarkMode,
		initialState,

		// for these, it's because we keep them up to date in a separate effect:
		cameraOptions,
		deepLinks,
	})

	useLayoutEffect(() => {
		editorOptionsRef.current = {
			autoFocus: autoFocus && !noAutoFocus(),
			inferDarkMode,
			initialState,
			cameraOptions,
			deepLinks,
		}
	}, [autoFocus, inferDarkMode, initialState, cameraOptions, deepLinks])

	useLayoutEffect(
		() => {
			const { autoFocus, inferDarkMode, initialState, cameraOptions, deepLinks } =
				editorOptionsRef.current
			const editor = new Editor({
				store,
				shapeUtils,
				bindingUtils,
				tools,
				getContainer: () => container,
				user,
				initialState,
				// we should check for some kind of query parameter that turns off autofocus
				autoFocus,
				inferDarkMode,
				cameraOptions,
				textOptions,
				options,
				isShapeHidden,
				getShapeVisibility,
				fontAssetUrls: assetUrls?.fonts,
			})

			editor.updateViewportScreenBounds(canvasRef.current ?? container)

			// Use the ref here because we only want to do this once when the editor is created.
			// We don't want changes to the urlStateSync prop to trigger creating new editors.
			if (deepLinks) {
				if (!deepLinks?.getUrl) {
					// load the state from window.location
					editor.navigateToDeepLink(deepLinks)
				} else {
					// load the state from the provided URL
					editor.navigateToDeepLink({ ...deepLinks, url: deepLinks.getUrl(editor) })
				}
			}

			setEditor(editor)

			return () => {
				editor.dispose()
			}
		},
		// if any of these change, we need to recreate the editor.
		[
			bindingUtils,
			container,
			options,
			shapeUtils,
			store,
			tools,
			user,
			setEditor,
			isShapeHidden,
			getShapeVisibility,
			textOptions,
			assetUrls,
		]
	)

	useLayoutEffect(() => {
		if (!editor) return
		if (deepLinks) {
			return editor.registerDeepLinkListener(deepLinks)
		}
	}, [editor, deepLinks])

	// keep the editor up to date with the latest camera options
	useLayoutEffect(() => {
		if (editor && cameraOptions) {
			editor.setCameraOptions(cameraOptions)
		}
	}, [editor, cameraOptions])

	const crashingError = useSyncExternalStore(
		useCallback(
			(onStoreChange) => {
				if (editor) {
					editor.on('crash', onStoreChange)
					return () => editor.off('crash', onStoreChange)
				}
				return () => {
					// noop
				}
			},
			[editor]
		),
		() => editor?.getCrashingError() ?? null
	)

	// For our examples site, we want autoFocus to be true on the examples site, but not
	// when embedded in our docs site. If present, the `annotator_preserve_focus` search param
	// overrides the `autoFocus` prop and prevents the editor from focusing immediately,
	// however here we also add some logic to focus the editor when the user clicks
	// on it and unfocus it when the user clicks away from it.
	useEffect(
		function handleFocusOnPointerDownForPreserveFocusMode() {
			if (!editor) return

			function handleFocusOnPointerDown() {
				if (!editor) return
				editor.focus()
			}

			function handleBlurOnPointerDown() {
				if (!editor) return
				editor.blur()
			}

			if (autoFocus && noAutoFocus()) {
				editor.getContainer().addEventListener('pointerdown', handleFocusOnPointerDown)
				document.body.addEventListener('pointerdown', handleBlurOnPointerDown)

				return () => {
					editor.getContainer()?.removeEventListener('pointerdown', handleFocusOnPointerDown)
					document.body.removeEventListener('pointerdown', handleBlurOnPointerDown)
				}
			}
		},
		[editor, autoFocus]
	)

	const [_fontLoadingState, setFontLoadingState] = useState<{
		editor: Editor
		isLoaded: boolean
	} | null>(null)
	let fontLoadingState = _fontLoadingState
	if (editor !== fontLoadingState?.editor) {
		fontLoadingState = null
	}
	useEffect(() => {
		if (!editor) return
		let isCancelled = false

		setFontLoadingState({ editor, isLoaded: false })

		editor.fonts
			.loadRequiredFontsForCurrentPage(editor.options.maxFontsToLoadBeforeRender)
			.finally(() => {
				if (isCancelled) return
				setFontLoadingState({ editor, isLoaded: true })
			})

		return () => {
			isCancelled = true
		}
	}, [editor])

	const { Canvas, LoadingScreen } = useEditorComponents()

	if (!editor || !fontLoadingState?.isLoaded) {
		return (
			<>
				{LoadingScreen && <LoadingScreen />}
				<div className="tl-canvas" ref={canvasRef} />
			</>
		)
	}

	return (
		// the top-level annotator component also renders an error boundary almost
		// identical to this one. the reason we have two is because this one has
		// access to `App`, which means that here we can enrich errors with data
		// from app for reporting, and also still attempt to render the user's
		// document in the event of an error to reassure them that their work is
		// not lost.
		<OptionalErrorBoundary
			fallback={ErrorFallback as any}
			onError={(error) =>
				editor.annotateError(error, { origin: 'react.annotator', willCrashApp: true })
			}
		>
			{crashingError ? (
				<Crash crashingError={crashingError} />
			) : (
				<EditorProvider editor={editor}>
					<Layout onMount={onMount}>
						{children ?? (Canvas ? <Canvas key={editor.contextId} /> : null)}
					</Layout>
				</EditorProvider>
			)}
		</OptionalErrorBoundary>
	)
}

function Layout({ children, onMount }: { children: ReactNode; onMount?: TLOnMountHandler }) {
	useZoomCss()
	useCursor()
	useDarkMode()
	useForceUpdate()
	useOnMount((editor) => {
		const teardownStore = editor.store.props.onMount(editor)
		const teardownCallback = onMount?.(editor)

		return () => {
			teardownStore?.()
			teardownCallback?.()
		}
	})

	return children
}

function Crash({ crashingError }: { crashingError: unknown }): null {
	throw crashingError
}

/** @public */
export interface LoadingScreenProps {
	children: ReactNode
}

/** @public @react */
export function LoadingScreen({ children }: LoadingScreenProps) {
	return (
		<div className="tl-loading" aria-busy="true" tabIndex={0}>
			{children}
		</div>
	)
}

/** @public @react */
export function ErrorScreen({ children }: LoadingScreenProps) {
	return <div className="tl-loading">{children}</div>
}

/** @internal */
export function useOnMount(onMount?: TLOnMountHandler) {
	const editor = useEditor()

	const onMountEvent = useEvent((editor: Editor) => {
		let teardown: (() => void) | void = undefined
		// If the user wants to do something when the editor mounts, we make sure it doesn't effect the history.
		// todo: is this reeeeally what we want to do, or should we leave it up to the caller?
		editor.run(
			() => {
				teardown = onMount?.(editor)
				editor.emit('mount')
			},
			{ history: 'ignore' }
		)
		window.annotatorReady = true
		return teardown
	})

	React.useLayoutEffect(() => {
		if (editor) return onMountEvent?.(editor)
	}, [editor, onMountEvent])
}
