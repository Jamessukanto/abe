import { TLDefaultFontStyle, TLDefaultSizeStyle } from '@annotator/editor'

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
	s: 2,
	m: 3.5,
	l: 5,
	xl: 10,
}

/** @public */
export const FONT_SIZES: Record<TLDefaultSizeStyle, number> = {
	s: 18,
	m: 24,
	l: 36,
	xl: 44,
}

/** @public */
export const LABEL_FONT_SIZES: Record<TLDefaultSizeStyle, number> = {
	s: 18,
	m: 22,
	l: 26,
	xl: 32,
}

/** @public */
export const FONT_FAMILIES: Record<TLDefaultFontStyle, string> = {
	draw: 'var(--tl-font-draw)',
	sans: 'var(--tl-font-sans)',
	serif: 'var(--tl-font-serif)',
	mono: 'var(--tl-font-mono)',
}

/** @internal */
export const LABEL_PADDING = 16
