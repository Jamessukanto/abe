import { useEditor, useQuickReactor } from '@annotator/editor'
import { useRef, useState } from 'react'
import { useActions } from '../../context/actions'
import { AnnotatorUiMenuActionItem } from '../primitives/menus/AnnotatorUiMenuActionItem'

export function BackToContent() {
	const editor = useEditor()

	const actions = useActions()

	const [showBackToContent, setShowBackToContent] = useState(false)
	const rIsShowing = useRef(false)

	useQuickReactor(
		'toggle showback to content',
		() => {
			const showBackToContentPrev = rIsShowing.current
			const shapeIds = editor.getCurrentPageShapeIds()
			let showBackToContentNow = false
			if (shapeIds.size) {
				showBackToContentNow = shapeIds.size === editor.getCulledShapes().size
			}

			if (showBackToContentPrev !== showBackToContentNow) {
				setShowBackToContent(showBackToContentNow)
				rIsShowing.current = showBackToContentNow
			}
		},
		[editor]
	)

	if (!showBackToContent) return null

	return (
		<AnnotatorUiMenuActionItem
			actionId="back-to-content"
			onSelect={() => {
				actions['back-to-content'].onSelect('helper-buttons')
				setShowBackToContent(false)
			}}
		/>
	)
}
