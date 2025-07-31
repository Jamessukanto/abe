import { Tooltip as _Tooltip } from 'radix-ui'
import {
	AnnotatorUiDialogBody,
	AnnotatorUiDialogCloseButton,
	AnnotatorUiDialogHeader,
	AnnotatorUiDialogTitle,
	useValue,
} from 'annotator'
import { useApp } from '../../hooks/useAppState'
import { F } from '../../utils/i18n'
import {
	TlaMenuControl,
	TlaMenuControlGroup,
	TlaMenuControlInfoTooltip,
	TlaMenuControlLabel,
	TlaMenuSwitch,
} from '../tla-menu/tla-menu'
import styles from './dialogs.module.css'

const COOKIE_POLICY_URL = 'https://annotator.notion.site/cookie-policy'

export function TlaManageCookiesDialog() {
	const app = useApp()
	const user = useValue('user', () => app.getUser(), [app])

	return (
		<_Tooltip.Provider>
			<div className={styles.dialogContainer}>
				<AnnotatorUiDialogHeader>
					<AnnotatorUiDialogTitle>
						<F defaultMessage="Manage cookies" />
					</AnnotatorUiDialogTitle>
					<AnnotatorUiDialogCloseButton />
				</AnnotatorUiDialogHeader>
				<AnnotatorUiDialogBody className={styles.dialogBody}>
					<p>
						<F
							defaultMessage="We use cookies to keep you logged in, to sync your files, and to collect analytics to help us improve annotator."
							values={{
								a: (chunks) => (
									<a href={COOKIE_POLICY_URL} target="_blank" rel="noreferrer">
										{chunks}
									</a>
								),
							}}
						/>
					</p>
					<TlaMenuControlGroup>
						<TlaMenuControl>
							<TlaMenuControlLabel>
								<F defaultMessage="Essential cookies" />
							</TlaMenuControlLabel>
							<TlaMenuControlInfoTooltip>
								<F defaultMessage="We use these cookies to save your files and settings." />
							</TlaMenuControlInfoTooltip>
							<TlaMenuSwitch checked={true} disabled />
						</TlaMenuControl>
						<TlaMenuControl>
							<TlaMenuControlLabel>
								<F defaultMessage="Analytics" />
							</TlaMenuControlLabel>
							<TlaMenuControlInfoTooltip>
								<F defaultMessage="We use analytics cookies to make annotator better." />
							</TlaMenuControlInfoTooltip>
							<TlaMenuSwitch
								checked={!!app.getUser().allowAnalyticsCookie}
								onChange={() => {
									app.updateUser({ id: user.id, allowAnalyticsCookie: !user.allowAnalyticsCookie })
								}}
							/>
						</TlaMenuControl>
					</TlaMenuControlGroup>
					<p>
						<F
							defaultMessage="Read our <a>cookie policy</a> to learn more."
							values={{
								a: (chunks) => (
									<a href={COOKIE_POLICY_URL} target="_blank" rel="noreferrer">
										{chunks}
									</a>
								),
							}}
						/>
					</p>
				</AnnotatorUiDialogBody>
			</div>
		</_Tooltip.Provider>
	)
}
