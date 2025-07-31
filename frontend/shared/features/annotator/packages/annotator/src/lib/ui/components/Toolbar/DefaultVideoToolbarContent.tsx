import { TLVideoShape, track, useEditor, useValue } from '@annotator/editor'
import { useCallback } from 'react'
import { useActions } from '../../context/actions'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'

/** @public */
export interface DefaultVideoToolbarContentProps {
	videoShapeId: TLVideoShape['id']
	onEditAltTextStart(): void
}

/** @public @react */
export const DefaultVideoToolbarContent = track(function DefaultVideoToolbarContent({
	videoShapeId,
	onEditAltTextStart,
}: DefaultVideoToolbarContentProps) {
	const editor = useEditor()
	const trackEvent = useUiEvents()
	const msg = useTranslation()
	const source = 'video-toolbar'
	const isReadonly = editor.getIsReadonly()

	const actions = useActions()

	const handleVideoReplace = useCallback(
		() => actions['video-replace'].onSelect('video-toolbar'),
		[actions]
	)

	const handleVideoDownload = useCallback(
		() => actions['download-original'].onSelect('video-toolbar'),
		[actions]
	)

	const altText = useValue(
		'altText',
		() => editor.getShape<TLVideoShape>(videoShapeId)!.props.altText,
		[editor, videoShapeId]
	)

	return (
		<>
			{(altText || !isReadonly) && (
				<AnnotatorUiButton
					type="normal"
					isActive={!!altText}
					title={msg('tool.media-alt-text')}
					onClick={() => {
						trackEvent('alt-text-start', { source })
						onEditAltTextStart()
					}}
				>
					<AnnotatorUiButtonIcon small icon="alt" />
				</AnnotatorUiButton>
			)}
		</>
	)
})
