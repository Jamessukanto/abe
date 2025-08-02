import { T } from '@annotator/validate'
import { AppRichText, richTextValidator, toRichText } from '../misc/AppRichText'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/AppShape'
import { RecordProps } from '../recordsWithProps'
import { StyleProp } from '../styles/StyleProp'
import {
	DefaultColorStyle,
	DefaulAppabelColorStyle,
	AppDefaultColorStyle,
} from '../styles/AppColorStyle'
import { DefaultDashStyle, AppDefaultDashStyle } from '../styles/AppDashStyle'
import { DefaultFillStyle, AppDefaultFillStyle } from '../styles/AppFillStyle'
import { DefaultFontStyle, AppDefaultFontStyle } from '../styles/AppFontStyle'
import {
	DefaultHorizontalAlignStyle,
	AppDefaultHorizontalAlignStyle,
} from '../styles/AppHorizontalAlignStyle'
import { DefaultSizeStyle, AppDefaultSizeStyle } from '../styles/AppSizeStyle'
import {
	DefaultVerticalAlignStyle,
	AppDefaultVerticalAlignStyle,
} from '../styles/AppVerticalAlignStyle'
import { AppBaseShape } from './AppBaseShape'

/** @public */
export const GeoShapeGeoStyle = StyleProp.defineEnum('annotator:geo', {
	defaultValue: 'rectangle',
	values: [
		'cloud',
		'rectangle',
		'ellipse',
		'check-box',
		'heart',
	],
})

/** @public */
export type AppGeoShapeGeoStyle = T.TypeOf<typeof GeoShapeGeoStyle>

/** @public */
export interface AppGeoShapeProps {
	geo: AppGeoShapeGeoStyle
	dash: AppDefaultDashStyle
	url: string
	w: number
	h: number
	growY: number
	scale: number

	// Text properties
	labelColor: AppDefaultColorStyle
	color: AppDefaultColorStyle
	fill: AppDefaultFillStyle
	size: AppDefaultSizeStyle
	font: AppDefaultFontStyle
	align: AppDefaultHorizontalAlignStyle
	verticalAlign: AppDefaultVerticalAlignStyle
	richText: AppRichText
}

/** @public */
export type AppGeoShape = AppBaseShape<'geo', AppGeoShapeProps>

/** @public */
export const geoShapeProps: RecordProps<AppGeoShape> = {
	geo: GeoShapeGeoStyle,
	dash: DefaultDashStyle,
	url: T.linkUrl,
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	growY: T.positiveNumber,
	scale: T.nonZeroNumber,

	// Text properties
	labelColor: DefaulAppabelColorStyle,
	color: DefaultColorStyle,
	fill: DefaultFillStyle,
	size: DefaultSizeStyle,
	font: DefaultFontStyle,
	align: DefaultHorizontalAlignStyle,
	verticalAlign: DefaultVerticalAlignStyle,
	richText: richTextValidator,
}

const geoShapeVersions = createShapePropsMigrationIds('geo', {
	AddUrlProp: 1,
	AddLabelColor: 2,
	RemoveJustify: 3,
	AddCheckBox: 4,
	AddVerticalAlign: 5,
	MigrateLegacyAlign: 6,
	AddCloud: 7,
	MakeUrlsValid: 8,
	AddScale: 9,
	AddRichText: 10,
	RemoveDashStyles: 11,
	RemoveSizeSelection: 12,
	RemoveFontSelection: 13,
	RemoveAlignmentOptions: 14,
	ReduceColorOptions: 15,
})

export { geoShapeVersions as geoShapeVersions }

/** @public */
export const geoShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: geoShapeVersions.AddUrlProp,
			up: (props) => {
				props.url = ''
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.AddLabelColor,
			up: (props) => {
				props.labelColor = 'black'
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.RemoveJustify,
			up: (props) => {
				if (props.align === 'justify') {
					props.align = 'start'
				}
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.AddCheckBox,
			up: (_props) => {
				// noop
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.AddVerticalAlign,
			up: (props) => {
				props.verticalAlign = 'middle'
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.MigrateLegacyAlign,
			up: (props) => {
				// Always set to middle since we're removing alignment options
				props.align = 'middle'
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.AddCloud,
			up: (_props) => {
				// noop
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.MakeUrlsValid,
			up: (props) => {
				if (!T.linkUrl.isValid(props.url)) {
					props.url = ''
				}
			},
			down: (_props) => {
				// noop
			},
		},
		{
			id: geoShapeVersions.AddScale,
			up: (props) => {
				props.scale = 1
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.AddRichText,
			up: (props) => {
				props.richText = toRichText(props.text)
				delete props.text
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.RemoveDashStyles,
			up: (props) => {
				props.dash = 'solid'
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.RemoveSizeSelection,
			up: (props) => {
				props.size = 'm'
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.RemoveFontSelection,
			up: (props) => {
				// Convert all font values to 'sans'
				props.font = 'sans'
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.RemoveAlignmentOptions,
			up: (props) => {
				// Convert all alignment values to 'middle'
				props.align = 'middle'
				props.verticalAlign = 'middle'
			},
			down: 'retired',
		},
		{
			id: geoShapeVersions.ReduceColorOptions,
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

				if (props.labelColor && colorMap[props.labelColor]) {
					props.labelColor = colorMap[props.labelColor] as any
				}
			},
			down: 'retired',
		},
	],
})
