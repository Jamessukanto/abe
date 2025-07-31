import { useValue } from '@annotator/editor'
import { Toast as _Toast } from 'radix-ui'
import { memo } from 'react'
import { AlertSeverity, TLUiToast, useToasts } from '../context/toasts'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { TLUiIconType } from '../icon-types'
import { AnnotatorUiButton } from './primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonLabel } from './primitives/Button/AnnotatorUiButtonLabel'
import { AnnotatorUiIcon } from './primitives/AnnotatorUiIcon'

const DEFAULT_TOAST_DURATION = 4000

const SEVERITY_TO_ICON: { [msg in AlertSeverity]: TLUiIconType } = {
	success: 'check-circle',
	warning: 'warning-triangle',
	error: 'cross-circle',
	info: 'info-circle',
}

/** @internal */
function AnnotatorUiToast({ toast }: { toast: TLUiToast }) {
	const { removeToast } = useToasts()
	const msg = useTranslation()

	const onOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			removeToast(toast.id)
		}
	}

	const hasActions = toast.actions && toast.actions.length > 0

	const icon = toast.icon || (toast.severity && SEVERITY_TO_ICON[toast.severity])
	const iconLabel = toast.iconLabel || (toast.severity ? msg(`toast.${toast.severity}`) : '')

	return (
		<_Toast.Root
			onOpenChange={onOpenChange}
			className="tlui-toast__container"
			duration={toast.keepOpen ? Infinity : DEFAULT_TOAST_DURATION}
			data-severity={toast.severity}
		>
			{icon && (
				<div className="tlui-toast__icon">
					<AnnotatorUiIcon label={iconLabel} icon={icon} />
				</div>
			)}
			<div
				className="tlui-toast__main"
				data-title={!!toast.title}
				data-description={!!toast.description}
				data-actions={!!toast.actions}
			>
				<div className="tlui-toast__content">
					{toast.title && <_Toast.Title className="tlui-toast__title">{toast.title}</_Toast.Title>}
					{toast.description && (
						<_Toast.Description className="tlui-toast__description">
							{toast.description}
						</_Toast.Description>
					)}
				</div>
				{toast.actions && (
					<div className="tlui-toast__actions">
						{toast.actions.map((action, i) => (
							<_Toast.Action key={i} altText={action.label} asChild onClick={action.onClick}>
								<AnnotatorUiButton type={action.type}>
									<AnnotatorUiButtonLabel>{action.label}</AnnotatorUiButtonLabel>
								</AnnotatorUiButton>
							</_Toast.Action>
						))}
						<_Toast.Close asChild>
							<AnnotatorUiButton
								type="normal"
								className="tlui-toast__close"
								style={{ marginLeft: 'auto' }}
							>
								<AnnotatorUiButtonLabel>{toast.closeLabel ?? msg('toast.close')}</AnnotatorUiButtonLabel>
							</AnnotatorUiButton>
						</_Toast.Close>
					</div>
				)}
			</div>
			{!hasActions && (
				<_Toast.Close asChild>
					<AnnotatorUiButton type="normal" className="tlui-toast__close">
						<AnnotatorUiButtonLabel>{toast.closeLabel ?? msg('toast.close')}</AnnotatorUiButtonLabel>
					</AnnotatorUiButton>
				</_Toast.Close>
			)}
		</_Toast.Root>
	)
}

/** @public @react */
export const DefaultToasts = memo(function AnnotatorUiToasts() {
	const { toasts } = useToasts()
	const toastsArray = useValue('toasts', () => toasts.get(), [])
	return (
		<>
			{toastsArray.map((toast) => (
				<AnnotatorUiToast key={toast.id} toast={toast} />
			))}
			<_Toast.ToastViewport className="tlui-toast__viewport" />
		</>
	)
})
