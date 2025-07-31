import { TLShape } from '@annotator/tlschema'

export const areShapesContentEqual = (a: TLShape, b: TLShape) =>
	a.props === b.props && a.meta === b.meta
