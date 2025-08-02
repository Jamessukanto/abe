import { T } from '@annotator/validate'
import { SetValue } from '../util-types'

/**
 * The cursor types used by annotator's default shapes.
 *
 * @public */
export const APP_CURSOR_TYPES = new Set([
	'none',
	'default',
	'pointer',
	'cross',
	'grab',
	'rotate',
	'grabbing',
	'resize-edge',
	'resize-corner',
	'text',
	'move',
	'ew-resize',
	'ns-resize',
	'nesw-resize',
	'nwse-resize',
	'nesw-rotate',
	'nwse-rotate',
	'swne-rotate',
	'senw-rotate',
	'zoom-in',
	'zoom-out',
])

/**
 * A type for the cursor types used by annotator's default shapes.
 *
 *  @public */
export type AppCursorType = SetValue<typeof APP_CURSOR_TYPES>

/** @public */
export const cursorTypeValidator = T.setEnum(APP_CURSOR_TYPES)

/**
 * A cursor used by annotator.
 *
 *  @public */
export interface AppCursor {
	type: AppCursorType
	rotation: number
}

/** @public */
export const cursorValidator: T.ObjectValidator<AppCursor> = T.object<AppCursor>({
	type: cursorTypeValidator,
	rotation: T.number,
})
