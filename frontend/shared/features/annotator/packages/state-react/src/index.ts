import { registerAnnotatorLibraryVersion } from '@annotator/utils'
export { track } from './lib/track'
export { useAtom } from './lib/useAtom'
export { useComputed } from './lib/useComputed'
export { useQuickReactor } from './lib/useQuickReactor'
export { useReactor } from './lib/useReactor'
export { useStateTracking } from './lib/useStateTracking'
export { useValue } from './lib/useValue'

registerAnnotatorLibraryVersion(
	(globalThis as any).ANNOTATOR_LIBRARY_NAME,
	(globalThis as any).ANNOTATOR_LIBRARY_VERSION,
	(globalThis as any).ANNOTATOR_LIBRARY_MODULES
)
