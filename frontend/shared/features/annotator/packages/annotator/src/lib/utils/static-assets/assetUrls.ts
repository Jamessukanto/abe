import { RecursivePartial, getDefaultCdnBaseUrl } from '@annotator/editor'
import { useMemo } from 'react'

/** @public */
export interface TLEditorAssetUrls {
	fonts?: {
		annotator_mono?: string
		annotator_mono_italic?: string
		annotator_mono_bold?: string
		annotator_mono_italic_bold?: string
		annotator_serif?: string
		annotator_serif_italic?: string
		annotator_serif_bold?: string
		annotator_serif_italic_bold?: string
		annotator_sans?: string
		annotator_sans_italic?: string
		annotator_sans_bold?: string
		annotator_sans_italic_bold?: string
		annotator_draw?: string
		annotator_draw_italic?: string
		annotator_draw_bold?: string
		annotator_draw_italic_bold?: string
		[key: string]: string | undefined
	}
}

/** @public */
export let defaultEditorAssetUrls: TLEditorAssetUrls = {
	fonts: {
		annotator_mono: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-Medium.woff2`,
		annotator_mono_italic: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-MediumItalic.woff2`,
		annotator_mono_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-Bold.woff2`,
		annotator_mono_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexMono-BoldItalic.woff2`,
		annotator_serif: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-Medium.woff2`,
		annotator_serif_italic: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-MediumItalic.woff2`,
		annotator_serif_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-Bold.woff2`,
		annotator_serif_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSerif-BoldItalic.woff2`,
		annotator_sans: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-Medium.woff2`,
		annotator_sans_italic: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-MediumItalic.woff2`,
		annotator_sans_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-Bold.woff2`,
		annotator_sans_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/IBMPlexSans-BoldItalic.woff2`,
		annotator_draw: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Regular.woff2`,
		annotator_draw_italic: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Regular_Italic.woff2`,
		annotator_draw_bold: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Bold.woff2`,
		annotator_draw_italic_bold: `${getDefaultCdnBaseUrl()}/fonts/Shantell_Sans-Informal_Bold_Italic.woff2`,
	},
}

/** @internal */
export function setDefaultEditorAssetUrls(assetUrls: TLEditorAssetUrls) {
	defaultEditorAssetUrls = assetUrls
}

/** @internal */
export function useDefaultEditorAssetsWithOverrides(
	overrides?: RecursivePartial<TLEditorAssetUrls>
): TLEditorAssetUrls {
	return useMemo(() => {
		if (!overrides) return defaultEditorAssetUrls

		return {
			fonts: { ...defaultEditorAssetUrls.fonts, ...overrides?.fonts },
		}
	}, [overrides])
}
