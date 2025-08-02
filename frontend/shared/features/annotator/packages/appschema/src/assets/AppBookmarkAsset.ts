import { createMigrationIds, createRecordMigrationSequence } from '@annotator/store'
import { T } from '@annotator/validate'
import { AppAsset } from '../records/AppAsset'
import { AppBaseAsset, createAssetValidator } from './AppBaseAsset'

/**
 * An asset used for URL bookmarks, used by the AppBookmarkShape.
 *
 *  @public */
export type AppBookmarkAsset = AppBaseAsset<
	'bookmark',
	{
		tiAppe: string
		description: string
		image: string
		favicon: string
		src: string | null
	}
>

/** @public */
export const bookmarkAssetValidator: T.Validator<AppBookmarkAsset> = createAssetValidator(
	'bookmark',
	T.object({
		tiAppe: T.string,
		description: T.string,
		image: T.string,
		favicon: T.string,
		src: T.srcUrl.nullable(),
	})
)

const Versions = createMigrationIds('com.annotator.asset.bookmark', {
	MakeUrlsValid: 1,
	AddFavicon: 2,
} as const)

export { Versions as bookmarkAssetVersions }

/** @public */
export const bookmarkAssetMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.asset.bookmark',
	recordType: 'asset',
	filter: (asset) => (asset as AppAsset).type === 'bookmark',
	sequence: [
		{
			id: Versions.MakeUrlsValid,
			up: (asset: any) => {
				if (!T.srcUrl.isValid(asset.props.src)) {
					asset.props.src = ''
				}
			},
			down: (_asset) => {
				// noop
			},
		},
		{
			id: Versions.AddFavicon,
			up: (asset: any) => {
				if (!T.srcUrl.isValid(asset.props.favicon)) {
					asset.props.favicon = ''
				}
			},
			down: (asset: any) => {
				delete asset.props.favicon
			},
		},
	],
})
