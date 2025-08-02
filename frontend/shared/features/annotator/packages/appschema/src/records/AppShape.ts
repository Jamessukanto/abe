import {
	RecordId,
	UnknownRecord,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
} from '@annotator/store'
import { mapObjectMapValues, uniqueId } from '@annotator/utils'
import { T } from '@annotator/validate'
import { SchemaPropsInfo } from '../createTLSchema'
import { TLPropsMigrations } from '../recordsWithProps'
import { TLBaseShape, createShapeValidator } from '../shapes/TLBaseShape'
import { TLBookmarkShape } from '../shapes/TLBookmarkShape'
import { AnnotatorShape } from '../shapes/AnnotatorShape'


import { AppGeoShape } from '../shapes/AppGeoShape'
import { AppGroupShape } from '../shapes/AppGroupShape'
import { AppHighlightShape } from '../shapes/AppHighlightShape'
import { AppImageShape } from '../shapes/AppImageShape'
import { AppLineShape } from '../shapes/AppLineShape'
import { AppNoteShape } from '../shapes/AppNoteShape'
import { AppTextShape } from '../shapes/AppTextShape'
import { AppVideoShape } from '../shapes/AppVideoShape'
import { StyleProp } from '../styles/StyleProp'
import { TLPageId } from './TLPage'
import { StoreValidator } from '@annotator/store'

/**
 * The default set of shapes that are available in the editor.
 *
 * @public */
export type TLDefaultShape =
	| TLBookmarkShape
	| AnnotatorShape

	| TLGeoShape
	| TLGroupShape
	| TLImageShape
	| TLLineShape
	| TLNoteShape
	| TLTextShape
	| TLVideoShape
	| TLHighlightShape

/**
 * A type for a shape that is available in the editor but whose type is
 * unknown—either one of the editor's default shapes or else a custom shape.
 *
 * @public */
export type TLUnknownShape = TLBaseShape<string, object>

/**
 * The set of all shapes that are available in the editor, including unknown shapes.
 *
 * @public
 */
export type TLShape = TLDefaultShape | TLUnknownShape

/** @public */
export type TLShapePartial<T extends TLShape = TLShape> = T extends T
	? {
			id: TLShapeId
			type: T['type']
			props?: Partial<T['props']>
			meta?: Partial<T['meta']>
		} & Partial<Omit<T, 'type' | 'id' | 'props' | 'meta'>>
	: never

/** @public */
export type TLShapeId = RecordId<TLUnknownShape>

/** @public */
export type TLParentId = TLPageId | TLShapeId

/** @public */
export const rootShapeVersions = createMigrationIds('com.annotator.shape', {
	AddIsLocked: 1,
	HoistOpacity: 2,
	AddMeta: 3,
	AddWhite: 4,
	RemoveOpacity: 5,
} as const)

/** @public */
export const rootShapeMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.shape',
	recordType: 'shape',
	sequence: [
		{
			id: rootShapeVersions.AddIsLocked,
			up: (record: any) => {
				record.isLocked = false
			},
			down: (record: any) => {
				delete record.isLocked
			},
		},
		{
			id: rootShapeVersions.HoistOpacity,
			up: (record: any) => {
				record.opacity = Number(record.props.opacity ?? '1')
				delete record.props.opacity
			},
			down: (record: any) => {
				const opacity = record.opacity
				delete record.opacity
				record.props.opacity =
					opacity < 0.175
						? '0.1'
						: opacity < 0.375
							? '0.25'
							: opacity < 0.625
								? '0.5'
								: opacity < 0.875
									? '0.75'
									: '1'
			},
		},
		{
			id: rootShapeVersions.AddMeta,
			up: (record: any) => {
				record.meta = {}
			},
		},
		{
			id: rootShapeVersions.AddWhite,
			up: (_record) => {
				// noop
			},
			down: (record: any) => {
				if (record.props.color === 'white') {
					record.props.color = 'black'
				}
			},
		},
		{
			id: rootShapeVersions.RemoveOpacity,
			up: (record: any) => {
				// Remove opacity property - all shapes will render at 100% opacity
				delete record.opacity
			},
		},
	],
})

/** @public */
export function isShape(record?: UnknownRecord): record is TLShape {
	if (!record) return false
	return record.typeName === 'shape'
}

/** @public */
export function isShapeId(id?: string): id is TLShapeId {
	if (!id) return false
	return id.startsWith('shape:')
}

/** @public */
export function createShapeId(id?: string): TLShapeId {
	return `shape:${id ?? uniqueId()}` as TLShapeId
}

/** @internal */
export function getShapePropKeysByStyle(props: Record<string, T.Validatable<any>>) {
	const propKeysByStyle = new Map<StyleProp<unknown>, string>()
	for (const [key, prop] of Object.entries(props)) {
		if (prop instanceof StyleProp) {
			if (propKeysByStyle.has(prop)) {
				throw new Error(
					`Duplicate style prop ${prop.id}. Each style prop can only be used once within a shape.`
				)
			}
			propKeysByStyle.set(prop, key)
		}
	}
	return propKeysByStyle
}

/**
 * @public
 */
export function createShapePropsMigrationSequence(
	migrations: TLPropsMigrations
): TLPropsMigrations {
	return migrations
}

/**
 * @public
 */
export function createShapePropsMigrationIds<
	const S extends string,
	const T extends Record<string, number>,
>(shapeType: S, ids: T): { [k in keyof T]: `com.annotator.shape.${S}/${T[k]}` } {
	return mapObjectMapValues(ids, (_k, v) => `com.annotator.shape.${shapeType}/${v}`) as any
}

/** @internal */
export function createShapeRecordType(shapes: Record<string, SchemaPropsInfo>) {
	const baseValidator = T.model(
		'shape',
		T.union(
			'type',
			mapObjectMapValues(shapes, (type, { props, meta }) =>
				createShapeValidator(type, props, meta)
			)
		)
	)

	// Create a wrapper validator that handles unexpected properties
	const wrappedValidator: StoreValidator<TLShape> = {
		validate: (record: unknown) => {
			try {
				return baseValidator.validate(record)
			} catch (error) {
				// Handle unexpected properties by cleaning them up and retrying
				if (error instanceof Error && error.message.includes('Unexpected property')) {
					console.warn('Found shape with unexpected properties, cleaning up:', error.message)
					
					// Clean up the record by removing unexpected properties
					const cleanedRecord = record && typeof record === 'object' ? { ...(record as object) } as any : record
					
					// Remove opacity property if it exists
					if (cleanedRecord && typeof cleanedRecord === 'object' && 'opacity' in cleanedRecord) {
						delete cleanedRecord.opacity
					}
					
					// Try validation again with cleaned record
					try {
						return baseValidator.validate(cleanedRecord)
					} catch (retryError) {
						console.error('Failed to validate record after cleanup:', retryError)
						throw retryError
					}
				}
				
				throw error
			}
		}
	}

	return createRecordType<TLShape>('shape', {
		scope: 'document',
		validator: wrappedValidator,
	}).withDefaultProperties(() => ({
		x: 0,
		y: 0,
		rotation: 0,
		isLocked: false,
		opacity: 1,
		meta: {},
	}))
}
