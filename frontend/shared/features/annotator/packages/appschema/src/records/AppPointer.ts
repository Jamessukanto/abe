import {
	BaseRecord,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
	RecordId,
} from '@annotator/store'
import { JsonObject } from '@annotator/utils'
import { T } from '@annotator/validate'
import { idValidator } from '../misc/id-validator'

/**
 * AppPointer
 *
 * @public
 */
export interface AppPointer extends BaseRecord<'pointer', AppPointerId> {
	x: number
	y: number
	lastActivityTimestamp: number
	meta: JsonObject
}

/** @public */
export type AppPointerId = RecordId<AppPointer>

/** @public */
export const pointerValidator: T.Validator<AppPointer> = T.model(
	'pointer',
	T.object({
		typeName: T.literal('pointer'),
		id: idValidator<AppPointerId>('pointer'),
		x: T.number,
		y: T.number,
		lastActivityTimestamp: T.number,
		meta: T.jsonValue as T.ObjectValidator<JsonObject>,
	})
)

/** @public */
export const pointerVersions = createMigrationIds('com.annotator.pointer', {
	AddMeta: 1,
})

/** @public */
export const pointerMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.pointer',
	recordType: 'pointer',
	sequence: [
		{
			id: pointerVersions.AddMeta,
			up: (record: any) => {
				record.meta = {}
			},
		},
	],
})

/** @public */
export const PointerRecordType = createRecordType<AppPointer>('pointer', {
	validator: pointerValidator,
	scope: 'session',
}).withDefaultProperties(
	(): Omit<AppPointer, 'id' | 'typeName'> => ({
		x: 0,
		y: 0,
		lastActivityTimestamp: 0,
		meta: {},
	})
)

/** @public */
export const AppPOINTER_ID = PointerRecordType.createId('pointer')
