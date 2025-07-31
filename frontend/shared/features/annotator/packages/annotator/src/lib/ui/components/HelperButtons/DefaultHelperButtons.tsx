import { ReactNode } from 'react'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { DefaultHelperButtonsContent } from './DefaultHelperButtonsContent'

/** @public */
export interface TLUiHelperButtonsProps {
	children?: ReactNode
}

/** @public @react */
export function DefaultHelperButtons({ children }: TLUiHelperButtonsProps) {
	const content = children ?? <DefaultHelperButtonsContent />
	return (
		<div className="tlui-helper-buttons">
			<AnnotatorUiMenuContextProvider type="helper-buttons" sourceId="helper-buttons">
				{content}
			</AnnotatorUiMenuContextProvider>
		</div>
	)
}
