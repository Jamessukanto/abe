import { T } from '@annotator/validate'
import { assetIdValidator } from '../assets/AppBaseAsset'
import { AppAssetId } from '../records/AppAsset'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/AppShape'
import { RecordProps } from '../recordsWithProps'
import { AppBaseShape } from './AppBaseShape'

/** @public */
export interface AppBookmarkShapeProps {
	w: number
	h: number
	assetId: AppAssetId | null
	url: string
}

/** @public */
export type AppBookmarkShape = AppBaseShape<'bookmark', AppBookmarkShapeProps>

/** @public */
export const bookmarkShapeProps: RecordProps<AppBookmarkShape> = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	assetId: assetIdValidator.nullable(),
	url: T.linkUrl,
}

const Versions = createShapePropsMigrationIds('bookmark', {
	NullAssetId: 1,
	MakeUrlsValid: 2,
})

export { Versions as bookmarkShapeVersions }

/** @public */
export const bookmarkShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: Versions.NullAssetId,
			up: (props) => {
				if (props.assetId === undefined) {
					props.assetId = null
				}
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
	],
})
