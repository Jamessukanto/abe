import { IndexKey } from '@annotator/utils'
import { SetValue } from '../util-types'

/**
 * The handle types used by annotator's default shapes.
 *
 * @public */
export const TL_HANDLE_TYPES = new Set(['vertex', 'virtual', 'create', 'clone'] as const)

/**
 * A type for the handle types used by annotator's default shapes.
 *
 * @public */
export type TLHandleType = SetValue<typeof TL_HANDLE_TYPES>

/**
 * A base interface for a shape's handles.
 *
 * @public
 */
export interface TLHandle {
	/** A unique identifier for the handle. */
	id: string
	// TODO(mime): this needs to be required.
	label?: string
	type: TLHandleType
	canSnap?: boolean
	index: IndexKey
	x: number
	y: number
}
