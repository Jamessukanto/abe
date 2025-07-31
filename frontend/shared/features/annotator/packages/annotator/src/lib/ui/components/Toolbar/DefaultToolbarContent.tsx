import { GeoShapeGeoStyle, useEditor, useValue } from '@annotator/editor'
import { TLUiToolItem, useTools } from '../../hooks/useTools'
import { AnnotatorUiMenuToolItem } from '../primitives/menus/AnnotatorUiMenuToolItem'

/** @public @react */
export function DefaultToolbarContent() {
	return (
		<>
			<SelectToolbarItem />
			<HandToolbarItem />
			<DrawToolbarItem />
			<EraserToolbarItem />

			<NoteToolbarItem />
			<RectangleToolbarItem />
			<EllipseToolbarItem />

			<LineToolbarItem />
			<LaserToolbarItem />
		</>
	)
}

/** @public */
export function useIsToolSelected(tool: TLUiToolItem | undefined) {
	const editor = useEditor()
	const geo = tool?.meta?.geo
	return useValue(
		'is tool selected',
		() => {
			if (!tool) return false
			const activeToolId = editor.getCurrentToolId()
			if (activeToolId === 'geo') {
				return geo === editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle)
			} else {
				return activeToolId === tool.id
			}
		},
		[editor, tool?.id, geo]
	)
}

/** @public */
export interface ToolbarItemProps {
	tool: string
}

/** @public @react */
export function ToolbarItem({ tool }: ToolbarItemProps) {
	const tools = useTools()
	const isSelected = useIsToolSelected(tools[tool])
	return <AnnotatorUiMenuToolItem toolId={tool} isSelected={isSelected} />
}

/** @public @react */
export function SelectToolbarItem() {
	return <ToolbarItem tool="select" />
}

/** @public @react */
export function HandToolbarItem() {
	return <ToolbarItem tool="hand" />
}

/** @public @react */
export function DrawToolbarItem() {
	return <ToolbarItem tool="draw" />
}

/** @public @react */
export function EraserToolbarItem() {
	return <ToolbarItem tool="eraser" />
}

/** @public @react */
export function NoteToolbarItem() {
	return <ToolbarItem tool="note" />
}

/** @public @react */
export function RectangleToolbarItem() {
	return <ToolbarItem tool="rectangle" />
}

/** @public @react */
export function EllipseToolbarItem() {
	return <ToolbarItem tool="ellipse" />
}

/** @public @react */
export function LineToolbarItem() {
	return <ToolbarItem tool="line" />
}

/** @public @react */
export function LaserToolbarItem() {
	return <ToolbarItem tool="laser" />
}
