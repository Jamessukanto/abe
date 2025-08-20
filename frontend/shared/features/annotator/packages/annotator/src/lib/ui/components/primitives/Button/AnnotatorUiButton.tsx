import classnames from 'classnames'
import * as React from 'react'

/** @public */
export interface TLUiButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	disabled?: boolean
	isActive?: boolean
	type: 'normal' | 'primary' | 'danger' | 'narrow' | 'low' | 'icon' | 'tool' | 'menu' | 'help'
}

const namedClassNamesSoThatICanGrepForThis = {
	normal: 'tlui-button__normal',
	primary: 'tlui-button__primary',
	danger: 'tlui-button__danger',
	narrow: 'tlui-button__narrow',
	low: 'tlui-button__low',
	icon: 'tlui-button__icon',
	tool: 'tlui-button__tool',
	menu: 'tlui-button__menu',
	help: 'tlui-button__help',
}

/** @public @react */
export const AnnotatorUiButton = React.forwardRef<HTMLButtonElement, TLUiButtonProps>(
	function AnnotatorUiButton({ children, type, isActive, ...props }, ref) {
		return (
			<button
				ref={ref}
				type="button"
				draggable={false}
				data-isactive={isActive}
				{...props}
				className={classnames(
					'tlui-button',
					namedClassNamesSoThatICanGrepForThis[type],
					props.className
				)}
			>
				{children}
			</button>
		)
	}
)
