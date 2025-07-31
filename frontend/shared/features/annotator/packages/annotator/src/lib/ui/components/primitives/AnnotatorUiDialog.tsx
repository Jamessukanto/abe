import classNames from 'classnames'
import { Dialog as _Dialog } from 'radix-ui'
import { CSSProperties, ReactNode } from 'react'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from './Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from './Button/AnnotatorUiButtonIcon'

/** @public */
export interface TLUiDialogHeaderProps {
	className?: string
	children: ReactNode
}

/** @public @react */
export function AnnotatorUiDialogHeader({ className, children }: TLUiDialogHeaderProps) {
	return <div className={classNames('tlui-dialog__header', className)}>{children}</div>
}

/** @public */
export interface TLUiDialogTitleProps {
	className?: string
	children: ReactNode
	style?: CSSProperties
}

/** @public @react */
export function AnnotatorUiDialogTitle({ className, children, style }: TLUiDialogTitleProps) {
	return (
		<_Dialog.Title
			dir="ltr"
			className={classNames('tlui-dialog__header__title', className)}
			style={style}
		>
			{children}
		</_Dialog.Title>
	)
}

/** @public @react */
export function AnnotatorUiDialogCloseButton() {
	const msg = useTranslation()

	return (
		<div className="tlui-dialog__header__close">
			<_Dialog.DialogClose data-testid="dialog.close" dir="ltr" asChild>
				<AnnotatorUiButton
					type="icon"
					aria-label={msg('ui.close')}
					onTouchEnd={(e) => (e.target as HTMLButtonElement).click()}
				>
					<AnnotatorUiButtonIcon small icon="cross-2" />
				</AnnotatorUiButton>
			</_Dialog.DialogClose>
		</div>
	)
}

/** @public */
export interface TLUiDialogBodyProps {
	className?: string
	children: ReactNode
	style?: CSSProperties
}

/** @public @react */
export function AnnotatorUiDialogBody({ className, children, style }: TLUiDialogBodyProps) {
	return (
		<div className={classNames('tlui-dialog__body', className)} style={style} tabIndex={0}>
			{children}
		</div>
	)
}

/** @public */
export interface TLUiDialogFooterProps {
	className?: string
	children?: ReactNode
}

/** @public @react */
export function AnnotatorUiDialogFooter({ className, children }: TLUiDialogFooterProps) {
	return <div className={classNames('tlui-dialog__footer', className)}>{children}</div>
}
