import { ReactNode } from 'react'

/** @public */
export interface TLUiButtonLabelProps {
	children?: ReactNode
}

/** @public @react */
export function AnnotatorUiButtonLabel({ children }: TLUiButtonLabelProps) {
	return <span className="tlui-button__label">{children}</span>
}
