
import { useEditor, useValue } from '@annotator/editor'
import { memo } from 'react'
import { PORTRAIT_BREAKPOINT } from '../constants'
import { useBreakpoint } from '../context/breakpoints'
import { useAnnotatorUiComponents } from '../context/components'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { AnnotatorUiToolbar } from './primitives/AnnotatorUiToolbar'
import classNames from 'classnames'

/** @public @react */
export const DefaultLayerPanel = memo(function DefaultLayerPanel() {
	const breakpoint = useBreakpoint()
	const msg = useTranslation()

	const { LayerTree } = useAnnotatorUiComponents()

	const editor = useEditor()

	if (!LayerTree) return null

	return (

		<div className={classNames('tlui-layer-panel__wrapper')}>
			
			<div className="tlui-layer-panel__header">
				<div className="tlui-layer-panel__header__title">{msg('layer-panel.title')}</div>
			</div>

			{LayerTree && <LayerTree />}

			{/* <div className="tlui-buttons__horizontal">
				{MainMenu && <MainMenu />}
				{
					<AnnotatorUiToolbar className="tlui-buttons__horizontal" label={msg('actions-menu.title')}>
						{ActionsMenu && <ActionsMenu />}
					</AnnotatorUiToolbar>
				}
			</div> */}
			
		</div>
	)
})
