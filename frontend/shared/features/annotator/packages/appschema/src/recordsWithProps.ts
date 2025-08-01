import {
	Migration,
	MigrationId,
	MigrationSequence,
	RecordType,
	StandaloneDependsOn,
	UnknownRecord,
	createMigrationSequence,
} from '@annotator/store'
import { MakeUndefinedOptional, assert } from '@annotator/utils'
import { T } from '@annotator/validate'
import { SchemaPropsInfo } from './createTLSchema'

/** @public */
export type RecordProps<R extends UnknownRecord & { props: object }> = {
	[K in keyof R['props']]: T.Validatable<R['props'][K]>
}

/** @public */
export type RecordPropsType<Config extends Record<string, T.Validatable<any>>> =
	MakeUndefinedOptional<{
		[K in keyof Config]: T.TypeOf<Config[K]>
	}>

/**
 * @public
 */
export interface TLPropsMigration {
	readonly id: MigrationId
	readonly dependsOn?: MigrationId[]
	// eslint-disable-next-line @typescript-eslint/method-signature-style
	readonly up: (props: any) => any
	/**
	 * If a down migration was deployed more than a couple of months ago it should be safe to retire it.
	 * We only really need them to smooth over the transition between versions, and some folks do keep
	 * browser tabs open for months without refreshing, but at a certain point that kind of behavior is
	 * on them. Plus anyway recently chrome has started to actually kill tabs that are open for too long
	 * rather than just suspending them, so if other browsers follow suit maybe it's less of a concern.
	 *
	 * @public
	 */
	readonly down?: 'none' | 'retired' | ((props: any) => any)
}

/**
 * @public
 */
export interface TLPropsMigrations {
	readonly sequence: Array<StandaloneDependsOn | TLPropsMigration>
}

export function processPropsMigrations<R extends UnknownRecord & { type: string; props: object }>(
	typeName: R['typeName'],
	records: Record<string, SchemaPropsInfo>
) {
	const result: MigrationSequence[] = []

	for (const [subType, { migrations }] of Object.entries(records)) {
		const sequenceId = `com.annotator.${typeName}.${subType}`
		if (!migrations) {
			// provide empty migrations sequence to allow for future migrations
			result.push(
				createMigrationSequence({
					sequenceId,
					retroactive: true,
					sequence: [],
				})
			)
		} else if ('sequenceId' in migrations) {
			assert(
				sequenceId === migrations.sequenceId,
				`sequenceId mismatch for ${subType} ${RecordType} migrations. Expected '${sequenceId}', got '${migrations.sequenceId}'`
			)
			result.push(migrations)
		} else if ('sequence' in migrations) {
			result.push(
				createMigrationSequence({
					sequenceId,
					retroactive: true,
					sequence: migrations.sequence.map((m) =>
						'id' in m ? createPropsMigration(typeName, subType, m) : m
					),
				})
			)
		} 
	}

	return result
}

export function createPropsMigration<R extends UnknownRecord & { type: string; props: object }>(
	typeName: R['typeName'],
	subType: R['type'],
	m: TLPropsMigration
): Migration {
	return {
		id: m.id,
		dependsOn: m.dependsOn,
		scope: 'record',
		filter: (r) => r.typeName === typeName && (r as R).type === subType,
		up: (record: any) => {
			const result = m.up(record.props)
			if (result) {
				record.props = result
			}
		},
		down:
			typeof m.down === 'function'
				? (record: any) => {
						const result = (m.down as (props: any) => any)(record.props)
						if (result) {
							record.props = result
						}
					}
				: undefined,
	}
}
