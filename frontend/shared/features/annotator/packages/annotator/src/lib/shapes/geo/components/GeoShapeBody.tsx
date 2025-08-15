import { TLGeoShape, useEditor, useValue } from '@annotator/editor'
import { ShapeFill } from '../../shared/ShapeFill'
import { STROKE_SIZES } from '../../shared/default-shape-constants'
import { useDefaultColorTheme } from '../../shared/useDefaultColorTheme'
import { getGeoShapePath } from '../getGeoShapePath'

export function GeoShapeBody({
	shape,
	shouldScale,
	forceSolid,
}: {
	shape: TLGeoShape
	shouldScale: boolean
	forceSolid: boolean
}) {
	const scaleToUse = shouldScale ? shape.props.scale : 1
	const theme = useDefaultColorTheme()
	const { props } = shape
	const { color, fill, size } = props
	const editor = useEditor()
	const zoom = useValue('zoomLevel', () => editor.getZoomLevel(), [editor])
	const strokeWidth = STROKE_SIZES[size] * scaleToUse / (zoom || 1)

	const path = getGeoShapePath(shape)
	const fillPath = path.toD({ onlyFilled: true })

	return (
		<>
			<ShapeFill theme={theme} d={fillPath} color={color} fill={fill} scale={scaleToUse} />
			{path.toSvg({
				style: 'solid',
				strokeWidth,
				forceSolid,
				// randomSeed: shape.id,
				props: { fill: 'none', stroke: theme[color].solid },
			})}
		</>
	)
}
