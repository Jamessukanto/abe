import { getDefaultColorTheme, useIsDarkMode } from '@annotator/editor'

/** @public */
export function useDefaultColorTheme() {
	return getDefaultColorTheme({ isDarkMode: useIsDarkMode() })
}
