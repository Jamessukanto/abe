import { T } from '@annotator/validate'
import { VecModel, vecModelValidator } from '../misc/geometry-types'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/TLShape'
import { RecordProps } from '../recordsWithProps'
import { DefaultColorStyle, TLDefaultColorStyle } from '../styles/TLColorStyle'
import { DefaultDashStyle, TLDefaultDashStyle } from '../styles/TLDashStyle'
import { DefaultFillStyle, TLDefaultFillStyle } from '../styles/TLFillStyle'
import { DefaultSizeStyle, TLDefaultSizeStyle } from '../styles/TLSizeStyle'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export interface AnnotatorShapeSegment {
	type: 'free' | 'straight'
	points: VecModel[]
}

/** @public */
export const DrawShapeSegment: T.ObjectValidator<AnnotatorShapeSegment> = T.object({
	type: T.literalEnum('free', 'straight'),
	points: T.arrayOf(vecModelValidator),
})

/** @public */
export interface AnnotatorShapeProps {
	color: TLDefaultColorStyle
	fill: TLDefaultFillStyle
	dash: TLDefaultDashStyle
	size: TLDefaultSizeStyle
	segments: AnnotatorShapeSegment[]
	isComplete: boolean
	isClosed: boolean
	isPen: boolean
	scale: number
}

/** @public */
export type AnnotatorShape = TLBaseShape<'draw', AnnotatorShapeProps>

/** @public */
export const drawShapeProps: RecordProps<AnnotatorShape> = {
	color: DefaultColorStyle,
	fill: DefaultFillStyle,
	dash: DefaultDashStyle,
	size: DefaultSizeStyle,
	segments: T.arrayOf(DrawShapeSegment),
	isComplete: T.boolean,
	isClosed: T.boolean,
	isPen: T.boolean,
	scale: T.nonZeroNumber,
}

const Versions = createShapePropsMigrationIds('draw', {
	AddInPen: 1,
	AddScale: 2,
	RemoveDashStyles: 3,
	RemoveSizeSelection: 4,
	ReduceColorOptions: 5,
})

export { Versions as drawShapeVersions }

/** @public */
export const drawShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: Versions.AddInPen,
			up: (props) => {
				// Rather than checking to see whether the shape is a pen at runtime,
				// from now on we're going to use the type of device reported to us
				// as well as the pressure data received; but for existing shapes we
				// need to check the pressure data to see if it's a pen or not.

				const { points } = props.segments[0]

				if (points.length === 0) {
					props.isPen = false
					return
				}

				let isPen = !(points[0].z === 0 || points[0].z === 0.5)

				if (points[1]) {
					// Double check if we have a second point (we probably should)
					isPen = isPen && !(points[1].z === 0 || points[1].z === 0.5)
				}
				props.isPen = isPen
			},
			down: 'retired',
		},
		{
			id: Versions.AddScale,
			up: (props) => {
				props.scale = 1
			},
			down: (props) => {
				delete props.scale
			},
		},
		{
			id: Versions.RemoveDashStyles,
			up: (props) => {
				// Convert all dash styles to 'solid' since dash styles are no longer supported
				if (props.dash && props.dash !== 'solid') {
					props.dash = 'solid'
				}
			},
			down: (props) => {
				// No down migration needed since we're removing functionality
			},
		},
		{
			id: Versions.RemoveSizeSelection,
			up: (props) => {
				// Convert all size values to 'm' since size selection is being removed
				if (props.size && props.size !== 'm') {
					props.size = 'm'
				}
			},
			down: (props) => {
				// No down migration needed since we're removing functionality
			},
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
