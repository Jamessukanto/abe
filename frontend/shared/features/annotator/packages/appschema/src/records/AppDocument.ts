import {
	BaseRecord,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
	RecordId,
	UnknownRecord,
} from '@annotator/store'
import { JsonObject } from '@annotator/utils'
import { T } from '@annotator/validate'

/**
 * AppDocument
 *
 * @public
 */
export interface AppDocument extends BaseRecord<'document', RecordId<AppDocument>> {
	gridSize: number
	name: string
	meta: JsonObject
}

/** @public */
export const documentValidator: T.Validator<AppDocument> = T.model(
	'document',
	T.object({
		typeName: T.literal('document'),
		id: T.literal('document:document' as RecordId<AppDocument>),
		gridSize: T.number,
		name: T.string,
		meta: T.jsonValue as T.ObjectValidator<JsonObject>,
	})
)

/** @public */
export function isDocument(record?: UnknownRecord): record is AppDocument {
	if (!record) return false
	return record.typeName === 'document'
}

/** @public */
export const documentVersions = createMigrationIds('com.annotator.document', {
	AddName: 1,
	AddMeta: 2,
} as const)

/** @public */
export const documentMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.document',
	recordType: 'document',
	sequence: [
		{
			id: documentVersions.AddName,
			up: (document) => {
				;(document as any).name = ''
			},
			down: (document) => {
				delete (document as any).name
			},
		},
		{
			id: documentVersions.AddMeta,
			up: (record) => {
				;(record as any).meta = {}
			},
		},
	],
})

/** @public */
export const DocumentRecordType = createRecordType<AppDocument>('document', {
	validator: documentValidator,
	scope: 'document',
}).withDefaultProperties(
	(): Omit<AppDocument, 'id' | 'typeName'> => ({
		gridSize: 10,
		name: '',
		meta: {},
	})
)

// all document records have the same ID: 'document:document'
/** @public */
export const AppDOCUMENT_ID: RecordId<AppDocument> = DocumentRecordType.createId('document')
