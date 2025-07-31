import { useAuth } from '@clerk/clerk-react'
import { ROOM_PREFIX } from '@annotator/dotcom-shared'
import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
	AnnotatorUiButton,
	AnnotatorUiButtonLabel,
	AnnotatorUiDialogBody,
	AnnotatorUiDialogCloseButton,
	AnnotatorUiDialogFooter,
	AnnotatorUiDialogHeader,
	AnnotatorUiDialogTitle,
	useDialogs,
} from 'annotator'
import { routes } from '../../../../routeDefs'
import { trackEvent } from '../../../../utils/analytics'
import { useMaybeApp } from '../../../hooks/useAppState'
import { F } from '../../../utils/i18n'
import { useGetFileName } from '../TlaEditorTopRightPanel'
import styles from './sneaky-legacy-modal.module.css'

function LegacyChangesModal({ onClose }: { onClose(): void }) {
	const { isSignedIn } = useAuth()
	const app = useMaybeApp()
	const navigate = useNavigate()
	const name = useGetFileName()

	const handleCopy = async () => {
		if (!app) return
		const res = await app.createFile({
			name,
			createSource: window.location.pathname.slice(1),
		})
		onClose()
		if (res?.ok) {
			const { file } = res.value
			navigate(routes.tlaFile(file.id))
			trackEvent('create-file', { source: 'legacy-import-button' })
		}
	}

	return (
		<div className={styles.dialog}>
			<AnnotatorUiDialogHeader>
				<AnnotatorUiDialogTitle>
					<F defaultMessage="This room is now read-only" />
				</AnnotatorUiDialogTitle>
				<AnnotatorUiDialogCloseButton />
			</AnnotatorUiDialogHeader>
			<AnnotatorUiDialogBody>
				<p>
					{isSignedIn ? (
						<F defaultMessage="To continue editing please copy the room to your files." />
					) : (
						<F defaultMessage="This anonymous annotator multiplayer room is now read-only. To continue editing, please sign in and copy it to your files." />
					)}
				</p>
			</AnnotatorUiDialogBody>
			<AnnotatorUiDialogFooter className={styles.footer}>
				{isSignedIn && (
					<AnnotatorUiButton type="primary" onClick={handleCopy}>
						<AnnotatorUiButtonLabel>
							<F defaultMessage="Copy to my files" />
						</AnnotatorUiButtonLabel>
					</AnnotatorUiButton>
				)}
				<AnnotatorUiButton type="normal" onClick={onClose} onTouchEnd={onClose}>
					<AnnotatorUiButtonLabel>
						<F defaultMessage="Close" />
					</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
			</AnnotatorUiDialogFooter>
		</div>
	)
}

export function SneakyLegacyModal() {
	const { addDialog, removeDialog } = useDialogs()
	const location = useLocation()
	const { isSignedIn } = useAuth()
	const [searchParams, setSearchParams] = useSearchParams()
	const app = useMaybeApp()

	useEffect(() => {
		if (!location.pathname.startsWith(`/${ROOM_PREFIX}/`)) {
			return
		}

		const id = addDialog({
			component: ({ onClose }) => <LegacyChangesModal onClose={onClose} />,
			preventBackgroundClose: true,
		})
		return () => {
			removeDialog(id)
		}
	}, [addDialog, removeDialog, location.pathname, searchParams, isSignedIn, setSearchParams, app])
	return null
}
