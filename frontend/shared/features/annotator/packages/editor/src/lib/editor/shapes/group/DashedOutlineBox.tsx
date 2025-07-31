import { useValue } from '@annotator/state-react'
import { useEditor } from '../../../hooks/useEditor'
import { Box } from '../../../primitives/Box'

export function DashedOutlineBox({ bounds, className }: { bounds: Box; className: string }) {
	const editor = useEditor()

	const zoomLevel = useValue('zoom level', () => editor.getZoomLevel(), [editor])

	return (
		<g className={className} pointerEvents="none" strokeLinecap="round" strokeLinejoin="round">
			{bounds.sides.map((side, i) => {
				return (
					<line
						key={i}
						x1={side[0].x}
						y1={side[0].y}
						x2={side[1].x}
						y2={side[1].y}
						strokeDasharray={'none'}
						strokeDashoffset={'none'}
					/>
				)
			})}
		</g>
	)
}
