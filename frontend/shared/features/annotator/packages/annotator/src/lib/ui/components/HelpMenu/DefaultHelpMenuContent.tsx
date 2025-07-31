import { useCallback } from 'react'
import { useAnnotatorUiComponents } from '../../context/components'
import { useDialogs } from '../../context/dialogs'
import { LanguageMenu } from '../LanguageMenu'
import { AnnotatorUiMenuItem } from '../primitives/menus/AnnotatorUiMenuItem'

/** @public @react */
export function DefaultHelpMenuContent() {
	return (
		<>
			<LanguageMenu />
			<KeyboardShortcutsMenuItem />
		</>
	)
}
/** @public @react */
export function KeyboardShortcutsMenuItem() {
	const { KeyboardShortcutsDialog } = useAnnotatorUiComponents()
	const { addDialog } = useDialogs()

	const handleSelect = useCallback(() => {
		if (KeyboardShortcutsDialog) addDialog({ component: KeyboardShortcutsDialog })
	}, [addDialog, KeyboardShortcutsDialog])

	if (!KeyboardShortcutsDialog) return null

	return (
		<AnnotatorUiMenuItem
			id="keyboard-shortcuts-button"
			label="help-menu.keyboard-shortcuts"
			readonlyOk
			onSelect={handleSelect}
		/>
	)
}
