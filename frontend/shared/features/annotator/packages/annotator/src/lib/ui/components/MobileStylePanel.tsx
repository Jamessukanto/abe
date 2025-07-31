import {
	DefaultColorStyle,
	TLDefaultColorStyle,
	getDefaultColorTheme,
	useEditor,
	useValue,
} from '@annotator/editor'
import { useCallback } from 'react'
import { useAnnotatorUiComponents } from '../context/components'
import { useRelevantStyles } from '../hooks/useRelevantStyles'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from './primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from './primitives/Button/AnnotatorUiButtonIcon'
import {
	AnnotatorUiPopover,
	AnnotatorUiPopoverContent,
	AnnotatorUiPopoverTrigger,
} from './primitives/AnnotatorUiPopover'

/** @public @react */
export function MobileStylePanel() {
	const editor = useEditor()
	const msg = useTranslation()

	const relevantStyles = useRelevantStyles()
	const color = relevantStyles?.get(DefaultColorStyle)
	const theme = getDefaultColorTheme({ isDarkMode: editor.user.getIsDarkMode() })
	const currentColor = (
		color?.type === 'shared' ? theme[color.value as TLDefaultColorStyle] : theme.black
	).solid

	const disableStylePanel = useValue(
		'disable style panel',
		() => editor.isInAny('hand', 'zoom', 'eraser', 'laser'),
		[editor]
	)

	const handleStylesOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				editor.updateInstanceState({ isChangingStyle: false })
			}
		},
		[editor]
	)

	const { StylePanel } = useAnnotatorUiComponents()
	if (!StylePanel) return null

	return (
		<AnnotatorUiPopover id="mobile style menu" onOpenChange={handleStylesOpenChange}>
			<AnnotatorUiPopoverTrigger>
				<AnnotatorUiButton
					type="tool"
					data-testid="mobile-styles.button"
					style={{
						color: disableStylePanel ? 'var(--color-muted-1)' : currentColor,
					}}
					title={msg('style-panel.title')}
					disabled={disableStylePanel}
				>
					<AnnotatorUiButtonIcon
						icon={disableStylePanel ? 'blob' : color?.type === 'mixed' ? 'mixed' : 'blob'}
					/>
				</AnnotatorUiButton>
			</AnnotatorUiPopoverTrigger>
			<AnnotatorUiPopoverContent side="top" align="end">
				{StylePanel && <StylePanel isMobile />}
			</AnnotatorUiPopoverContent>
		</AnnotatorUiPopover>
	)
}
