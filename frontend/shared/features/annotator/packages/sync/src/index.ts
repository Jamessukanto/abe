import { registerAnnotatorLibraryVersion } from '@annotator/utils'
// eslint-disable-next-line local/no-export-star
export * from '@annotator/sync-core'

export { useSync, type RemoteTLStoreWithStatus, type UseSyncOptions } from './useSync'
export { useSyncDemo, type UseSyncDemoOptions } from './useSyncDemo'

registerAnnotatorLibraryVersion(
	(globalThis as any).ANNOTATOR_LIBRARY_NAME,
	(globalThis as any).ANNOTATOR_LIBRARY_VERSION,
	(globalThis as any).ANNOTATOR_LIBRARY_MODULES
)
