import { createRecordType, BaseRecord, RecordId } from '@annotator/store'
import { T } from '@annotator/validate'

/** @public */
export interface AppDocument extends BaseRecord<'document', AppDocumentId> {
	name: string
	meta: any
}

export type AppDocumentId = RecordId<AppDocument>
export const TLDOCUMENT_ID = 'document:document' as AppDocumentId

export const DocumentRecordType = createRecordType<AppDocument>('document', {
	scope: 'document',
	validator: T.object({
		id: T.literal(TLDOCUMENT_ID),
		typeName: T.literal('document'),
		name: T.string,
		meta: T.jsonValue,
	}),
}).withDefaultProperties(() => ({
	meta: {
		shapeCounter: 0,
		groupCounter: 0,
	},
}))
