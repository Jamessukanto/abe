import { ReactNode } from 'react'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import {
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuTrigger,
} from '../primitives/AnnotatorUiDropdownMenu'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { DefaultDebugMenuContent } from './DefaultDebugMenuContent'

/** @public */
export interface TLUiDebugMenuProps {
	children?: ReactNode
}

/** @public @react */
export function DefaultDebugMenu({ children }: TLUiDebugMenuProps) {
	const content = children ?? <DefaultDebugMenuContent />

	return (
		<AnnotatorUiDropdownMenuRoot id="debug">
			<AnnotatorUiDropdownMenuTrigger>
				<AnnotatorUiButton type="icon" title="Debug menu">
					<AnnotatorUiButtonIcon icon="dots-horizontal" />
				</AnnotatorUiButton>
			</AnnotatorUiDropdownMenuTrigger>
			<AnnotatorUiDropdownMenuContent side="top" align="end" alignOffset={0}>
				<AnnotatorUiMenuContextProvider type="menu" sourceId="debug-panel">
					{content}
				</AnnotatorUiMenuContextProvider>
			</AnnotatorUiDropdownMenuContent>
		</AnnotatorUiDropdownMenuRoot>
	)
}
