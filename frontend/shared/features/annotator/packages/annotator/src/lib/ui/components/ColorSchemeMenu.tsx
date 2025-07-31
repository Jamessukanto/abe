import { useEditor, useValue } from '@annotator/editor'
import { useUiEvents } from '../context/events'
import { AnnotatorUiMenuCheckboxItem } from './primitives/menus/AnnotatorUiMenuCheckboxItem'
import { AnnotatorUiMenuGroup } from './primitives/menus/AnnotatorUiMenuGroup'
import { AnnotatorUiMenuSubmenu } from './primitives/menus/AnnotatorUiMenuSubmenu'

const COLOR_SCHEMES = [
	{ colorScheme: 'light' as const, label: 'theme.light' },
	{ colorScheme: 'dark' as const, label: 'theme.dark' },
	{ colorScheme: 'system' as const, label: 'theme.system' },
]

/** @public @react */
export function ColorSchemeMenu() {
	const editor = useEditor()
	const trackEvent = useUiEvents()
	const currentColorScheme = useValue(
		'colorScheme',
		() =>
			editor.user.getUserPreferences().colorScheme ??
			(editor.user.getIsDarkMode() ? 'dark' : 'light'),
		[editor]
	)

	return (
		<AnnotatorUiMenuSubmenu id="help menu color-scheme" label="menu.theme">
			<AnnotatorUiMenuGroup id="theme">
				{COLOR_SCHEMES.map(({ colorScheme, label }) => (
					<AnnotatorUiMenuCheckboxItem
						id={`color-scheme-${colorScheme}`}
						key={colorScheme}
						label={label}
						checked={colorScheme === currentColorScheme}
						readonlyOk
						onSelect={() => {
							editor.user.updateUserPreferences({ colorScheme })
							trackEvent('color-scheme', { source: 'menu', value: colorScheme })
						}}
					/>
				))}
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}
