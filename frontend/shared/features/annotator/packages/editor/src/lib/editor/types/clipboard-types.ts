import { SerializedSchema } from '@annotator/store'
import { TLAsset, TLBinding, TLShape, TLShapeId } from '@annotator/tlschema'

/** @public */
export interface TLContent {
	shapes: TLShape[]
	bindings: TLBinding[] | undefined
	rootShapeIds: TLShapeId[]
	assets: TLAsset[]
	schema: SerializedSchema
}
