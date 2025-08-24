import {
	BaseRecord,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
	RecordId,
} from '@annotator/store'
import { IndexKey, JsonObject } from '@annotator/utils'
import { T } from '@annotator/validate'
import { idValidator } from '../misc/id-validator'

/**
 * AppPage
 *
 * @public
 */
export interface AppPage extends BaseRecord<'page', AppPageId> {
	name: string
	index: IndexKey
	meta: JsonObject
}

/** @public */
export type AppPageId = RecordId<AppPage>

/** @public */
export const pageIdValidator = idValidator<AppPageId>('page')

/** @public */
export const pageValidator: T.Validator<AppPage> = T.model(
	'page',
	T.object({
		typeName: T.literal('page'),
		id: pageIdValidator,
		name: T.string,
		index: T.indexKey,
		meta: T.jsonValue as T.ObjectValidator<JsonObject>,
	})
)

// /** @public */
// export const pageVersions = createMigrationIds('com.annotator.page', {
// 	AddMeta: 1,
// })

/** @public */
export const pageMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.page',
	recordType: 'page',
	sequence: [
		// {
		// 	id: pageVersions.AddMeta,
		// 	up: (record: any) => {
		// 		record.meta = {}
		// 	},
		// },
	],
})

/** @public */
export const PageRecordType = createRecordType<AppPage>('page', {
	validator: pageValidator,
	scope: 'document',
}).withDefaultProperties(() => ({
	meta: {},
}))

/** @public */
export function isPageId(id: string): id is AppPageId {
	return PageRecordType.isId(id)
}
