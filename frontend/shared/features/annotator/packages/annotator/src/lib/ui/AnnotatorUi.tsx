import { tlenv, useEditor, useReactor, useValue } from '@annotator/editor'
import classNames from 'classnames'
import React, { ReactNode, useRef, useState } from 'react'
import { TLUiAssetUrlOverrides } from './assetUrls'
import { SkipToMainContent } from './components/A11y'
import { FollowingIndicator } from './components/FollowingIndicator'
import { AnnotatorUiButton } from './components/primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from './components/primitives/Button/AnnotatorUiButtonIcon'
import { PORTRAIT_BREAKPOINT } from './constants'
import {
	TLUiContextProviderProps,
	AnnotatorUiContextProvider,
} from './context/AnnotatorUiContextProvider'
import { useActions } from './context/actions'
import { useBreakpoint } from './context/breakpoints'
import { TLUiComponents, useAnnotatorUiComponents } from './context/components'
import { useNativeClipboardEvents } from './hooks/useClipboardEvents'
import { useEditorEvents } from './hooks/useEditorEvents'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useReadonly } from './hooks/useReadonly'
import { useTranslation } from './hooks/useTranslation/useTranslation'

/** @public */
export interface AnnotatorUiProps extends TLUiContextProviderProps {
	/**
	 * The component's children.
	 */
	children?: ReactNode

	/**
	 * Whether to hide the user interface and only display the canvas.
	 */
	hideUi?: boolean

	/**
	 * Overrides for the UI components.
	 */
	components?: TLUiComponents

	/**
	 * Additional items to add to the debug menu (will be deprecated)
	 */
	renderDebugMenuItems?(): React.ReactNode

	/** Asset URL override. */
	assetUrls?: TLUiAssetUrlOverrides
}

/**
 * @public
 * @react
 */
export const AnnotatorUi = React.memo(function AnnotatorUi({
	renderDebugMenuItems,
	children,
	hideUi,
	components,
	...rest
}: AnnotatorUiProps) {
	return (
		<AnnotatorUiContextProvider {...rest} components={components}>
			<AnnotatorUiInner hideUi={hideUi} renderDebugMenuItems={renderDebugMenuItems}>
				{children}
			</AnnotatorUiInner>
		</AnnotatorUiContextProvider>
	)
})

interface AnnotatorUiContentProps {
	hideUi?: boolean
	shareZone?: ReactNode
	topZone?: ReactNode
	renderDebugMenuItems?(): React.ReactNode
}

const AnnotatorUiInner = React.memo(function AnnotatorUiInner({
	children,
	hideUi,
	...rest
}: AnnotatorUiContentProps & { children: ReactNode }) {
	// The hideUi prop should prevent the UI from mounting.
	// If we ever need want the UI to mount and preserve state, then
	// we should change this behavior and hide the UI via CSS instead.

	return (
		<>
			{children}
			{hideUi ? null : <AnnotatorUiContent {...rest} />}
		</>
	)
})

const AnnotatorUiContent = React.memo(function AnnotatorUi() {
	const editor = useEditor()
	const msg = useTranslation()
	const breakpoint = useBreakpoint()
	const isReadonlyMode = useReadonly()
	const isFocusMode = useValue('focus', () => editor.getInstanceState().isFocusMode, [editor])
	const isDebugMode = useValue('debug', () => editor.getInstanceState().isDebugMode, [editor])

	const {
		SharePanel,
		TopPanel,
		MenuPanel,
		StylePanel,
		Toolbar,
		RightPanel,
		InspectorPanel,
		HelpMenu,
		NavigationPanel,
		HelperButtons,
		DebugPanel,
		CursorChatBubble,
		RichTextToolbar,
		ImageToolbar,
		VideoToolbar,
		Toasts,
		Dialogs,
		A11y,
	} = useAnnotatorUiComponents()

	useKeyboardShortcuts()
	useNativeClipboardEvents()
	useEditorEvents()

	const rIsEditingAnything = useRef(false)
	const rHidingTimeout = useRef(-1 as any)
	const [hideToolbarWhileEditing, setHideToolbarWhileEditing] = useState(false)

	useReactor(
		'update hide toolbar while delayed',
		() => {
			const isMobileEnvironment = tlenv.isIos || tlenv.isAndroid
			if (!isMobileEnvironment) return

			const editingShape = editor.getEditingShapeId()
			if (editingShape === null) {
				if (rIsEditingAnything.current) {
					rIsEditingAnything.current = false
					clearTimeout(rHidingTimeout.current)
					if (tlenv.isAndroid) {
						// On Android, hide it after 150ms
						rHidingTimeout.current = editor.timers.setTimeout(() => {
							setHideToolbarWhileEditing(false)
						}, 150)
					} else {
						// On iOS, just hide it immediately
						setHideToolbarWhileEditing(false)
					}
				}
				return
			}

			if (!rIsEditingAnything.current) {
				rIsEditingAnything.current = true
				clearTimeout(rHidingTimeout.current)
				setHideToolbarWhileEditing(true)
			}
		},
		[]
	)

	const { 'toggle-focus-mode': toggleFocus } = useActions()

	return (
		<div
			className={classNames('tlui-layout', {
				'tlui-layout__mobile': breakpoint < PORTRAIT_BREAKPOINT.TABLET_SM,
			})}
			// When the virtual keyboard is opening we want it to hide immediately.
			// But when the virtual keyboard is closing we want to wait a bit before showing it again.
			data-iseditinganything={hideToolbarWhileEditing}
			data-breakpoint={breakpoint}
		>
			<SkipToMainContent />
			{isFocusMode ? (
				<div className="tlui-layout__canvas__inner">
					<AnnotatorUiButton
						type="icon"
						className="tlui-focus-button"
						title={msg('focus-mode.toggle-focus-mode')}
						onClick={() => toggleFocus.onSelect('menu')}
					>
						<AnnotatorUiButtonIcon icon="dot" />
					</AnnotatorUiButton>
				</div>
			) : (
				<>
					<div className="tlui-layout__canvas__outer">

						<div className="tlui-layout__canvas__inner">

							<div className="tlui-layout__top__left">
								{/* {TopPanel && <TopPanel />} */}
								{MenuPanel && <MenuPanel />}
								{HelperButtons && <HelperButtons />}
							</div>

							<div className="tlui-layout__top__right">
								{/* {SharePanel && <SharePanel />} */}
								{StylePanel && breakpoint >= PORTRAIT_BREAKPOINT.TABLET_SM && !isReadonlyMode && (
									<StylePanel />
								)}
							</div>

						</div>

						<div className="tlui-layout__bottom">
							<div className="tlui-layout__bottom__main">
								{NavigationPanel && <NavigationPanel />}
								{Toolbar && <Toolbar />}
								{HelpMenu && <HelpMenu />}
							</div>
							{isDebugMode && DebugPanel && <DebugPanel />}
							{A11y && <A11y />}
						</div>

					</div>

					<div 
						className="tlui-layout__right" 
						style={{backgroundColor: 'red'}}
					>
						{RightPanel && <RightPanel />}
						{/* {InspectorPanel && <InspectorPanel />} */}
						<div style={{backgroundColor: 'red'}}>lorem</div>
					</div>
				</>
			)}
			{RichTextToolbar && <RichTextToolbar />}
			{ImageToolbar && <ImageToolbar />}
			{VideoToolbar && <VideoToolbar />}
			{Toasts && <Toasts />}
			{Dialogs && <Dialogs />}
			<FollowingIndicator />
			{CursorChatBubble && <CursorChatBubble />}
		</div>
	)
})
