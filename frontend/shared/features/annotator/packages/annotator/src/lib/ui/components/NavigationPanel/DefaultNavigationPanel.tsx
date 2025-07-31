import { usePassThroughWheelEvents } from '@annotator/editor'
import { memo, useCallback, useRef } from 'react'
import { PORTRAIT_BREAKPOINT } from '../../constants'
import { unwrapLabel, useActions } from '../../context/actions'
import { useBreakpoint } from '../../context/breakpoints'
import { useAnnotatorUiComponents } from '../../context/components'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { kbdStr } from '../../kbd-utils'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiToolbar, AnnotatorUiToolbarButton } from '../primitives/AnnotatorUiToolbar'

/** @public @react */
export const DefaultNavigationPanel = memo(function DefaultNavigationPanel() {
	const actions = useActions()
	const msg = useTranslation()
	const breakpoint = useBreakpoint()

	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	const [collapsed, setCollapsed] = useLocalStorageState('minimap', true)

	const toggleMinimap = useCallback(() => {
		setCollapsed((s) => !s)
	}, [setCollapsed])

	const { ZoomMenu, Minimap } = useAnnotatorUiComponents()

	if (breakpoint < PORTRAIT_BREAKPOINT.MOBILE) {
		return null
	}

	return (
		<div ref={ref} className="tlui-navigation-panel">
			<AnnotatorUiToolbar className="tlui-buttons__horizontal" label={msg('navigation-zone.title')}>
				{ZoomMenu && breakpoint < PORTRAIT_BREAKPOINT.TABLET ? (
					<ZoomMenu />
				) : (
					<>
						{!collapsed && (
							<AnnotatorUiToolbarButton
								type="icon"
								data-testid="minimap.zoom-out"
								title={`${msg(unwrapLabel(actions['zoom-out'].label))} ${kbdStr(actions['zoom-out'].kbd!)}`}
								onClick={() => actions['zoom-out'].onSelect('navigation-zone')}
							>
								<AnnotatorUiButtonIcon small icon="minus" />
							</AnnotatorUiToolbarButton>
						)}
						{ZoomMenu && <ZoomMenu key="zoom-menu" />}
						{!collapsed && (
							<AnnotatorUiToolbarButton
								type="icon"
								data-testid="minimap.zoom-in"
								title={`${msg(unwrapLabel(actions['zoom-in'].label))} ${kbdStr(actions['zoom-in'].kbd!)}`}
								onClick={() => actions['zoom-in'].onSelect('navigation-zone')}
							>
								<AnnotatorUiButtonIcon small icon="plus" />
							</AnnotatorUiToolbarButton>
						)}
						{Minimap && (
							<AnnotatorUiToolbarButton
								type="icon"
								data-testid="minimap.toggle-button"
								title={msg('navigation-zone.toggle-minimap')}
								onClick={toggleMinimap}
							>
								<AnnotatorUiButtonIcon small icon={collapsed ? 'chevron-right' : 'chevron-left'} />
							</AnnotatorUiToolbarButton>
						)}
					</>
				)}
			</AnnotatorUiToolbar>
			{Minimap && breakpoint >= PORTRAIT_BREAKPOINT.TABLET && !collapsed && <Minimap />}
		</div>
	)
})
