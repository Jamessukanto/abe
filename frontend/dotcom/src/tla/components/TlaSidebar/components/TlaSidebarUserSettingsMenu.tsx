import classNames from 'classnames'
import {
	LanguageMenu,
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuTrigger,
	AnnotatorUiMenuContextProvider,
	AnnotatorUiMenuGroup,
	useValue,
} from 'annotator'
import { useApp } from '../../../hooks/useAppState'
import { F, defineMessages, useMsg } from '../../../utils/i18n'
import { TlaIcon } from '../../TlaIcon/TlaIcon'
import {
	ColorThemeSubmenu,
	DebugMenuGroup,
	ImportFileActionItem,
	SignOutMenuItem,
} from '../../menu-items/menu-items'
import styles from '../sidebar.module.css'

const messages = defineMessages({
	userMenu: { defaultMessage: 'User settings' },
})

export function TlaUserSettingsMenu() {
	const app = useApp()
	const userMenuLbl = useMsg(messages.userMenu)
	const user = useValue('auth', () => app.getUser(), [app])
	if (!user) return null

	return (
		<AnnotatorUiDropdownMenuRoot id={`user-settings-sidebar`}>
			<AnnotatorUiMenuContextProvider type="menu" sourceId="dialog">
				<AnnotatorUiDropdownMenuTrigger>
					<button
						className={classNames(styles.sidebarUserSettingsTrigger, styles.hoverable)}
						title={userMenuLbl}
						data-testid="tla-sidebar-user-settings-trigger"
					>
						<div
							className={classNames(
								styles.sidebarUserSettingsName,
								'tla-text_ui__regular',
								'notranslate'
							)}
						>
							{user.name || <F defaultMessage="Account" />}
						</div>
						<div className={styles.sidebarUserSettingsIcon}>
							<TlaIcon icon="dots-vertical-strong" />
						</div>
					</button>
				</AnnotatorUiDropdownMenuTrigger>
				<AnnotatorUiDropdownMenuContent side="bottom" align="end" alignOffset={4} sideOffset={4}>
					<AnnotatorUiMenuGroup id="files">
						<ImportFileActionItem />
					</AnnotatorUiMenuGroup>
					<AnnotatorUiMenuGroup id="preferences">
						<ColorThemeSubmenu />
						<LanguageMenu />
					</AnnotatorUiMenuGroup>
					<DebugMenuGroup />
					<AnnotatorUiMenuGroup id="signout">
						<SignOutMenuItem />
					</AnnotatorUiMenuGroup>
				</AnnotatorUiDropdownMenuContent>
			</AnnotatorUiMenuContextProvider>
		</AnnotatorUiDropdownMenuRoot>
	)
}
