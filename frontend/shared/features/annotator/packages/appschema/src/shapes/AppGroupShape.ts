import { createShapePropsMigrationSequence } from '../records/AppShape'
import { RecordProps } from '../recordsWithProps'
import { AppBaseShape } from './AppBaseShape'

/** @public */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppGroupShapeProps {}

/** @public */
export type AppGroupShape = AppBaseShape<'group', AppGroupShapeProps>

/** @public */
export const groupShapeProps: RecordProps<AppGroupShape> = {}

/** @public */
export const groupShapeMigrations = createShapePropsMigrationSequence({ sequence: [] })
