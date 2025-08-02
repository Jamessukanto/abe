import { T } from '@annotator/validate'
import { assetIdValidator } from '../assets/AppBaseAsset'
import { AppAssetId } from '../records/AppAsset'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/AppShape'
import { RecordProps } from '../recordsWithProps'
import { AppBaseShape } from './AppBaseShape'

/** @public */
export interface AppVideoShapeProps {
	w: number
	h: number
	time: number
	playing: boolean
	autoplay: boolean
	url: string
	assetId: AppAssetId | null
	altText: string
}

/** @public */
export type AppVideoShape = AppBaseShape<'video', AppVideoShapeProps>

/** @public */
export const videoShapeProps: RecordProps<AppVideoShape> = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	time: T.number,
	playing: T.boolean,
	autoplay: T.boolean,
	url: T.linkUrl,
	assetId: assetIdValidator.nullable(),
	altText: T.string,
}

const Versions = createShapePropsMigrationIds('video', {
	AddUrlProp: 1,
	MakeUrlsValid: 2,
	AddAltText: 3,
	AddAutoplay: 4,
})

export { Versions as videoShapeVersions }

/** @public */
export const videoShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: Versions.AddUrlProp,
			up: (props) => {
				props.url = ''
			},
			down: 'retired',
		},
		{
			id: Versions.MakeUrlsValid,
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
			id: Versions.AddAltText,
			up: (props) => {
				props.altText = ''
			},
			down: (props) => {
				delete props.altText
			},
		},
		{
			id: Versions.AddAutoplay,
			up: (props) => {
				props.autoplay = true
			},
			down: (props) => {
				delete props.autoplay
			},
		},
	],
})
