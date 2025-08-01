import { TLUiIconJsx } from './ui/components/primitives/AnnotatorUiIcon'

/** @public */
export type StyleValuesForUi<T> =  {
	readonly value: T
	readonly icon: string | TLUiIconJsx
}[]

// todo: default styles prop?
export const STYLES = {
	color: [
		{ value: 'black', icon: 'color' },
		{ value: 'blue', icon: 'color' },
		{ value: 'green', icon: 'color' },
		{ value: 'red', icon: 'color' },
	],
	fill: [
		{ value: 'none', icon: 'fill-none' },
		{ value: 'semi', icon: 'fill-semi' },
		{ value: 'solid', icon: 'fill-solid' },
		{ value: 'pattern', icon: 'fill-pattern' },
		// { value: 'fill', icon: 'fill-fill' },
	],
	textAlign: [
		{ value: 'start', icon: 'text-align-left' },
		{ value: 'middle', icon: 'text-align-center' },
		{ value: 'end', icon: 'text-align-right' },
	],
	geo: [
		{ value: 'rectangle', icon: 'geo-rectangle' },
		{ value: 'ellipse', icon: 'geo-ellipse' },
		{ value: 'triangle', icon: 'geo-triangle' },
		{ value: 'star', icon: 'geo-star' },
		{ value: 'heart', icon: 'geo-heart' },
	],
	spline: [
		{ value: 'line', icon: 'spline-line' },
		{ value: 'cubic', icon: 'spline-cubic' },
	],
} as const satisfies Record<string, StyleValuesForUi<string>>
