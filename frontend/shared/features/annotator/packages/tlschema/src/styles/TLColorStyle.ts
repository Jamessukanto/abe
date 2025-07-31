import { Expand } from '@annotator/utils'
import { T } from '@annotator/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const defaultColorNames = [
	'black',
	'white',
	'blue',
	'green',
	'red',
] as const

/** @public */
export interface TLDefaultColorThemeColor {
	solid: string
	semi: string
	pattern: string
	fill: string // same as solid
	frame: {
		headingStroke: string
		headingFill: string
		stroke: string
		fill: string
		text: string
	}
	note: {
		fill: string
		text: string
	}
	highlight: {
		srgb: string
		p3: string
	}
}

/** @public */
export type TLDefaultColorTheme = Expand<
	{
		id: 'light' | 'dark'
		text: string
		background: string
		solid: string
	} & Record<(typeof defaultColorNames)[number], TLDefaultColorThemeColor>
>

/** @public */
export const DefaultColorThemePalette: {
	lightMode: TLDefaultColorTheme
	darkMode: TLDefaultColorTheme
} = {
	lightMode: {
		id: 'light',
		text: '#000000',
		background: '#f9fafb',
		solid: '#fcfffe',
		black: {
			solid: '#1d1d1d',
			fill: '#1d1d1d',
			frame: {
				headingStroke: '#717171',
				headingFill: '#ffffff',
				stroke: '#717171',
				fill: '#ffffff',
				text: '#000000',
			},
			note: {
				fill: '#FCE19C',
				text: '#000000',
			},
			semi: '#e8e8e8',
			pattern: '#494949',
			highlight: {
				srgb: '#fddd00',
				p3: 'color(display-p3 0.972 0.8205 0.05)',
			},
		},
		blue: {
			solid: '#4465e9',
			fill: '#4465e9',
			frame: {
				headingStroke: '#6681ec',
				headingFill: '#f9fafe',
				stroke: '#6681ec',
				fill: '#f9fafe',
				text: '#000000',
			},
			note: {
				fill: '#8AA3FF',
				text: '#000000',
			},
			semi: '#dce1f8',
			pattern: '#6681ee',
			highlight: {
				srgb: '#10acff',
				p3: 'color(display-p3 0.308 0.6632 0.9996)',
			},
		},
		green: {
			solid: '#099268',
			fill: '#099268',
			frame: {
				headingStroke: '#37a684',
				headingFill: '#f8fcfa',
				stroke: '#37a684',
				fill: '#f8fcfa',
				text: '#000000',
			},
			note: {
				fill: '#6FC896',
				text: '#000000',
			},
			semi: '#d3e9e3',
			pattern: '#39a785',
			highlight: {
				srgb: '#00ffc8',
				p3: 'color(display-p3 0.2536 0.984 0.7981)',
			},
		},

		red: {
			solid: '#e03131',
			fill: '#e03131',
			frame: {
				headingStroke: '#e55757',
				headingFill: '#fef7f7',
				stroke: '#e55757',
				fill: '#fef9f9',
				text: '#000000',
			},
			note: {
				fill: '#FC8282',
				text: '#000000',
			},
			semi: '#f4dadb',
			pattern: '#e55959',
			highlight: {
				srgb: '#ff636e',
				p3: 'color(display-p3 0.9992 0.4376 0.45)',
			},
		},
		white: {
			solid: '#FFFFFF',
			fill: '#FFFFFF',
			semi: '#f5f5f5',
			pattern: '#f9f9f9',
			frame: {
				headingStroke: '#7d7d7d',
				headingFill: '#ffffff',
				stroke: '#7d7d7d',
				fill: '#ffffff',
				text: '#000000',
			},
			note: {
				fill: '#FFFFFF',
				text: '#000000',
			},
			highlight: {
				srgb: '#ffffff',
				p3: 'color(display-p3 1 1 1)',
			},
		},
	},
	darkMode: {
		id: 'dark',
		text: 'hsl(210, 17%, 98%)',
		background: 'hsl(240, 5%, 6.5%)',
		solid: '#010403',

		black: {
			solid: '#f2f2f2',
			fill: '#f2f2f2',
			frame: {
				headingStroke: '#5c5c5c',
				headingFill: '#252525',
				stroke: '#5c5c5c',
				fill: '#0c0c0c',
				text: '#f2f2f2',
			},
			note: {
				fill: '#2c2c2c',
				text: '#f2f2f2',
			},
			semi: '#2c3036',
			pattern: '#989898',
			highlight: {
				srgb: '#d2b700',
				p3: 'color(display-p3 0.8078 0.6225 0.0312)',
			},
		},
		blue: {
			solid: '#4f72fc', // 3c60f0
			fill: '#4f72fc',
			frame: {
				headingStroke: '#384994',
				headingFill: '#1C2036',
				stroke: '#384994',
				fill: '#11141f',
				text: '#f2f2f2',
			},
			note: {
				fill: '#2A3F98',
				text: '#f2f2f2',
			},
			semi: '#262d40',
			pattern: '#3a4b9e',
			highlight: {
				srgb: '#0079d2',
				p3: 'color(display-p3 0.0032 0.4655 0.7991)',
			},
		},
		green: {
			solid: '#099268',
			fill: '#099268',
			frame: {
				headingStroke: '#10513C',
				headingFill: '#14241f',
				stroke: '#10513C',
				fill: '#0E1614',
				text: '#f2f2f2',
			},
			note: {
				fill: '#014429',
				text: '#f2f2f2',
			},
			semi: '#253231',
			pattern: '#366a53',
			highlight: {
				srgb: '#009774',
				p3: 'color(display-p3 0.0085 0.582 0.4604)',
			},
		},

		red: {
			solid: '#e03131',
			fill: '#e03131',
			frame: {
				headingStroke: '#701e1e', // Darker, muted variation of solid
				headingFill: '#301616', // Deep, muted reddish backdrop
				stroke: '#701e1e', // Matches headingStroke
				fill: '#1b1313', // Rich, dark muted background
				text: '#f2f2f2', // Bright text for readability
			},
			note: {
				fill: '#7e201f', // Muted dark variant for note fill
				text: '#f2f2f2',
			},
			semi: '#382726', // Dark neutral-red tone
			pattern: '#8f3734', // Existing pattern color retained
			highlight: {
				srgb: '#de002c',
				p3: 'color(display-p3 0.7978 0.0509 0.2035)',
			},
		},
		white: {
			solid: '#f3f3f3',
			fill: '#f3f3f3',
			semi: '#f5f5f5',
			pattern: '#f9f9f9',
			frame: {
				headingStroke: '#ffffff',
				headingFill: '#ffffff',
				stroke: '#ffffff',
				fill: '#ffffff',
				text: '#000000',
			},
			note: {
				fill: '#eaeaea',
				text: '#1d1d1d',
			},
			highlight: {
				srgb: '#ffffff',
				p3: 'color(display-p3 1 1 1)',
			},
		},
	},
}

/** @public */
export function getDefaultColorTheme(opts: { isDarkMode: boolean }): TLDefaultColorTheme {
	return opts.isDarkMode ? DefaultColorThemePalette.darkMode : DefaultColorThemePalette.lightMode
}

/** @public */
export const DefaultColorStyle = StyleProp.defineEnum('annotator:color', {
	defaultValue: 'black',
	values: defaultColorNames,
})

/** @public */
export const DefaultLabelColorStyle = StyleProp.defineEnum('annotator:labelColor', {
	defaultValue: 'black',
	values: defaultColorNames,
})

/** @public */
export type TLDefaultColorStyle = T.TypeOf<typeof DefaultColorStyle>
