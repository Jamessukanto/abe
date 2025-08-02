import { BaseRecord } from '@annotator/store'
import { JsonObject } from '@annotator/utils'
import { T } from '@annotator/validate'
import { idValidator } from '../misc/id-validator'
import { AppBindingId } from '../records/AppBinding'
import { AppShapeId } from '../records/AppShape'
import { shapeIdValidator } from '../shapes/AppBaseShape'

/** @public */
export interface AppBaseBinding<Type extends string, Props extends object>
	extends BaseRecord<'binding', AppBindingId> {
	type: Type
	fromId: AppShapeId
	toId: AppShapeId
	props: Props
	meta: JsonObject
}

/** @public */
export const bindingIdValidator = idValidator<AppBindingId>('binding')

/** @public */
export function createBindingValidator<
	Type extends string,
	Props extends JsonObject,
	Meta extends JsonObject,
>(
	type: Type,
	props?: { [K in keyof Props]: T.Validatable<Props[K]> },
	meta?: { [K in keyof Meta]: T.Validatable<Meta[K]> }
) {
	return T.object<AppBaseBinding<Type, Props>>({
		id: bindingIdValidator,
		typeName: T.literal('binding'),
		type: T.literal(type),
		fromId: shapeIdValidator,
		toId: shapeIdValidator,
		props: props ? T.object(props) : (T.jsonValue as any),
		meta: meta ? T.object(meta) : (T.jsonValue as any),
	})
}
