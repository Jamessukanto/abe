import {
	Box,
	DefaultFontFamilies,
	TLDefaultFontStyle,
	TLDefaultHorizontalAlignStyle,
	TLDefaultVerticalAlignStyle,
	useEditor,
} from '@annotator/editor'
import { createTextJsxFromSpans } from './createTextJsxFromSpans'
import { TEXT_PROPS } from './default-shape-constants'
import { useDefaultColorTheme } from './useDefaultColorTheme'

export function SvgTextLabel({
	fontSize,
	font,
	text,
	labelColor,
	bounds,
	padding = 16,
	stroke = true,
	showTextOutline = true,
}: {
	fontSize: number
	font: TLDefaultFontStyle
	text: string
	labelColor: string
	bounds: Box
	padding?: number
	stroke?: boolean
	showTextOutline?: boolean
}) {
	const editor = useEditor()
	const theme = useDefaultColorTheme()

	const opts = {
		fontSize,
		fontFamily: DefaultFontFamilies[font],
		textAlign: 'middle' as const,
		verticalTextAlign: 'middle' as const,
		width: Math.ceil(bounds.width),
		height: Math.ceil(bounds.height),
		padding,
		lineHeight: TEXT_PROPS.lineHeight,
		fontStyle: 'normal',
		fontWeight: 'normal',
		overflow: 'wrap' as const,
		offsetX: 0,
		offsetY: 0,
		fill: labelColor,
		stroke: undefined as string | undefined,
		strokeWidth: undefined as number | undefined,
	}

	const spans = editor.textMeasure.measureTextSpans(text, opts)
	const offsetX = 0 // getLegacyOffsetX(align, padding, spans, bounds.width)
	if (offsetX) {
		opts.offsetX = offsetX
	}

	opts.offsetX += bounds.x
	opts.offsetY += bounds.y

	const mainSpans = createTextJsxFromSpans(editor, spans, opts)

	let outlineSpans = null
	if (showTextOutline && stroke) {
		opts.fill = theme.background
		opts.stroke = theme.background
		opts.strokeWidth = 3
		outlineSpans = createTextJsxFromSpans(editor, spans, opts)
	}

	return (
		<>
			{outlineSpans}
			{mainSpans}
		</>
	)
}
