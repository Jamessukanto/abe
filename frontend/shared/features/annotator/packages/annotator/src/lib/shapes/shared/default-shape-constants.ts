import { TLDefaultFontStyle, TLDefaultSizeStyle } from '@annotator/tlschema'

/** @public */
export const TEXT_PROPS = {
	lineHeight: 1.35,
	fontWeight: 'normal',
	fontVariant: 'normal',
	fontStyle: 'normal',
	padding: '0px',
}

/** @public */
export const STROKE_SIZES: Record<TLDefaultSizeStyle, number> = {
	m: 3.5,
}

/** @public */
export const FONT_SIZES: Record<TLDefaultSizeStyle, number> = {
	m: 24,
}

/** @public */
export const LABEL_FONT_SIZES: Record<TLDefaultSizeStyle, number> = {
	m: 24,
}

/** @public */
export const FONT_FAMILIES: Record<TLDefaultFontStyle, string> = {
	sans: 'var(--tl-font-sans)',
}

/** @internal */
export const LABEL_PADDING = 16
