import { T } from '@annotator/validate'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/TLShape'
import { RecordProps } from '../recordsWithProps'
import { DefaultColorStyle, TLDefaultColorStyle } from '../styles/TLColorStyle'
import { DefaultSizeStyle, TLDefaultSizeStyle } from '../styles/TLSizeStyle'
import { TLBaseShape } from './TLBaseShape'
import { DrawShapeSegment, AnnotatorShapeSegment } from './AnnotatorShape'

/** @public */
export interface TLHighlightShapeProps {
	color: TLDefaultColorStyle
	size: TLDefaultSizeStyle
	segments: AnnotatorShapeSegment[]
	isComplete: boolean
	isPen: boolean
	scale: number
}

/** @public */
export type TLHighlightShape = TLBaseShape<'highlight', TLHighlightShapeProps>

/** @public */
export const highlightShapeProps: RecordProps<TLHighlightShape> = {
	color: DefaultColorStyle,
	size: DefaultSizeStyle,
	segments: T.arrayOf(DrawShapeSegment),
	isComplete: T.boolean,
	isPen: T.boolean,
	scale: T.nonZeroNumber,
}

const Versions = createShapePropsMigrationIds('highlight', {
	AddScale: 1,
	ReduceColorOptions: 2,
})

export { Versions as highlightShapeVersions }

/** @public */
export const highlightShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
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
