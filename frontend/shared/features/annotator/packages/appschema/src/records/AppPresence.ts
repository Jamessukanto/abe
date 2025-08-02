import {
	BaseRecord,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
	RecordId,
} from '@annotator/store'
import { JsonObject } from '@annotator/utils'
import { T } from '@annotator/validate'
import { BoxModel, boxModelValidator } from '../misc/geometry-types'
import { idValidator } from '../misc/id-validator'
import { cursorTypeValidator, AppCursor } from '../misc/AppCursor'
import { scribbleValidator, AppScribble } from '../misc/AppScribble'
import { AppPageId } from './AppPage'
import { AppShapeId } from './AppShape'

/** @public */
export interface AppInstancePresence extends BaseRecord<'instance_presence', AppInstancePresenceID> {
	userId: string
	userName: string
	lastActivityTimestamp: number | null
	color: string // can be any hex color
	camera: { x: number; y: number; z: number } | null
	selectedShapeIds: AppShapeId[]
	currentPageId: AppPageId
	brush: BoxModel | null
	scribbles: AppScribble[]
	screenBounds: BoxModel | null
	followingUserId: string | null
	cursor: {
		x: number
		y: number
		type: AppCursor['type']
		rotation: number
	} | null
	chatMessage: string
	meta: JsonObject
}

/** @public */
export type AppInstancePresenceID = RecordId<AppInstancePresence>

/** @public */
export const instancePresenceValidator: T.Validator<AppInstancePresence> = T.model(
	'instance_presence',
	T.object({
		typeName: T.literal('instance_presence'),
		id: idValidator<AppInstancePresenceID>('instance_presence'),
		userId: T.string,
		userName: T.string,
		lastActivityTimestamp: T.number.nullable(),
		followingUserId: T.string.nullable(),
		cursor: T.object({
			x: T.number,
			y: T.number,
			type: cursorTypeValidator,
			rotation: T.number,
		}).nullable(),
		color: T.string,
		camera: T.object({
			x: T.number,
			y: T.number,
			z: T.number,
		}).nullable(),
		screenBounds: boxModelValidator.nullable(),
		selectedShapeIds: T.arrayOf(idValidator<AppShapeId>('shape')),
		currentPageId: idValidator<AppPageId>('page'),
		brush: boxModelValidator.nullable(),
		scribbles: T.arrayOf(scribbleValidator),
		chatMessage: T.string,
		meta: T.jsonValue as T.ObjectValidator<JsonObject>,
	})
)

/** @public */
export const instancePresenceVersions = createMigrationIds('com.annotator.instance_presence', {
	AddScribbleDelay: 1,
	RemoveInstanceId: 2,
	AddChatMessage: 3,
	AddMeta: 4,
	RenameSelectedShapeIds: 5,
	NullableCameraCursor: 6,
} as const)

export const instancePresenceMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.instance_presence',
	recordType: 'instance_presence',
	sequence: [
		{
			id: instancePresenceVersions.AddScribbleDelay,
			up: (instance: any) => {
				if (instance.scribble !== null) {
					instance.scribble.delay = 0
				}
			},
		},
		{
			id: instancePresenceVersions.RemoveInstanceId,
			up: (instance: any) => {
				delete instance.instanceId
			},
		},
		{
			id: instancePresenceVersions.AddChatMessage,
			up: (instance: any) => {
				instance.chatMessage = ''
			},
		},
		{
			id: instancePresenceVersions.AddMeta,
			up: (record: any) => {
				record.meta = {}
			},
		},
		{
			id: instancePresenceVersions.RenameSelectedShapeIds,
			up: (_record) => {
				// noop, whoopsie
			},
		},
		{
			id: instancePresenceVersions.NullableCameraCursor,
			up: (_record: any) => {
				// noop
			},
			down: (record: any) => {
				if (record.camera === null) {
					record.camera = { x: 0, y: 0, z: 1 }
				}
				if (record.lastActivityTimestamp === null) {
					record.lastActivityTimestamp = 0
				}
				if (record.cursor === null) {
					record.cursor = { type: 'default', x: 0, y: 0, rotation: 0 }
				}
				if (record.screenBounds === null) {
					record.screenBounds = { x: 0, y: 0, w: 1, h: 1 }
				}
			},
		},
	],
})

/** @public */
export const InstancePresenceRecordType = createRecordType<AppInstancePresence>(
	'instance_presence',
	{
		validator: instancePresenceValidator,
		scope: 'presence',
	}
).withDefaultProperties(() => ({
	lastActivityTimestamp: null,
	followingUserId: null,
	color: '#FF0000',
	camera: null,
	cursor: null,
	screenBounds: null,
	selectedShapeIds: [],
	brush: null,
	scribbles: [],
	chatMessage: '',
	meta: {},
}))
