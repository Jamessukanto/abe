import { ZoomTo100MenuItem, ZoomToFitMenuItem, ZoomToSelectionMenuItem } from '../menu-items'
import { AnnotatorUiMenuActionItem } from '../primitives/menus/AnnotatorUiMenuActionItem'

/** @public @react */
export function DefaultZoomMenuContent() {
	return (
		<>
			<AnnotatorUiMenuActionItem actionId="zoom-in" noClose />
			<AnnotatorUiMenuActionItem actionId="zoom-out" noClose />
			<ZoomTo100MenuItem />
			<ZoomToFitMenuItem />
			<ZoomToSelectionMenuItem />
		</>
	)
}
