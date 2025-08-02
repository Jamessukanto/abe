import { T } from '@annotator/validate'
import { AppRichText, richTextValidator, toRichText } from '../misc/AppRichText'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/AppShape'
import { RecordProps } from '../recordsWithProps'
import { DefaultColorStyle, AppDefaultColorStyle } from '../styles/AppColorStyle'
import { DefaultFontStyle, AppDefaultFontStyle } from '../styles/AppFontStyle'
import { DefaultSizeStyle, AppDefaultSizeStyle } from '../styles/AppSizeStyle'
import { DefaultTextAlignStyle, AppDefaultTextAlignStyle } from '../styles/AppTextAlignStyle'
import { AppBaseShape } from './AppBaseShape'

/** @public */
export interface AppTextShapeProps {
	color: AppDefaultColorStyle
	size: AppDefaultSizeStyle
	font: AppDefaultFontStyle
	textAlign: AppDefaultTextAlignStyle
	w: number
	richText: AppRichText
	scale: number
	autoSize: boolean
}

/** @public */
export type AppTextShape = AppBaseShape<'text', AppTextShapeProps>

/** @public */
export const textShapeProps: RecordProps<AppTextShape> = {
	color: DefaultColorStyle,
	size: DefaultSizeStyle,
	font: DefaultFontStyle,
	textAlign: DefaultTextAlignStyle,
	w: T.nonZeroNumber,
	richText: richTextValidator,
	scale: T.nonZeroNumber,
	autoSize: T.boolean,
}

const Versions = createShapePropsMigrationIds('text', {
	RemoveJustify: 1,
	AddTextAlign: 2,
	AddRichText: 3,
	RemoveFontSelection: 4,
	ReduceColorOptions: 5,
})

export { Versions as textShapeVersions }

/** @public */
export const textShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: Versions.RemoveJustify,
			up: (props) => {
				if (props.align === 'justify') {
					props.align = 'start'
				}
			},
			down: 'retired',
		},
		{
			id: Versions.AddTextAlign,
			up: (props) => {
				props.textAlign = props.align
				delete props.align
			},
			down: (props) => {
				props.align = props.textAlign
				delete props.textAlign
			},
		},
		{
			id: Versions.AddRichText,
			up: (props) => {
				props.richText = toRichText(props.text)
				delete props.text
			},
			// N.B. Explicitly no down state so that we force clients to update.
			// down: (props) => {
			// 	delete props.richText
			// },
		},
		{
			id: Versions.RemoveFontSelection,
			up: (props) => {
				// Convert all font values to 'sans'
				props.font = 'sans'
			},
			down: 'retired',
		},
		{
			id: Versions.ReduceColorOptions,
			up: (props) => {
				// Map old colors to new 5-color palette
				const colorMap: Record<string, string> = {
					'grey': 'black',
					'light-blue': 'blue',
					'light-green': 'green',
					'light-red': 'red',
					'light-violet': 'black',
					'orange': 'black',
					'violet': 'black',
					'yellow': 'black',
				}

				if (props.color && colorMap[props.color]) {
					props.color = colorMap[props.color] as any
				}
			},
			down: 'retired',
		},
	],
})
