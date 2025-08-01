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
import { shapeIdValidator } from '../shapes/AppBaseShape'
import { pageIdValidator, AppPage } from './AppPage'
import { AppShapeId } from './AppShape'

/**
 * AppInstancePageState
 *
 * State that is unique to a particular page of the document in a particular browser tab
 *
 * @public
 */
export interface AppInstancePageState
	extends BaseRecord<'instance_page_state', AppInstancePageStateId> {
	pageId: RecordId<AppPage>
	selectedShapeIds: AppShapeId[]
	hintingShapeIds: AppShapeId[]
	erasingShapeIds: AppShapeId[]
	hoveredShapeId: AppShapeId | null
	editingShapeId: AppShapeId | null
	croppingShapeId: AppShapeId | null
	focusedGroupId: AppShapeId | null
	meta: JsonObject
}

/** @public */
export const instancePageStateValidator: T.Validator<AppInstancePageState> = T.model(
	'instance_page_state',
	T.object({
		typeName: T.literal('instance_page_state'),
		id: idValidator<AppInstancePageStateId>('instance_page_state'),
		pageId: pageIdValidator,
		selectedShapeIds: T.arrayOf(shapeIdValidator),
		hintingShapeIds: T.arrayOf(shapeIdValidator),
		erasingShapeIds: T.arrayOf(shapeIdValidator),
		hoveredShapeId: shapeIdValidator.nullable(),
		editingShapeId: shapeIdValidator.nullable(),
		croppingShapeId: shapeIdValidator.nullable(),
		focusedGroupId: shapeIdValidator.nullable(),
		meta: T.jsonValue as T.ObjectValidator<JsonObject>,
	})
)

/** @public */
export const instancePageStateVersions = createMigrationIds('com.annotator.instance_page_state', {
	AddCroppingId: 1,
	RemoveInstanceIdAndCameraId: 2,
	AddMeta: 3,
	RenameProperties: 4,
	RenamePropertiesAgain: 5,
} as const)

/** @public */
export const instancePageStateMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.instance_page_state',
	recordType: 'instance_page_state',
	sequence: [
		{
			id: instancePageStateVersions.AddCroppingId,
			up(instance: any) {
				instance.croppingShapeId = null
			},
		},
		{
			id: instancePageStateVersions.RemoveInstanceIdAndCameraId,
			up(instance: any) {
				delete instance.instanceId
				delete instance.cameraId
			},
		},
		{
			id: instancePageStateVersions.AddMeta,
			up: (record: any) => {
				record.meta = {}
			},
		},
		{
			id: instancePageStateVersions.RenameProperties,
			// this migration is cursed: it was written wrong and doesn't do anything.
			// rather than replace it, I've added another migration below that fixes it.
			up: (_record) => {
				// noop
			},
			down: (_record) => {
				// noop
			},
		},
		{
			id: instancePageStateVersions.RenamePropertiesAgain,
			up: (record: any) => {
				record.selectedShapeIds = record.selectedIds
				delete record.selectedIds
				record.hintingShapeIds = record.hintingIds
				delete record.hintingIds
				record.erasingShapeIds = record.erasingIds
				delete record.erasingIds
				record.hoveredShapeId = record.hoveredId
				delete record.hoveredId
				record.editingShapeId = record.editingId
				delete record.editingId
				record.croppingShapeId = record.croppingShapeId ?? record.croppingId ?? null
				delete record.croppingId
				record.focusedGroupId = record.focusLayerId
				delete record.focusLayerId
			},
			down: (record: any) => {
				record.selectedIds = record.selectedShapeIds
				delete record.selectedShapeIds
				record.hintingIds = record.hintingShapeIds
				delete record.hintingShapeIds
				record.erasingIds = record.erasingShapeIds
				delete record.erasingShapeIds
				record.hoveredId = record.hoveredShapeId
				delete record.hoveredShapeId
				record.editingId = record.editingShapeId
				delete record.editingShapeId
				record.croppingId = record.croppingShapeId
				delete record.croppingShapeId
				record.focusLayerId = record.focusedGroupId
				delete record.focusedGroupId
			},
		},
	],
})

/** @public */
export const InstancePageStateRecordType = createRecordType<AppInstancePageState>(
	'instance_page_state',
	{
		validator: instancePageStateValidator,
		scope: 'session',
		ephemeralKeys: {
			pageId: false,
			selectedShapeIds: false,
			editingShapeId: false,
			croppingShapeId: false,
			meta: false,

			hintingShapeIds: true,
			erasingShapeIds: true,
			hoveredShapeId: true,
			focusedGroupId: true,
		},
	}
).withDefaultProperties(
	(): Omit<AppInstancePageState, 'id' | 'typeName' | 'pageId'> => ({
		editingShapeId: null,
		croppingShapeId: null,
		selectedShapeIds: [],
		hoveredShapeId: null,
		erasingShapeIds: [],
		hintingShapeIds: [],
		focusedGroupId: null,
		meta: {},
	})
)

/** @public */
export type AppInstancePageStateId = RecordId<AppInstancePageState>
