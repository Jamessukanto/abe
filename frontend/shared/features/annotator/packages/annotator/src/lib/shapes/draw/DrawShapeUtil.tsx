import {
	Box,
	Circle2d,
	Polygon2d,
	Polyline2d,
	SVGContainer,
	ShapeUtil,
	SvgExportContext,
	AnnotatorShape,
	AnnotatorShapeProps,
	AnnotatorShapeSegment,
	TLResizeInfo,
	TLShapeUtilCanvasSvgDef,
	VecLike,
	drawShapeMigrations,
	drawShapeProps,
	last,
	lerp,
	rng,
	toFixed,
	useEditor,
	useValue,
} from '@annotator/editor'

import { ShapeFill } from '../shared/ShapeFill'
import { STROKE_SIZES } from '../shared/default-shape-constants'
import { getFillDefForCanvas, getFillDefForExport } from '../shared/defaultStyleDefs'
import { getStrokePoints } from '../shared/freehand/getStrokePoints'
import { getSvgPathFromStrokePoints } from '../shared/freehand/svg'
import { svgInk } from '../shared/freehand/svgInk'
import { interpolateSegments } from '../shared/interpolate-props'
import { useDefaultColorTheme } from '../shared/useDefaultColorTheme'
import { getFreehandOptions, getPointsFromSegments } from './getPath'

/** @public */
export interface DrawShapeOptions {
	/**
	 * The maximum number of points in a line before the draw tool will begin a new shape.
	 * A higher number will lead to poor performance while drawing very long lines.
	 */
	readonly maxPointsPerShape: number
}

/** @public */
export class DrawShapeUtil extends ShapeUtil<AnnotatorShape> {
	static override type = 'draw' as const
	static override props = drawShapeProps
	static override migrations = drawShapeMigrations

	override options: DrawShapeOptions = {
		maxPointsPerShape: 600,
	}

	override hideResizeHandles(shape: AnnotatorShape) {
		return getIsDot(shape)
	}
	override hideRotateHandle(shape: AnnotatorShape) {
		return getIsDot(shape)
	}
	override hideSelectionBoundsFg(shape: AnnotatorShape) {
		return getIsDot(shape)
	}

	override getDefaultProps(): AnnotatorShape['props'] {
		return {
			segments: [],
			color: 'black',
			fill: 'none',
			dash: 'solid',
			size: 'm',
			isComplete: false,
			isClosed: false,
			isPen: false,
			scale: 1,
		}
	}

	getGeometry(shape: AnnotatorShape) {
		const points = getPointsFromSegments(shape.props.segments)

		const sw = (STROKE_SIZES[shape.props.size] + 1) * shape.props.scale

		// A dot
		if (shape.props.segments.length === 1) {
			const box = Box.FromPoints(points)
			if (box.width < sw * 2 && box.height < sw * 2) {
				return new Circle2d({
					x: -sw,
					y: -sw,
					radius: sw,
					isFilled: true,
				})
			}
		}

		const strokePoints = getStrokePoints(
			points,
			getFreehandOptions(shape.props, sw, shape.props.isPen, true)
		).map((p) => p.point)

		// A closed draw stroke
		if (shape.props.isClosed && strokePoints.length > 2) {
			return new Polygon2d({
				points: strokePoints,
				isFilled: shape.props.fill !== 'none',
			})
		}

		if (strokePoints.length === 1) {
			return new Circle2d({
				x: -sw,
				y: -sw,
				radius: sw,
				isFilled: true,
			})
		}

		// An open draw stroke
		return new Polyline2d({
			points: strokePoints,
		})
	}

	component(shape: AnnotatorShape) {
		return (
			<SVGContainer>
				<DrawShapeSvg shape={shape} />
			</SVGContainer>
		)
	}

