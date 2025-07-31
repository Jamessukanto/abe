import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultFontStyle = StyleProp.defineEnum('annotator:font', {
	defaultValue: 'draw',
	values: ['draw', 'sans', 'serif', 'mono'],
})

/** @public */
export type TLDefaultFontStyle = T.TypeOf<typeof DefaultFontStyle>

/** @public */
export const DefaultFontFamilies = {
	draw: "'annotator_draw', sans-serif",
	sans: "'annotator_sans', sans-serif",
	serif: "'annotator_serif', serif",
	mono: "'annotator_mono', monospace",
}
