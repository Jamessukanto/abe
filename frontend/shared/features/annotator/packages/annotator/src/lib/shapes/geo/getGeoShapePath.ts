import {
	centerOfCircleFromThreePoints,
	clamp,
	exhaustiveSwitchError,
	getPointOnCircle,
	getPolygonVertices,
	HALF_PI,
	PI,
	PI2,
	rng,
	TLDefaultDashStyle,
	TLDefaultSizeStyle,
	TLGeoShape,
	Vec,
	VecModel,
	WeakCache,
} from '@annotator/editor'
import { STROKE_SIZES } from '../shared/default-shape-constants'
import { PathBuilder } from '../shared/PathBuilder'

const pathCache = new WeakCache<TLGeoShape, PathBuilder>()
export function getGeoShapePath(shape: TLGeoShape) {
	return pathCache.get(shape, _getGeoPath)
}

function _getGeoPath(shape: TLGeoShape) {
	const w = Math.max(1, shape.props.w)
	const h = Math.max(1, shape.props.h + shape.props.growY)
	const cx = w / 2
	const cy = h / 2
	const sw = STROKE_SIZES[shape.props.size] * shape.props.scale

	const isFilled = shape.props.fill !== 'none'

	switch (shape.props.geo) {
		case 'ellipse':
			return new PathBuilder()
				.moveTo(0, cy, { geometry: { isFilled } })
				.arcTo(cx, cy, false, true, 0, w, cy)
				.arcTo(cx, cy, false, true, 0, 0, cy)
				.close()
		case 'rectangle':
			return new PathBuilder()
				.moveTo(0, 0, { geometry: { isFilled } })
				.lineTo(w, 0)
				.lineTo(w, h)
				.lineTo(0, h)
				.close()
		default:
			exhaustiveSwitchError(shape.props.geo)
	}
}

function getXBoxPath(
	w: number,
	h: number,
	sw: number,
	dash: TLDefaultDashStyle,
	isFilled: boolean
) {
	const cx = w / 2
	const cy = h / 2

	const path = new PathBuilder()
		.moveTo(0, 0, { geometry: { isFilled } })
		.lineTo(w, 0)
		.lineTo(w, h)
		.lineTo(0, h)
		.close()

	path
		.moveTo(clamp(sw * 0, 0, w), clamp(sw * 0, 0, h), {
			geometry: { isInternal: true, isFilled: false },
		})
		.lineTo(clamp(w - sw * 0, 0, w), clamp(h - sw * 0, 0, h))
		.moveTo(clamp(w - sw * 0, 0, w), clamp(sw * 0, 0, h))
		.lineTo(clamp(sw * 0, 0, w), clamp(h - sw * 0, 0, h))

	return path
}

function getStadiumPath(w: number, h: number, isFilled: boolean) {
	// stadium:
	if (h > w) {
		const r = w / 2
		return new PathBuilder()
			.moveTo(0, r, { geometry: { isFilled } })
			.arcTo(r, r, false, true, 0, w, r)
			.lineTo(w, h - r)
			.arcTo(r, r, false, true, 0, 0, h - r)
			.close()
	}

	const r = h / 2
	return new PathBuilder()
		.moveTo(r, h, { geometry: { isFilled } })
		.arcTo(r, r, false, true, 0, r, 0)
		.lineTo(w - r, 0)
		.arcTo(r, r, false, true, 0, w - r, h)
		.close()
}

