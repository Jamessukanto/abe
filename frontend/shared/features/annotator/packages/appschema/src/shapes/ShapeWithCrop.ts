import { VecModel } from '../misc/geometry-types'
import { AppBaseShape } from './AppBaseShape'

/** @public */
export interface AppShapeCrop {
	topLeft: VecModel
	bottomRight: VecModel
	isCircle?: boolean
}

/** @public */
export type ShapeWithCrop = AppBaseShape<string, { w: number; h: number; crop: AppShapeCrop | null }>
