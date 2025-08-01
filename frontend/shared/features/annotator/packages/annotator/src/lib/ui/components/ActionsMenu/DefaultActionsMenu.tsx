import { useEditor, usePassThroughWheelEvents, useValue } from '@annotator/editor'
import { ReactNode, memo, useRef } from 'react'
import { PORTRAIT_BREAKPOINT } from '../../constants'
import { useBreakpoint } from '../../context/breakpoints'
import { useReadonly } from '../../hooks/useReadonly'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import {
	AnnotatorUiPopover,
	AnnotatorUiPopoverContent,
	AnnotatorUiPopoverTrigger,
} from '../primitives/AnnotatorUiPopover'
import { AnnotatorUiToolbar, AnnotatorUiToolbarButton } from '../primitives/AnnotatorUiToolbar'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { DefaultActionsMenuContent } from './DefaultActionsMenuContent'

/** @public */
export interface TLUiActionsMenuProps {
	children?: ReactNode
}

/** @public @react */
export const DefaultActionsMenu = memo(function DefaultActionsMenu({
	children,
}: TLUiActionsMenuProps) {
	const msg = useTranslation()
	const breakpoint = useBreakpoint()
	const isReadonlyMode = useReadonly()

	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	const editor = useEditor()
	const isInAcceptableReadonlyState = useValue(
		'should display quick actions when in readonly',
		() => editor.isInAny('hand', 'zoom'),
		[editor]
	)

	// Get the actions menu content, either the default component or the user's
	// override. If there's no menu content, then the user has set it to null,
	// so skip rendering the menu.

	const content = children ?? <DefaultActionsMenuContent />
	if (isReadonlyMode && !isInAcceptableReadonlyState) return

	return (
		<AnnotatorUiPopover id="actions-menu">
			<AnnotatorUiPopoverTrigger>
				<AnnotatorUiToolbarButton
					type="icon"
					data-testid="actions-menu.button"
					title={msg('actions-menu.title')}
				>
					<AnnotatorUiButtonIcon icon="dots-vertical" small />
				</AnnotatorUiToolbarButton>
			</AnnotatorUiPopoverTrigger>
			<AnnotatorUiPopoverContent
				side={breakpoint >= PORTRAIT_BREAKPOINT.TABLET ? 'bottom' : 'top'}
				sideOffset={6}
			>
				<AnnotatorUiToolbar
					ref={ref}
					label={msg('actions-menu.title')}
					className="tlui-actions-menu tlui-buttons__grid"
					data-testid="actions-menu.content"
				>
					<AnnotatorUiMenuContextProvider type="icons" sourceId="actions-menu">
						{content}
					</AnnotatorUiMenuContextProvider>
				</AnnotatorUiToolbar>
			</AnnotatorUiPopoverContent>
		</AnnotatorUiPopover>
	)
})