function getStarPath(w: number, h: number, isFilled: boolean) {
	// Most of this code is to offset the center, a 5 point star
	// will need to be moved downward because from its center [0,0]
	// it will have a bigger minY than maxY. This is because it'll
	// have 2 points at the bottom.
	const sides = 5
	const step = PI2 / sides / 2
	const rightMostIndex = Math.floor(sides / 4) * 2
	const leftMostIndex = sides * 2 - rightMostIndex
	const topMostIndex = 0
	const bottomMostIndex = Math.floor(sides / 2) * 2
	const maxX = (Math.cos(-HALF_PI + rightMostIndex * step) * w) / 2
	const minX = (Math.cos(-HALF_PI + leftMostIndex * step) * w) / 2

	const minY = (Math.sin(-HALF_PI + topMostIndex * step) * h) / 2
	const maxY = (Math.sin(-HALF_PI + bottomMostIndex * step) * h) / 2
	const diffX = w - Math.abs(maxX - minX)
	const diffY = h - Math.abs(maxY - minY)
	const offsetX = w / 2 + minX - (w / 2 - maxX)
	const offsetY = h / 2 + minY - (h / 2 - maxY)

	const ratio = 1
	const cx = (w - offsetX) / 2
	const cy = (h - offsetY) / 2
	const ox = (w + diffX) / 2
	const oy = (h + diffY) / 2
	const ix = (ox * ratio) / 2
	const iy = (oy * ratio) / 2

	return PathBuilder.lineThroughPoints(
		Array.from(Array(sides * 2), (_, i) => {
			const theta = -HALF_PI + i * step
			return new Vec(
				cx + (i % 2 ? ix : ox) * Math.cos(theta),
				cy + (i % 2 ? iy : oy) * Math.sin(theta)
			)
		}),
		{ geometry: { isFilled } }
	).close()
}

/* ---------------------- Cloud --------------------- */

function getOvalPerimeter(h: number, w: number) {
	if (h > w) return (PI * (w / 2) + (h - w)) * 2
	else return (PI * (h / 2) + (w - h)) * 2
}

type PillSection =
	| {
			type: 'straight'
			start: VecModel
			delta: VecModel
	  }
	| {
			type: 'arc'
			center: VecModel
			startAngle: number
	  }

function getPillPoints(width: number, height: number, numPoints: number) {
	const radius = Math.min(width, height) / 2
	const longSide = Math.max(width, height) - radius * 2
	const circumference = Math.PI * (radius * 2) + 2 * longSide
	const spacing = circumference / numPoints

	const sections: PillSection[] =
		width > height
			? [
					{
						type: 'straight',
						start: new Vec(radius, 0),
						delta: new Vec(1, 0),
					},
					{
						type: 'arc',
						center: new Vec(width - radius, radius),
						startAngle: -PI / 2,
					},
					{
						type: 'straight',
						start: new Vec(width - radius, height),
						delta: new Vec(-1, 0),
					},
					{
						type: 'arc',
						center: new Vec(radius, radius),
						startAngle: PI / 2,
					},
				]
			: [
					{
						type: 'straight',
						start: new Vec(width, radius),
						delta: new Vec(0, 1),
					},
					{
						type: 'arc',
						center: new Vec(radius, height - radius),
						startAngle: 0,
					},
					{
						type: 'straight',
						start: new Vec(0, height - radius),
						delta: new Vec(0, -1),
					},
					{
						type: 'arc',
						center: new Vec(radius, radius),
						startAngle: PI,
					},
				]

	let sectionOffset = 0

	const points: Vec[] = []
	for (let i = 0; i < numPoints; i++) {
		const section = sections[0]
		if (section.type === 'straight') {
			points.push(Vec.Add(section.start, Vec.Mul(section.delta, sectionOffset)))
		} else {
			points.push(
				getPointOnCircle(section.center, radius, section.startAngle + sectionOffset / radius)
			)
		}
		sectionOffset += spacing
		let sectionLength = section.type === 'straight' ? longSide : PI * radius
		while (sectionOffset > sectionLength) {
			sectionOffset -= sectionLength
			sections.push(sections.shift()!)
			sectionLength = sections[0].type === 'straight' ? longSide : PI * radius
		}
	}

	return points
}

const SIZES: Record<TLDefaultSizeStyle, number> = {
	s: 50,
	m: 70,
	l: 100,
	xl: 130,
}

const BUMP_PROTRUSION = 0.2

