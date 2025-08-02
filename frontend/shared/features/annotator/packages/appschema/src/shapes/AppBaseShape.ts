import { BaseRecord } from '@annotator/store'
import { IndexKey, JsonObject } from '@annotator/utils'
import { T } from '@annotator/validate'

import { idValidator } from '../misc/id-validator'
import { AppParentId, AppShapeId } from '../records/AppShape'

/** @public */
export interface AppBaseShape<Type extends string, Props extends object>
	extends BaseRecord<'shape', AppShapeId> {
	type: Type
	x: number
	y: number
	rotation: number
	index: IndexKey
	parentId: AppParentId
	isLocked: boolean
	props: Props
	meta: JsonObject
}

/** @public */
export const parentIdValidator = T.string.refine((id) => {
	if (!id.startsWith('page:') && !id.startsWith('shape:')) {
		throw new Error('Parent ID must start with "page:" or "shape:"')
	}
	return id as AppParentId
})

/** @public */
export const shapeIdValidator = idValidator<AppShapeId>('shape')

/** @public */
export function createShapeValidator<
	Type extends string,
	Props extends JsonObject,
	Meta extends JsonObject,
>(
	type: Type,
	props?: { [K in keyof Props]: T.Validatable<Props[K]> },
	meta?: { [K in keyof Meta]: T.Validatable<Meta[K]> }
) {
	return T.object<AppBaseShape<Type, Props>>({
		id: shapeIdValidator,
		typeName: T.literal('shape'),
		x: T.number,
		y: T.number,
		rotation: T.number,
		index: T.indexKey,
		parentId: parentIdValidator,
		type: T.literal(type),
		isLocked: T.boolean,
		props: props ? T.object(props) : (T.jsonValue as any),
		meta: meta ? T.object(meta) : (T.jsonValue as any),
	})
}
