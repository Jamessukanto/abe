import { OfflineIndicator, useCollaborationStatus } from 'annotator'
import styles from '../top.module.css'

export function TlaEditorTopPanel() {
	const collaborationStatus = useCollaborationStatus()
	if (collaborationStatus === 'offline') {
		console.log('offline')
		return (
			<div className={styles.offlineIndicatorWrapper}>
				<OfflineIndicator />{' '}
			</div>
		)
	}
	console.log('online')
	return null
}
