import {
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
	RecordId,
} from '@annotator/store'
import { T } from '@annotator/validate'
import { AppBaseAsset } from '../assets/AppBaseAsset'
import { bookmarkAssetValidator, AppBookmarkAsset } from '../assets/AppBookmarkAsset'
import { imageAssetValidator, AppImageAsset } from '../assets/AppImageAsset'
import { AppVideoAsset, videoAssetValidator } from '../assets/AppVideoAsset'
import { AppShape } from './AppShape'

/** @public */
export type AppAsset = AppImageAsset | AppVideoAsset | AppBookmarkAsset

/** @public */
export const assetValidator: T.Validator<AppAsset> = T.model(
	'asset',
	T.union('type', {
		image: imageAssetValidator,
		video: videoAssetValidator,
		bookmark: bookmarkAssetValidator,
	})
)

/** @public */
export const assetVersions = createMigrationIds('com.annotator.asset', {
	AddMeta: 1,
} as const)

/** @public */
export const assetMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.asset',
	recordType: 'asset',
	sequence: [
		{
			id: assetVersions.AddMeta,
			up: (record) => {
				;(record as any).meta = {}
			},
		},
	],
})

/** @public */
export type AppAssetPartial<T extends AppAsset = AppAsset> = T extends T
	? {
			id: AppAssetId
			type: T['type']
			props?: Partial<T['props']>
			meta?: Partial<T['meta']>
		} & Partial<Omit<T, 'type' | 'id' | 'props' | 'meta'>>
	: never

/** @public */
export const AssetRecordType = createRecordType<AppAsset>('asset', {
	validator: assetValidator,
	scope: 'document',
}).withDefaultProperties(() => ({
	meta: {},
}))

/** @public */
export type AppAssetId = RecordId<AppBaseAsset<any, any>>

/** @public */
export type AppAssetShape = Extract<AppShape, { props: { assetId: AppAssetId } }>
