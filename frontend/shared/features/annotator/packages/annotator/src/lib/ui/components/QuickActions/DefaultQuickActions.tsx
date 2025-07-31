import { ReactNode, memo } from 'react'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { DefaultQuickActionsContent } from './DefaultQuickActionsContent'

/** @public */
export interface TLUiQuickActionsProps {
	children?: ReactNode
}

/** @public @react */
export const DefaultQuickActions = memo(function DefaultQuickActions({
	children,
}: TLUiQuickActionsProps) {
	const content = children ?? <DefaultQuickActionsContent />

	return (
		<AnnotatorUiMenuContextProvider type="small-icons" sourceId="quick-actions">
			{content}
		</AnnotatorUiMenuContextProvider>
	)
})
