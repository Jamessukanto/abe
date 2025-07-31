// The parts of the module that are designed to run on the client.

import { registerAnnotatorLibraryVersion } from 'annotator'

// eslint-disable-next-line local/no-export-star
export type * from './lib/types'

export { AnnotatorAiModule, type AnnotatorAiModuleOptions } from './lib/annotatorAiModule'
export { AnnotatorAiTransform, type AnnotatorAiTransformConstructor } from './lib/annotatorAiTransform'
export {
	useAnnotatorAi,
	type AnnotatorAiGenerateFn,
	type AnnotatorAiOptions,
	type AnnotatorAiPromptOptions,
	type AnnotatorAiStreamFn,
} from './lib/useAnnotatorAi'
export { asMessage } from './lib/utils'

registerAnnotatorLibraryVersion(
	(globalThis as any).ANNOTATOR_LIBRARY_NAME,
	(globalThis as any).ANNOTATOR_LIBRARY_VERSION,
	(globalThis as any).ANNOTATOR_LIBRARY_MODULES
)
