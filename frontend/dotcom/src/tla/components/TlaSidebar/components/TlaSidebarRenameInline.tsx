import classNames from 'classnames'
import { useCallback, useRef } from 'react'
import { AnnotatorUiInput } from 'annotator'
import { useApp } from '../../../hooks/useAppState'
import { TLAppUiEventSource, useAnnotatorAppUiEvents } from '../../../utils/app-ui-events'
import styles from '../sidebar.module.css'

export function TlaSidebarRenameInline({
	fileId,
	onClose,
	source,
}: {
	fileId: string
	onClose(): void
	source: TLAppUiEventSource
}) {
	const app = useApp()
	const ref = useRef<HTMLInputElement>(null)
	const wasSaved = useRef(false)
	const trackEvent = useAnnotatorAppUiEvents()

	const handleSave = useCallback(() => {
		if (wasSaved.current) return
		// rename the file
		const elm = ref.current
		if (!elm) return
		const name = elm.value.slice(0, 312).trim()

		if (name) {
			// Only update the name if there is a name there to update
			app.updateFile(fileId, { name })
			wasSaved.current = true
		}
		trackEvent('rename-file', { name, source })
		onClose()
	}, [app, fileId, onClose, trackEvent, source])

	return (
		<div className={styles.sidebarFileListItemRenameInputWrapper}>
			<AnnotatorUiInput
				ref={ref}
				data-testid="tla-sidebar-rename-input"
				className={classNames(styles.sidebarFileListItemRenameInput, 'tla-text_ui__regular')}
				defaultValue={app.getFileName(fileId)}
				onComplete={handleSave}
				onCancel={onClose}
				onBlur={handleSave}
				autoSelect
				autoFocus
			/>
		</div>
	)
}
