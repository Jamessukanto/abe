import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultHorizontalAlignStyle = StyleProp.defineEnum('annotator:horizontalAlign', {
	defaultValue: 'middle',
	values: ['start', 'middle', 'end'],
})

/** @public */
export type TLDefaultHorizontalAlignStyle = T.TypeOf<typeof DefaultHorizontalAlignStyle>
