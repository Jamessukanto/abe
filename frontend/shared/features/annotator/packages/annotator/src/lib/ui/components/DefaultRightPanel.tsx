
import { useEditor, useValue } from '@annotator/editor'
import { memo } from 'react'
import { PORTRAIT_BREAKPOINT } from '../constants'
import { useBreakpoint } from '../context/breakpoints'
import { useAnnotatorUiComponents } from '../context/components'
import { AnnotatorUiToolbar } from './primitives/AnnotatorUiToolbar'
import classNames from 'classnames'


/** @public @react */
export const DefaultRightPanel = memo(function DefaultRightPanel() {
	const breakpoint = useBreakpoint()

	const { LayerTree, MainMenu, ActionsMenu } = useAnnotatorUiComponents()

	const editor = useEditor()

	if (!LayerTree) return null

	return (
		<div className={classNames('tlui-right-panel')}>

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
