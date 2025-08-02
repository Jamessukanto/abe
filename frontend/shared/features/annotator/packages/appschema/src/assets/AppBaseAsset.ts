import { BaseRecord } from '@annotator/store'
import { JsonObject } from '@annotator/utils'
import { T } from '@annotator/validate'
import { idValidator } from '../misc/id-validator'
import { AppAssetId } from '../records/AppAsset'

/** @public */
export interface AppBaseAsset<Type extends string, Props> extends BaseRecord<'asset', AppAssetId> {
	type: Type
	props: Props
	meta: JsonObject
}

/**
 * A validator for asset record type Ids.
 *
 * @public */
export const assetIdValidator = idValidator<AppAssetId>('asset')

/**
 * Create a validator for an asset record type.
 *
 * @param type - The type of the asset
 * @param props - The validator for the asset's props
 *
 * @public */
export function createAssetValidator<Type extends string, Props extends JsonObject>(
	type: Type,
	props: T.Validator<Props>
) {
	return T.object<{
		id: AppAssetId
		typeName: 'asset'
		type: Type
		props: Props
		meta: JsonObject
	}>({
		id: assetIdValidator,
		typeName: T.literal('asset'),
		type: T.literal(type),
		props,
		meta: T.jsonValue as T.ObjectValidator<JsonObject>,
	})
}
