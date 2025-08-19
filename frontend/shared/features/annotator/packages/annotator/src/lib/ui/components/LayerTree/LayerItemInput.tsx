import { TLShapeId, useEditor } from '@annotator/editor'
import { useCallback, useRef } from 'react'
import { useUiEvents } from '../../context/events'
import { AnnotatorUiInput } from '../primitives/AnnotatorUiInput'

/** @public */
export interface LayerItemInputProps {
	name: string
	id: TLShapeId
	onCancel(): void
	onComplete?(): void
	renameShape: (id: TLShapeId, name: string) => void
}

/** @public @react */
export const LayerItemInput = function LayerItemInput({
	name,
	id,
	onCancel,
	onComplete,
	renameShape,
}: LayerItemInputProps) {

	const editor = useEditor()
	const trackEvent = useUiEvents()
	const rInput = useRef<HTMLInputElement | null>(null)
	const rMark = useRef<string | null>(null)

	const handleFocus = useCallback(() => {
		rMark.current = editor.markHistoryStoppingPoint('rename page')
	}, [editor])

	// const handleChange = useCallback(
	// 	(value: string) => {
	// 		editor.renamePage(id, value || 'New Page')
	// 		trackEvent('rename-page', { source: 'page-menu' })
	// 	},
	// 	[editor, id, trackEvent]
	// )

	const handleChange = useCallback(
		(value: string) => {
			renameShape(id, value || 'New Region')
			// trackEvent('rename-shape', { source: 'page-menu' })
		},
		[editor, id, trackEvent]
	)

	const handleCancel = useCallback(() => {
		if (rMark.current) {
			editor.bailToMark(rMark.current)
		}
		onCancel()
	}, [editor, onCancel])

	return (
		<span className="tlui-button__label">
			<AnnotatorUiInput
				ref={(el) => (rInput.current = el)}
				defaultValue={name}
				onValueChange={handleChange}
				onComplete={onComplete}
				onCancel={handleCancel}
				onBlur={handleCancel}
				onFocus={handleFocus}
				shouldManuallyMaintainScrollPositionWhenFocused
				autoFocus={true}
				autoSelect
			/>
		</span>
	)
}
