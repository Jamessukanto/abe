import { usePassThroughWheelEvents } from '@annotator/editor'
import { ReactNode, memo, useRef } from 'react'
import { PORTRAIT_BREAKPOINT } from '../../constants'
import { useBreakpoint } from '../../context/breakpoints'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import {
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuTrigger,
} from '../primitives/AnnotatorUiDropdownMenu'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { DefaultHelpMenuContent } from './DefaultHelpMenuContent'

/** @public */
export interface TLUiHelpMenuProps {
	children?: ReactNode
}

/** @public @react */
export const DefaultHelpMenu = memo(function DefaultHelpMenu({ children }: TLUiHelpMenuProps) {
	const msg = useTranslation()
	const breakpoint = useBreakpoint()

	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	// Get the help menu content, either the default component or the user's
	// override. If there's no menu content, then the user has set it to null,
	// so skip rendering the menu.
	const content = children ?? <DefaultHelpMenuContent />

	if (breakpoint < PORTRAIT_BREAKPOINT.MOBILE) return null

	return (
		<div ref={ref} className="tlui-help-menu">
			<AnnotatorUiDropdownMenuRoot id="help menu">
				<AnnotatorUiDropdownMenuTrigger>
					<AnnotatorUiButton type="help" title={msg('help-menu.title')} data-testid="help-menu.button">
						<AnnotatorUiButtonIcon icon="question-mark" small />
					</AnnotatorUiButton>
				</AnnotatorUiDropdownMenuTrigger>
				<AnnotatorUiDropdownMenuContent side="top" align="end" alignOffset={0} sideOffset={8}>
					<AnnotatorUiMenuContextProvider type="menu" sourceId="help-menu">
						{content}
					</AnnotatorUiMenuContextProvider>
				</AnnotatorUiDropdownMenuContent>
			</AnnotatorUiDropdownMenuRoot>
		</div>
	)
})
