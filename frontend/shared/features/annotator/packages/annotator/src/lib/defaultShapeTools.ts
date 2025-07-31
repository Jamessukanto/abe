import { DrawShapeTool } from './shapes/draw/DrawShapeTool'
import { GeoShapeTool } from './shapes/geo/GeoShapeTool'
import { HighlightShapeTool } from './shapes/highlight/HighlightShapeTool'
import { LineShapeTool } from './shapes/line/LineShapeTool'
import { NoteShapeTool } from './shapes/note/NoteShapeTool'
import { TextShapeTool } from './shapes/text/TextShapeTool'

/** @public */
export const defaultShapeTools = [
	TextShapeTool,
	DrawShapeTool,
	GeoShapeTool,
	NoteShapeTool,
	LineShapeTool,
	HighlightShapeTool,
] as const
