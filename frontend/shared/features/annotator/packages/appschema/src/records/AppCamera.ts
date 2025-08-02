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
 * A camera record.
 *
 * @public
 */
export interface AppCamera extends BaseRecord<'camera', AppCameraId> {
	x: number
	y: number
	z: number
	meta: JsonObject
}

/**
 * The id of a camera record.
 *
 * @public */
export type AppCameraId = RecordId<AppCamera>

/** @public */
export const cameraValidator: T.Validator<AppCamera> = T.model(
	'camera',
	T.object({
		typeName: T.literal('camera'),
		id: idValidator<AppCameraId>('camera'),
		x: T.number,
		y: T.number,
		z: T.number,
		meta: T.jsonValue as T.ObjectValidator<JsonObject>,
	})
)

/** @public */
export const cameraVersions = createMigrationIds('com.annotator.camera', {
	AddMeta: 1,
})

/** @public */
export const cameraMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.camera',
	recordType: 'camera',
	sequence: [
		{
			id: cameraVersions.AddMeta,
			up: (record) => {
				;(record as any).meta = {}
			},
		},
	],
})

/** @public */
export const CameraRecordType = createRecordType<AppCamera>('camera', {
	validator: cameraValidator,
	scope: 'session',
}).withDefaultProperties(
	(): Omit<AppCamera, 'id' | 'typeName'> => ({
		x: 0,
		y: 0,
		z: 1,
		meta: {},
	})
)
