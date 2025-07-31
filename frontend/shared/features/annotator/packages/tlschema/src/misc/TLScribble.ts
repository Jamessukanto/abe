import { T } from '@annotator/validate'
import { SetValue } from '../util-types'
import { TLCanvasUiColor, canvasUiColorTypeValidator } from './TLColor'
import { VecModel, vecModelValidator } from './geometry-types'

/**
 * The scribble states used by annotator.
 *
 *  @public */
export const TL_SCRIBBLE_STATES = new Set(['starting', 'paused', 'active', 'stopping'] as const)

/**
 * A type for the scribble used by annotator.
 *
 * @public */
export interface TLScribble {
	id: string
	points: VecModel[]
	size: number
	color: TLCanvasUiColor
	opacity: number
	state: SetValue<typeof TL_SCRIBBLE_STATES>
	delay: number
	shrink: number
	taper: boolean
}

/** @public */
export const scribbleValidator: T.ObjectValidator<TLScribble> = T.object({
	id: T.string,
	points: T.arrayOf(vecModelValidator),
	size: T.positiveNumber,
	color: canvasUiColorTypeValidator,
	opacity: T.number,
	state: T.setEnum(TL_SCRIBBLE_STATES),
	delay: T.number,
	shrink: T.number,
	taper: T.boolean,
})
