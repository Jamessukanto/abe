import { uniq as _uniq } from '@annotator/utils'

/** @public */
export function uniq<T>(
	array:
		| {
				readonly length: number
				readonly [n: number]: T
		  }
		| null
		| undefined
): T[] {
	return _uniq(array)
}
