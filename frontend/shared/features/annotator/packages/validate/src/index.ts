import { registerAnnotatorLibraryVersion } from '@annotator/utils'
import * as T from './lib/validation'

export {
	ArrayOfValidator,
	DictValidator,
	ObjectValidator,
	UnionValidator,
	Validator,
	type UnionValidatorConfig,
} from './lib/validation'
export { T }

registerAnnotatorLibraryVersion(
	(globalThis as any).ANNOTATOR_LIBRARY_NAME,
	(globalThis as any).ANNOTATOR_LIBRARY_VERSION,
	(globalThis as any).ANNOTATOR_LIBRARY_MODULES
)
