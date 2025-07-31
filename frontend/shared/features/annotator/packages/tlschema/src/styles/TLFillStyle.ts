import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultFillStyle = StyleProp.defineEnum('annotator:fill', {
	defaultValue: 'none',
	values: ['none', 'semi', 'solid', 'pattern', 'fill'],
})

/** @public */
export type TLDefaultFillStyle = T.TypeOf<typeof DefaultFillStyle>
