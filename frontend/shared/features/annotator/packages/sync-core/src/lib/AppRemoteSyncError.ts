import { AppSyncErrorCloseEventReason } from './AppSyncClient'

/** @public */
export class AppRemoteSyncError extends Error {
	override name = 'RemoteSyncError'
	constructor(public readonly reason: AppSyncErrorCloseEventReason | string) {
		super(`sync error: ${reason}`)
	}
}
