import { useEditor, useValue } from '@annotator/editor'
import { memo } from 'react'
import { useAnnotatorUiComponents } from '../../context/components'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiToolbar } from '../primitives/AnnotatorUiToolbar'

/** @public @react */
export const DefaultInspectorPanel = memo(function InspectorPanel() {
	// const msg = useTranslation()

	const { MainMenu, QuickActions, PageMenu } = useAnnotatorUiComponents()

	const editor = useEditor()
	const isSinglePageMode = useValue('isSinglePageMode', () => editor.options.maxPages <= 1, [
		editor,
	])

	if (!PageMenu) return null

	return (
		<nav className="tlui-menu-zone">
			<div className="tlui-buttons__horizontal">
				{MainMenu && <MainMenu />}
				{/* {console.log('isSinglePageMode', isSinglePageMode)||null} */}
				{/* {PageMenu && <PageMenu />} */}

				


				{/* <AnnotatorUiToolbar className="tlui-buttons__horizontal" label={msg('actions-menu.title')}>
					{QuickActions && <QuickActions />}
				</AnnotatorUiToolbar> */}

			</div>
		</nav>
	)
})