function getCloudPath(
	width: number,
	height: number,
	seed: string,
	size: TLDefaultSizeStyle,
	scale: number,
	isFilled: boolean
) {
	const path = new PathBuilder()
	const getRandom = rng(seed)
	const pillCircumference = getOvalPerimeter(width, height)
	const numBumps = Math.max(
		Math.ceil(pillCircumference / SIZES[size]),
		6,
		Math.ceil(pillCircumference / Math.min(width, height))
	)
	const targetBumpProtrusion = (pillCircumference / numBumps) * BUMP_PROTRUSION

	// if the aspect ratio is high, innerWidth should be smaller
	const innerWidth = Math.max(width - targetBumpProtrusion * 2, 1)
	const innerHeight = Math.max(height - targetBumpProtrusion * 2, 1)
	const innerCircumference = getOvalPerimeter(innerWidth, innerHeight)

	const distanceBetweenPointsOnPerimeter = innerCircumference / numBumps

	const paddingX = (width - innerWidth) / 2
	const paddingY = (height - innerHeight) / 2
	const bumpPoints = getPillPoints(innerWidth, innerHeight, numBumps).map((p) => {
		return p.addXY(paddingX, paddingY)
	})
	const maxWiggleX = width < 20 ? 0 : targetBumpProtrusion * 0.3
	const maxWiggleY = height < 20 ? 0 : targetBumpProtrusion * 0.3

	// wiggle the points from either end so that the bumps 'pop'
	// in at the bottom-right and the top-left looks relatively stable
	// note: it's important that we don't mutate here! these points are also the bump points
	const wiggledPoints = bumpPoints.slice(0)
	for (let i = 0; i < Math.floor(numBumps / 2); i++) {
		wiggledPoints[i] = Vec.AddXY(
			wiggledPoints[i],
			getRandom() * maxWiggleX * scale,
			getRandom() * maxWiggleY * scale
		)
		wiggledPoints[numBumps - i - 1] = Vec.AddXY(
			wiggledPoints[numBumps - i - 1],
			getRandom() * maxWiggleX * scale,
			getRandom() * maxWiggleY * scale
		)
	}

	for (let i = 0; i < wiggledPoints.length; i++) {
		const j = i === wiggledPoints.length - 1 ? 0 : i + 1
		const leftWigglePoint = wiggledPoints[i]
		const rightWigglePoint = wiggledPoints[j]
		const leftPoint = bumpPoints[i]
		const rightPoint = bumpPoints[j]

		// when the points are on the curvy part of a pill, there is a natural arc that we need to extends past
		// otherwise it looks like the bumps get less bumpy on the curvy parts
		const distanceBetweenOriginalPoints = Vec.Dist(leftPoint, rightPoint)
		const curvatureOffset = distanceBetweenPointsOnPerimeter - distanceBetweenOriginalPoints
		const distanceBetweenWigglePoints = Vec.Dist(leftWigglePoint, rightWigglePoint)
		const relativeSize = distanceBetweenWigglePoints / distanceBetweenOriginalPoints
		const finalDistance = (Math.max(paddingX, paddingY) + curvatureOffset) * relativeSize

		const arcPoint = Vec.Lrp(leftPoint, rightPoint, 0.5).add(
			Vec.Sub(rightPoint, leftPoint).uni().per().mul(finalDistance)
		)
		if (arcPoint.x < 0) {
			arcPoint.x = 0
		} else if (arcPoint.x > width) {
			arcPoint.x = width
		}
		if (arcPoint.y < 0) {
			arcPoint.y = 0
		} else if (arcPoint.y > height) {
			arcPoint.y = height
		}

		const center = centerOfCircleFromThreePoints(leftWigglePoint, rightWigglePoint, arcPoint)

		const radius = Vec.Dist(
			center ? center : Vec.Average([leftWigglePoint, rightWigglePoint]),
			leftWigglePoint
		)

		if (i === 0) {
			path.moveTo(leftWigglePoint.x, leftWigglePoint.y, { geometry: { isFilled } })
		}

		path.circularArcTo(radius, false, true, rightWigglePoint.x, rightWigglePoint.y)
	}

	return path.close()
}
