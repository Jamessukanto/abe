import classNames from 'classnames'
import { AnnotatorUiIcon, TLUiIconJsx } from '../AnnotatorUiIcon'

/** @public */
export interface TLUiButtonIconProps {
	icon: string | TLUiIconJsx
	small?: boolean
	invertIcon?: boolean
	className?: string
}

/** @public @react */
export function AnnotatorUiButtonIcon({ icon, small, invertIcon, className }: TLUiButtonIconProps) {
	return (
		<AnnotatorUiIcon
			aria-hidden="true"
			label=""
			className={classNames("tlui-button__icon", className)}
			icon={icon}
			small={small}
			invertIcon={invertIcon}
		/>
	)
}