	indicator(shape: AnnotatorShape) {
		const allPointsFromSegments = getPointsFromSegments(shape.props.segments)

		let sw = (STROKE_SIZES[shape.props.size] + 1) * shape.props.scale

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const forceSolid = useValue(
			'force solid',
			() => {
				const zoomLevel = this.editor.getZoomLevel()
				return zoomLevel < 0.5 && zoomLevel < 1.5 / sw
			},
			[this.editor, sw]
		)

		const showAsComplete = shape.props.isComplete || last(shape.props.segments)?.type === 'straight'
		const options = getFreehandOptions(shape.props, sw, showAsComplete, true)
		const strokePoints = getStrokePoints(allPointsFromSegments, options)
		const solidStrokePath =
			strokePoints.length > 1
				? getSvgPathFromStrokePoints(strokePoints, shape.props.isClosed)
				: getDot(allPointsFromSegments[0], sw)

		return <path d={solidStrokePath} />
	}

	override toSvg(shape: AnnotatorShape, ctx: SvgExportContext) {
		ctx.addExportDef(getFillDefForExport(shape.props.fill))
		const scaleFactor = 1 / shape.props.scale
		return (
			<g transform={`scale(${scaleFactor})`}>
				<DrawShapeSvg shape={shape} zoomOverride={1} />
			</g>
		)
	}

	override getCanvasSvgDefs(): TLShapeUtilCanvasSvgDef[] {
		return [getFillDefForCanvas()]
	}

	override onResize(shape: AnnotatorShape, info: TLResizeInfo<AnnotatorShape>) {
		const { scaleX, scaleY } = info

		const newSegments: AnnotatorShapeSegment[] = []

		for (const segment of shape.props.segments) {
			newSegments.push({
				...segment,
				points: segment.points.map(({ x, y, z }) => {
					return {
						x: toFixed(scaleX * x),
						y: toFixed(scaleY * y),
						z,
					}
				}),
			})
		}

		return {
			props: {
				segments: newSegments,
			},
		}
	}

	override expandSelectionOutlinePx(shape: AnnotatorShape): number {
		return ((STROKE_SIZES[shape.props.size] * 1) / 2) * shape.props.scale
	}
	override getInterpolatedProps(
		startShape: AnnotatorShape,
		endShape: AnnotatorShape,
		t: number
	): AnnotatorShapeProps {
		return {
			...(t > 0.5 ? endShape.props : startShape.props),
			segments: interpolateSegments(startShape.props.segments, endShape.props.segments, t),
			scale: lerp(startShape.props.scale, endShape.props.scale, t),
		}
	}
}

function getDot(point: VecLike, sw: number) {
	const r = (sw + 1) * 0.5
	return `M ${point.x} ${point.y} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${
		r * 2
	},0`
}

function getIsDot(shape: AnnotatorShape) {
	return shape.props.segments.length === 1 && shape.props.segments[0].points.length < 2
}

function DrawShapeSvg({ shape, zoomOverride }: { shape: AnnotatorShape; zoomOverride?: number }) {
	const theme = useDefaultColorTheme()
	const editor = useEditor()

	const allPointsFromSegments = getPointsFromSegments(shape.props.segments)

	const showAsComplete = shape.props.isComplete || last(shape.props.segments)?.type === 'straight'

	let sw = (STROKE_SIZES[shape.props.size] + 1) * shape.props.scale
	const forceSolid = useValue(
		'force solid',
		() => {
			const zoomLevel = zoomOverride ?? editor.getZoomLevel()
			return zoomLevel < 0.5 && zoomLevel < 1.5 / sw
		},
		[editor, sw, zoomOverride]
	)

	const options = getFreehandOptions(shape.props, sw, showAsComplete, forceSolid)

	const strokePoints = getStrokePoints(allPointsFromSegments, options)
	const isDot = strokePoints.length < 2
	const solidStrokePath = isDot
		? getDot(allPointsFromSegments[0], 0)
		: getSvgPathFromStrokePoints(strokePoints, shape.props.isClosed)

	return (
		<>
			<ShapeFill
				d={solidStrokePath}
				theme={theme}
				color={shape.props.color}
				fill={isDot || shape.props.isClosed ? shape.props.fill : 'none'}
				scale={shape.props.scale}
			/>
			<path
				d={solidStrokePath}
				strokeLinecap="round"
				fill={isDot ? theme[shape.props.color].solid : 'none'}
				stroke={theme[shape.props.color].solid}
				strokeWidth={sw}
				strokeDasharray="none"
				strokeDashoffset="0"
			/>
		</>
	)
}
