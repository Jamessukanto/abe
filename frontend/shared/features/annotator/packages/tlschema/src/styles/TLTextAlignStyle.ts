import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultTextAlignStyle = StyleProp.defineEnum('annotator:textAlign', {
	defaultValue: 'start',
	values: ['start', 'middle', 'end'],
})

/** @public */
export type TLDefaultTextAlignStyle = T.TypeOf<typeof DefaultTextAlignStyle>
