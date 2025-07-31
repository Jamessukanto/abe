import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultDashStyle = StyleProp.defineEnum('annotator:dash', {
	defaultValue: 'draw',
	values: ['draw', 'solid', 'dashed', 'dotted'],
})

/** @public */
export type TLDefaultDashStyle = T.TypeOf<typeof DefaultDashStyle>
