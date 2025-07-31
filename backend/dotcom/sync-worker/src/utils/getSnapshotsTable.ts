import { Environment } from '../types'

export function getSnapshotsTable(env: Environment) {
	if (env.ANNOTATOR_ENV === 'production') {
		return 'snapshots'
	} else if (env.ANNOTATOR_ENV === 'staging' || env.ANNOTATOR_ENV === 'preview') {
		return 'snapshots_staging'
	}
	return 'snapshots_dev'
}
