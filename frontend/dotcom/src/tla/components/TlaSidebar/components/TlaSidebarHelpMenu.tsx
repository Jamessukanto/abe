import classNames from 'classnames'
import {
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuTrigger,
	AnnotatorUiMenuContextProvider,
	AnnotatorUiMenuGroup,
} from 'annotator'
import { defineMessages, useMsg } from '../../../utils/i18n'
import { TlaIcon } from '../../TlaIcon/TlaIcon'
import {
	CookieConsentMenuItem,
	GiveUsFeedbackMenuItem,
	LegalSummaryMenuItem,
	UserManualMenuItem,
} from '../../menu-items/menu-items'
import styles from '../sidebar.module.css'

const messages = defineMessages({
	help: { defaultMessage: 'Help' },
})

export function TlaSidebarHelpMenu() {
	const msg = useMsg(messages.help)
	return (
		<AnnotatorUiDropdownMenuRoot id={`help-menu-sidebar`}>
			<AnnotatorUiMenuContextProvider type="menu" sourceId="dialog">
				<AnnotatorUiDropdownMenuTrigger>
					<button
						title={msg}
						data-testid="tla-sidebar-help-menu-trigger"
						className={classNames(styles.sidebarHelpMenuTrigger, styles.hoverable)}
					>
						<TlaIcon icon="question" />
					</button>
				</AnnotatorUiDropdownMenuTrigger>
				<AnnotatorUiDropdownMenuContent side="bottom" align="end" alignOffset={0} sideOffset={10}>
					<AnnotatorUiMenuGroup id="support">
						<UserManualMenuItem />
						<GiveUsFeedbackMenuItem />
					</AnnotatorUiMenuGroup>
					<AnnotatorUiMenuGroup id="legal">
						<LegalSummaryMenuItem />
						<CookieConsentMenuItem />
					</AnnotatorUiMenuGroup>
				</AnnotatorUiDropdownMenuContent>
			</AnnotatorUiMenuContextProvider>
		</AnnotatorUiDropdownMenuRoot>
	)
}
