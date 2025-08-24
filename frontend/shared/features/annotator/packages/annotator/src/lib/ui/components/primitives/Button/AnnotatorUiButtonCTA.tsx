import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef } from 'react'

/** @public */
export interface TLUiButtonCTAProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	disabled?: boolean
}

/** @public @react */
export const AnnotatorUiButtonCTA = forwardRef<HTMLButtonElement, TLUiButtonCTAProps>(
	function AnnotatorUiButtonCTA({ children, className, ...props }, ref) {
		return (
			<button
				ref={ref}
				type="button"
				draggable={false}
				className={classNames('tlui-button__cta', className)}
				{...props}
			>
				{children}
			</button>
		)
	}
)
