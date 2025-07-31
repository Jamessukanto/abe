import { registerAnnotatorLibraryVersion } from 'annotator'
// eslint-disable-next-line local/no-export-star
export * from 'annotator'

registerAnnotatorLibraryVersion(
	(globalThis as any).ANNOTATOR_LIBRARY_NAME,
	(globalThis as any).ANNOTATOR_LIBRARY_VERSION,
	(globalThis as any).ANNOTATOR_LIBRARY_MODULES
)
