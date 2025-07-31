import classNames from 'classnames'
import { ReactNode, memo } from 'react'
import { PORTRAIT_BREAKPOINT } from '../../constants'
import { useBreakpoint } from '../../context/breakpoints'
import { TLUiDialogProps } from '../../context/dialogs'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import {
	AnnotatorUiDialogBody,
	AnnotatorUiDialogCloseButton,
	AnnotatorUiDialogHeader,
	AnnotatorUiDialogTitle,
} from '../primitives/AnnotatorUiDialog'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { DefaultKeyboardShortcutsDialogContent } from './DefaultKeyboardShortcutsDialogContent'

/** @public */
export type TLUiKeyboardShortcutsDialogProps = TLUiDialogProps & {
	children?: ReactNode
}

/** @public @react */
export const DefaultKeyboardShortcutsDialog = memo(function DefaultKeyboardShortcutsDialog({
	children,
}: TLUiKeyboardShortcutsDialogProps) {
	const msg = useTranslation()
	const breakpoint = useBreakpoint()

	const content = children ?? <DefaultKeyboardShortcutsDialogContent />

	return (
		<>
			<AnnotatorUiDialogHeader className="tlui-shortcuts-dialog__header">
				<AnnotatorUiDialogTitle>{msg('shortcuts-dialog.title')}</AnnotatorUiDialogTitle>
				<AnnotatorUiDialogCloseButton />
			</AnnotatorUiDialogHeader>
			<AnnotatorUiDialogBody
				className={classNames('tlui-shortcuts-dialog__body', {
					'tlui-shortcuts-dialog__body__mobile': breakpoint <= PORTRAIT_BREAKPOINT.MOBILE_XS,
					'tlui-shortcuts-dialog__body__tablet': breakpoint <= PORTRAIT_BREAKPOINT.TABLET,
				})}
			>
				<AnnotatorUiMenuContextProvider type="keyboard-shortcuts" sourceId="kbd">
					{content}
				</AnnotatorUiMenuContextProvider>
			</AnnotatorUiDialogBody>
			<div className="tlui-dialog__scrim" />
		</>
	)
})
