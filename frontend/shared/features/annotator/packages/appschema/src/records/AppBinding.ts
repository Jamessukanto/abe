import {
	RecordId,
	UnknownRecord,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
} from '@annotator/store'
import { Expand, mapObjectMapValues, uniqueId } from '@annotator/utils'
import { T } from '@annotator/validate'
import { AppBaseBinding, createBindingValidator } from '../bindings/AppBaseBinding'
import { SchemaPropsInfo } from '../createAppSchema'
import { AppPropsMigrations } from '../recordsWithProps'

/**
 * The default set of bindings that are available in the editor.
 *

/**
 * A type for a binding that is available in the editor but whose type is
 * unknown—either one of the editor's default bindings or else a custom binding.
 *
 * @public */
export type AppUnknownBinding = AppBaseBinding<string, object>

/**
 * The set of all bindings that are available in the editor, including unknown bindings.
 *
 * @public
 */
export type AppBinding = AppUnknownBinding

/** @public */
export type AppBindingUpdate<T extends AppBinding = AppBinding> = Expand<{
	id: AppBindingId
	type: T['type']
	typeName?: T['typeName']
	fromId?: T['fromId']
	toId?: T['toId']
	props?: Partial<T['props']>
	meta?: Partial<T['meta']>
}>

/** @public */
export type AppBindingCreate<T extends AppBinding = AppBinding> = Expand<{
	id?: AppBindingId
	type: T['type']
	typeName?: T['typeName']
	fromId: T['fromId']
	toId: T['toId']
	props?: Partial<T['props']>
	meta?: Partial<T['meta']>
}>

/**
 * An ID for a {@link AppBinding}.
 *
 * @public
 */
export type AppBindingId = RecordId<AppUnknownBinding>

/** @public */
export const rootBindingVersions = createMigrationIds('com.annotator.binding', {} as const)

/** @public */
export const rootBindingMigrations = createRecordMigrationSequence({
	sequenceId: 'com.annotator.binding',
	recordType: 'binding',
	sequence: [],
})

/** @public */
export function isBinding(record?: UnknownRecord): record is AppBinding {
	if (!record) return false
	return record.typeName === 'binding'
}

/** @public */
export function isBindingId(id?: string): id is AppBindingId {
	if (!id) return false
	return id.startsWith('binding:')
}

/** @public */
export function createBindingId(id?: string): AppBindingId {
	return `binding:${id ?? uniqueId()}` as AppBindingId
}

/**
 * @public
 */
export function createBindingPropsMigrationSequence(
	migrations: AppPropsMigrations
): AppPropsMigrations {
	return migrations
}

/**
 * @public
 */
export function createBindingPropsMigrationIds<S extends string, T extends Record<string, number>>(
	bindingType: S,
	ids: T
): { [k in keyof T]: `com.annotator.binding.${S}/${T[k]}` } {
	return mapObjectMapValues(ids, (_k, v) => `com.annotator.binding.${bindingType}/${v}`) as any
}

/** @internal */
export function createBindingRecordType(bindings: Record<string, SchemaPropsInfo>) {
	return createRecordType<AppBinding>('binding', {
		scope: 'document',
		validator: T.model(
			'binding',
			T.union(
				'type',
				mapObjectMapValues(bindings, (type, { props, meta }) =>
					createBindingValidator(type, props, meta)
				)
			)
		),
	}).withDefaultProperties(() => ({
		meta: {},
	}))
}
