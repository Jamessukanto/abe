import { objectMapValues, TLFontFace } from '@annotator/editor'

/** @public */
export interface TLDefaultFont {
	normal: {
		normal: TLFontFace
		bold: TLFontFace
	}
	italic: {
		normal: TLFontFace
		bold: TLFontFace
	}
}
/** @public */
export interface TLDefaultFonts {
	annotator_draw: TLDefaultFont
	annotator_sans: TLDefaultFont
	annotator_serif: TLDefaultFont
	annotator_mono: TLDefaultFont
}

/** @public */
export const DefaultFontFaces: TLDefaultFonts = {
	annotator_draw: {
		normal: {
			normal: {
				family: 'annotator_draw',
				src: { url: 'annotator_draw', format: 'woff2' },
				weight: 'normal',
			},
			bold: {
				family: 'annotator_draw',
				src: { url: 'annotator_draw_bold', format: 'woff2' },
				weight: 'bold',
			},
		},
		italic: {
			normal: {
				family: 'annotator_draw',
				src: { url: 'annotator_draw_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'annotator_draw',
				src: { url: 'annotator_draw_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
	annotator_sans: {
		normal: {
			normal: {
				family: 'annotator_sans',
				src: { url: 'annotator_sans', format: 'woff2' },
				weight: 'normal',
				style: 'normal',
			},
			bold: {
				family: 'annotator_sans',
				src: { url: 'annotator_sans_bold', format: 'woff2' },
				weight: 'bold',
				style: 'normal',
			},
		},
		italic: {
			normal: {
				family: 'annotator_sans',
				src: { url: 'annotator_sans_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'annotator_sans',
				src: { url: 'annotator_sans_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
	annotator_serif: {
		normal: {
			normal: {
				family: 'annotator_serif',
				src: { url: 'annotator_serif', format: 'woff2' },
				weight: 'normal',
				style: 'normal',
			},
			bold: {
				family: 'annotator_serif',
				src: { url: 'annotator_serif_bold', format: 'woff2' },
				weight: 'bold',
				style: 'normal',
			},
		},
		italic: {
			normal: {
				family: 'annotator_serif',
				src: { url: 'annotator_serif_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'annotator_serif',
				src: { url: 'annotator_serif_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
	annotator_mono: {
		normal: {
			normal: {
				family: 'annotator_mono',
				src: { url: 'annotator_mono', format: 'woff2' },
				weight: 'normal',
				style: 'normal',
			},
			bold: {
				family: 'annotator_mono',
				src: { url: 'annotator_mono_bold', format: 'woff2' },
				weight: 'bold',
				style: 'normal',
			},
		},
		italic: {
			normal: {
				family: 'annotator_mono',
				src: { url: 'annotator_mono_italic', format: 'woff2' },
				weight: 'normal',
				style: 'italic',
			},
			bold: {
				family: 'annotator_mono',
				src: { url: 'annotator_mono_italic_bold', format: 'woff2' },
				weight: 'bold',
				style: 'italic',
			},
		},
	},
}

/** @public */
export const allDefaultFontFaces = objectMapValues(DefaultFontFaces).flatMap((font) =>
	objectMapValues(font).flatMap((fontFace) => Object.values(fontFace))
)
