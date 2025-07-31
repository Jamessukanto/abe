import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultVerticalAlignStyle = StyleProp.defineEnum('annotator:verticalAlign', {
	defaultValue: 'middle',
	values: ['middle'],
})

/** @public */
export type TLDefaultVerticalAlignStyle = T.TypeOf<typeof DefaultVerticalAlignStyle>
