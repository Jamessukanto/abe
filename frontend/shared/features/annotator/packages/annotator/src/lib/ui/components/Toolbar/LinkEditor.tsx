import { preventDefault, TiptapEditor, useEditor } from '@annotator/editor'
import { useEffect, useRef, useState } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiInput } from '../primitives/AnnotatorUiInput'

/** @public */
export interface LinkEditorProps {
	textEditor: TiptapEditor
	value: string
	onClose(): void
}

/** @public @react */
export function LinkEditor({ textEditor, value: initialValue, onClose }: LinkEditorProps) {
	const editor = useEditor()
	const [value, setValue] = useState(initialValue)
	const msg = useTranslation()
	const ref = useRef<HTMLInputElement>(null)
	const trackEvent = useUiEvents()
	const source = 'rich-text-menu'
	const linkifiedValue = value.startsWith('http') ? value : `https://${value}`

	const handleValueChange = (value: string) => setValue(value)

	const handleLinkComplete = (link: string) => {
		trackEvent('rich-text', { operation: 'link-edit', source })
		if (!link.startsWith('http://') && !link.startsWith('https://')) {
			link = `https://${link}`
		}

		textEditor.commands.setLink({ href: link })
		// N.B. We shouldn't focus() on mobile because it causes the
		// Return key to replace the link with a newline :facepalm:
		if (editor.getInstanceState().isCoarsePointer) {
			textEditor.commands.blur()
		} else {
			textEditor.commands.focus()
		}
		onClose()
	}

	const handleVisitLink = () => {
		trackEvent('rich-text', { operation: 'link-visit', source })
		window.open(linkifiedValue, '_blank', 'noopener, noreferrer')
		onClose()
	}

	const handleRemoveLink = () => {
		trackEvent('rich-text', { operation: 'link-remove', source })
		textEditor.chain().unsetLink().focus().run()
		onClose()
	}

	const handleLinkCancel = () => onClose()

	useEffect(() => {
		ref.current?.focus()
	}, [value])

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	return (
		<>
			<AnnotatorUiInput
				ref={ref}
				data-testid="rich-text.link-input"
				className="tlui-rich-text__toolbar-link-input"
				value={value}
				onValueChange={handleValueChange}
				onComplete={handleLinkComplete}
				onCancel={handleLinkCancel}
				placeholder="example.com"
			/>
			<AnnotatorUiButton
				className="tlui-rich-text__toolbar-link-visit"
				title={msg('tool.rich-text-link-visit')}
				type="icon"
				onPointerDown={preventDefault}
				onClick={handleVisitLink}
				disabled={!value}
			>
				<AnnotatorUiButtonIcon small icon="external-link" />
			</AnnotatorUiButton>
			<AnnotatorUiButton
				className="tlui-rich-text__toolbar-link-remove"
				title={msg('tool.rich-text-link-remove')}
				data-testid="rich-text.link-remove"
				type="icon"
				onPointerDown={preventDefault}
				onClick={handleRemoveLink}
			>
				<AnnotatorUiButtonIcon small icon="trash" />
			</AnnotatorUiButton>
		</>
	)
}
