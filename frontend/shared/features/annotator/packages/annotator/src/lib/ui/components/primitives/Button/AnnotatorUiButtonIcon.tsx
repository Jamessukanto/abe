import { AnnotatorUiIcon, TLUiIconJsx } from '../AnnotatorUiIcon'

/** @public */
export interface TLUiButtonIconProps {
	icon: string | TLUiIconJsx
	small?: boolean
	invertIcon?: boolean
}

/** @public @react */
export function AnnotatorUiButtonIcon({ icon, small, invertIcon }: TLUiButtonIconProps) {
	return (
		<AnnotatorUiIcon
			aria-hidden="true"
			label=""
			className="tlui-button__icon"
			icon={icon}
			small={small}
			invertIcon={invertIcon}
		/>
	)
}
