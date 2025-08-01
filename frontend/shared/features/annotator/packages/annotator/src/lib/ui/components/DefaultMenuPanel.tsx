import { useEditor, usePassThroughWheelEvents, useValue } from '@annotator/editor'
import { memo, useRef } from 'react'
import { PORTRAIT_BREAKPOINT } from '../constants'
import { useBreakpoint } from '../context/breakpoints'
import { useAnnotatorUiComponents } from '../context/components'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { AnnotatorUiToolbar } from './primitives/AnnotatorUiToolbar'

/** @public @react */
export const DefaultMenuPanel = memo(function MenuPanel() {
	const breakpoint = useBreakpoint()
	const msg = useTranslation()

	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	const { MainMenu, QuickActions, ActionsMenu, PageMenu } = useAnnotatorUiComponents()

	const editor = useEditor()
	const isSinglePageMode = useValue('isSinglePageMode', () => editor.options.maxPages <= 1, [
		editor,
	])

	const showQuickActions =
		editor.options.actionShortcutsLocation === 'menu'
			? true
			: editor.options.actionShortcutsLocation === 'toolbar'
				? false
				: breakpoint >= PORTRAIT_BREAKPOINT.TABLET

	if (!MainMenu && !PageMenu && !showQuickActions) return null

	return (
		<nav ref={ref} className="tlui-menu-zone">
			<div className="tlui-buttons__horizontal">
				{MainMenu && <MainMenu />}
				{PageMenu && !isSinglePageMode && <PageMenu />}
				{showQuickActions ? (
					<AnnotatorUiToolbar className="tlui-buttons__horizontal" label={msg('actions-menu.title')}>
						{QuickActions && <QuickActions />}
						{ActionsMenu && <ActionsMenu />}
					</AnnotatorUiToolbar>
				) : null}
			</div>
		</nav>
	)
})
