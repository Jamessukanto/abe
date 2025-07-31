import { LANGUAGES, useMaybeEditor, useValue } from '@annotator/editor'
import { useUiEvents } from '../context/events'
import { AnnotatorUiMenuCheckboxItem } from './primitives/menus/AnnotatorUiMenuCheckboxItem'
import { AnnotatorUiMenuGroup } from './primitives/menus/AnnotatorUiMenuGroup'
import { AnnotatorUiMenuSubmenu } from './primitives/menus/AnnotatorUiMenuSubmenu'

/** @public @react */
export function LanguageMenu() {
	const editor = useMaybeEditor()
	const trackEvent = useUiEvents()
	const currentLanguage = useValue('locale', () => editor?.user.getLocale(), [editor])

	if (!editor) return null

	return (
		<AnnotatorUiMenuSubmenu id="help menu language" label="menu.language">
			<AnnotatorUiMenuGroup id="languages" className="tlui-language-menu">
				{LANGUAGES.map(({ locale, label }) => (
					<AnnotatorUiMenuCheckboxItem
						id={`language-${locale}`}
						key={locale}
						title={locale}
						label={label}
						checked={locale === currentLanguage}
						readonlyOk
						onSelect={() => {
							editor.user.updateUserPreferences({ locale })
							trackEvent('change-language', { source: 'menu', locale })
						}}
					/>
				))}
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}
