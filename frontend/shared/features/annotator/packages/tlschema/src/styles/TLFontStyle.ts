import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultFontStyle = StyleProp.defineEnum('annotator:font', {
	defaultValue: 'sans',
	values: ['sans'],
})

/** @public */
export type TLDefaultFontStyle = T.TypeOf<typeof DefaultFontStyle>

/** @public */
export const DefaultFontFamilies = {
	sans: "'annotator_sans', sans-serif",
}
