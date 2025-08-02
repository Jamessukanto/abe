import { T } from '@annotator/validate'
import { assetIdValidator } from '../assets/AppBaseAsset'
import { vecModelValidator } from '../misc/geometry-types'
import { AppAssetId } from '../records/AppAsset'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/AppShape'
import { RecordProps } from '../recordsWithProps'
import { AppShapeCrop } from './ShapeWithCrop'
import { AppBaseShape } from './AppBaseShape'

/** @public */
export const ImageShapeCrop: T.ObjectValidator<AppShapeCrop> = T.object({
	topLeft: vecModelValidator,
	bottomRight: vecModelValidator,
	isCircle: T.boolean.optional(),
})

/** @public */
export interface AppImageShapeProps {
	w: number
	h: number
	playing: boolean
	url: string
	assetId: AppAssetId | null
	crop: AppShapeCrop | null
	flipX: boolean
	flipY: boolean
	altText: string
}

/** @public */
export type AppImageShape = AppBaseShape<'image', AppImageShapeProps>

/** @public */
export const imageShapeProps: RecordProps<AppImageShape> = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	playing: T.boolean,
	url: T.linkUrl,
	assetId: assetIdValidator.nullable(),
	crop: ImageShapeCrop.nullable(),
	flipX: T.boolean,
	flipY: T.boolean,
	altText: T.string,
}

const Versions = createShapePropsMigrationIds('image', {
	AddUrlProp: 1,
	AddCropProp: 2,
	MakeUrlsValid: 3,
	AddFlipProps: 4,
	AddAltText: 5,
})

export { Versions as imageShapeVersions }

/** @public */
export const imageShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: Versions.AddUrlProp,
			up: (props) => {
				props.url = ''
			},
			down: 'retired',
		},
		{
			id: Versions.AddCropProp,
			up: (props) => {
				props.crop = null
			},
			down: (props) => {
				delete props.crop
			},
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
			id: Versions.AddFlipProps,
			up: (props) => {
				props.flipX = false
				props.flipY = false
			},
			down: (props) => {
				delete props.flipX
				delete props.flipY
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
	],
})
