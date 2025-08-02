import { T } from '@annotator/validate'
import { SetValue } from '../util-types'
import { AppCanvasUiColor, canvasUiColorTypeValidator } from './AppColor'
import { VecModel, vecModelValidator } from './geometry-types'

/**
 * The scribble states used by annotator.
 *
 *  @public */
export const APP_SCRIBBLE_STATES = new Set(['starting', 'paused', 'active', 'stopping'] as const)

/**
 * A type for the scribble used by annotator.
 *
 * @public */
export interface AppScribble {
	id: string
	points: VecModel[]
	size: number
	color: AppCanvasUiColor
	opacity: number
	state: SetValue<typeof APP_SCRIBBLE_STATES>
	delay: number
	shrink: number
	taper: boolean
}

/** @public */
export const scribbleValidator: T.ObjectValidator<AppScribble> = T.object({
	id: T.string,
	points: T.arrayOf(vecModelValidator),
	size: T.positiveNumber,
	color: canvasUiColorTypeValidator,
	opacity: T.number,
	state: T.setEnum(APP_SCRIBBLE_STATES),
	delay: T.number,
	shrink: T.number,
	taper: T.boolean,
})
