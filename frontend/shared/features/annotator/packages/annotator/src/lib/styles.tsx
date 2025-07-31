import { TLUiIconJsx } from './ui/components/primitives/AnnotatorUiIcon'

/** @public */
export type StyleValuesForUi<T> = readonly {
	readonly value: T
	readonly icon: string | TLUiIconJsx
}[]

// todo: default styles prop?
export const STYLES = {
	color: [
		{ value: 'black', icon: 'color' },
		{ value: 'grey', icon: 'color' },
		{ value: 'light-violet', icon: 'color' },
		{ value: 'violet', icon: 'color' },
		{ value: 'blue', icon: 'color' },
		{ value: 'light-blue', icon: 'color' },
		{ value: 'yellow', icon: 'color' },
		{ value: 'orange', icon: 'color' },
		{ value: 'green', icon: 'color' },
		{ value: 'light-green', icon: 'color' },
		{ value: 'light-red', icon: 'color' },
		{ value: 'red', icon: 'color' },
	],
	fill: [
		{ value: 'none', icon: 'fill-none' },
		{ value: 'semi', icon: 'fill-semi' },
		{ value: 'solid', icon: 'fill-solid' },
		{ value: 'pattern', icon: 'fill-pattern' },
		// { value: 'fill', icon: 'fill-fill' },
	],
	size: [
		{ value: 's', icon: 'size-small' },
		{ value: 'm', icon: 'size-medium' },
		{ value: 'l', icon: 'size-large' },
		{ value: 'xl', icon: 'size-extra-large' },
	],
	font: [
		{ value: 'draw', icon: 'font-draw' },
		{ value: 'sans', icon: 'font-sans' },
		{ value: 'serif', icon: 'font-serif' },
		{ value: 'mono', icon: 'font-mono' },
	],
	textAlign: [
		{ value: 'start', icon: 'text-align-left' },
		{ value: 'middle', icon: 'text-align-center' },
		{ value: 'end', icon: 'text-align-right' },
	],
	horizontalAlign: [
		{ value: 'start', icon: 'horizontal-align-start' },
		{ value: 'middle', icon: 'horizontal-align-middle' },
		{ value: 'end', icon: 'horizontal-align-end' },
	],
	verticalAlign: [
		{ value: 'start', icon: 'vertical-align-start' },
		{ value: 'middle', icon: 'vertical-align-middle' },
		{ value: 'end', icon: 'vertical-align-end' },
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
