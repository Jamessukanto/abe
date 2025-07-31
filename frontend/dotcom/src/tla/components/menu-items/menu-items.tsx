import { useAuth } from '@clerk/clerk-react'
import { fileOpen } from 'browser-fs-access'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ColorSchemeMenu,
	ANNOTATOR_FILE_EXTENSION,
	AnnotatorUiMenuCheckboxItem,
	AnnotatorUiMenuGroup,
	AnnotatorUiMenuItem,
	AnnotatorUiMenuSubmenu,
	useDialogs,
	useMaybeEditor,
	useValue,
} from 'annotator'
import { useOpenUrlAndTrack } from '../../../hooks/useOpenUrlAndTrack'
import { routes } from '../../../routeDefs'
import { useMaybeApp } from '../../hooks/useAppState'
import { useAnnotatorAppUiEvents } from '../../utils/app-ui-events'
import { getCurrentEditor } from '../../utils/getCurrentEditor'
import { defineMessages, useMsg } from '../../utils/i18n'
import { clearLocalSessionState } from '../../utils/local-session-state'
import { SubmitFeedbackDialog } from '../dialogs/SubmitFeedbackDialog'
import { TlaManageCookiesDialog } from '../dialogs/TlaManageCookiesDialog'

const messages = defineMessages({
	help: { defaultMessage: 'Help' },
	// user menu
	accountMenu: { defaultMessage: 'User settings' },
	signOut: { defaultMessage: 'Sign out' },
	importFile: { defaultMessage: 'Import file…' },
	// account menu
	getHelp: { defaultMessage: 'User manual' },
	legalSummary: { defaultMessage: 'Legal summary' },
	terms: { defaultMessage: 'Terms of service' },
	privacy: { defaultMessage: 'Privacy policy' },
	cookiePolicy: { defaultMessage: 'Cookie policy' },
	manageCookies: { defaultMessage: 'Manage cookies' },
	about: { defaultMessage: 'About annotator' },
	submitFeedback: { defaultMessage: 'Send feedback' },
	// debug
	appDebugFlags: { defaultMessage: 'App debug flags' },
	langAccented: { defaultMessage: 'i18n: Accented' },
	langLongString: { defaultMessage: 'i18n: Long String' },
	langHighlightMissing: { defaultMessage: 'i18n: Highlight Missing' },
})

export function SignOutMenuItem() {
	const auth = useAuth()

	const trackEvent = useAnnotatorAppUiEvents()

	const label = useMsg(messages.signOut)

	const handleSignout = useCallback(() => {
		auth.signOut().then(clearLocalSessionState)
		trackEvent('sign-out-clicked', { source: 'sidebar' })
	}, [auth, trackEvent])

	if (!auth.isSignedIn) return
	return (
		<AnnotatorUiMenuGroup id="account-actions">
			<AnnotatorUiMenuItem
				id="sign-out"
				data-testid="tla-user-sign-out"
				onSelect={handleSignout}
				label={label}
				readonlyOk
			/>
		</AnnotatorUiMenuGroup>
	)
}

export function ColorThemeSubmenu() {
	const editor = useMaybeEditor()
	if (!editor) return null
	return <ColorSchemeMenu />
}

export function CookieConsentMenuItem() {
	const { addDialog } = useDialogs()
	return (
		<AnnotatorUiMenuItem
			id="cookie-consent"
			label={useMsg(messages.manageCookies)}
			readonlyOk
			onSelect={() => {
				addDialog({ component: () => <TlaManageCookiesDialog /> })
			}}
		/>
	)
}

export function UserManualMenuItem() {
	const openAndTrack = useOpenUrlAndTrack('main-menu')
	return (
		<AnnotatorUiMenuItem
			id="user-manual"
			label={useMsg(messages.getHelp)}
			iconLeft="manual"
			readonlyOk
			onSelect={() => {
				openAndTrack('https://annotator.notion.site/support')
			}}
		/>
	)
}

export function GiveUsFeedbackMenuItem() {
	const { addDialog } = useDialogs()
	return (
		<AnnotatorUiMenuItem
			id="give-us-feedback"
			label={useMsg(messages.submitFeedback)}
			iconLeft="comment"
			readonlyOk
			onSelect={() => {
				addDialog({ component: SubmitFeedbackDialog })
			}}
		/>
	)
}

export function LegalSummaryMenuItem() {
	const openAndTrack = useOpenUrlAndTrack('main-menu')
	return (
		<AnnotatorUiMenuItem
			id="tos"
			label={useMsg(messages.legalSummary)}
			readonlyOk
			onSelect={() => {
				openAndTrack('https://annotator.notion.site/legal')
			}}
		/>
	)
}

export function ImportFileActionItem() {
	const trackEvent = useAnnotatorAppUiEvents()
	const app = useMaybeApp()

	const navigate = useNavigate()

	const importFileMsg = useMsg(messages.importFile)

	return (
		<AnnotatorUiMenuItem
			id="about"
			label={importFileMsg}
			icon="import"
			readonlyOk
			onSelect={async () => {
				const editor = getCurrentEditor()
				if (!editor) return
				if (!app) return

				trackEvent('import-tldr-file', { source: 'account-menu' })

				try {
					const annotatorFiles = await fileOpen({
						extensions: [ANNOTATOR_FILE_EXTENSION],
						multiple: true,
						description: 'annotator project',
					})

					app.uploadTldrFiles(annotatorFiles, (file) => {
						navigate(routes.tlaFile(file.id), { state: { mode: 'create' } })
					})
				} catch {
					// user cancelled
					return
				}
			}}
		/>
	)
}

export function DebugMenuGroup() {
	const maybeEditor = useMaybeEditor()
	const isDebugMode = useValue('debug', () => maybeEditor?.getInstanceState().isDebugMode, [
		maybeEditor,
	])
	if (!isDebugMode) return null

	return <DebugSubmenu />
}

export function DebugSubmenu() {
	const editor = useMaybeEditor()
	const appFlagsLbl = useMsg(messages.appDebugFlags)

	const [shouldHighlightMissing, setShouldHighlightMissing] = useState(
		document.body.classList.contains('tla-lang-highlight-missing')
	)
	const debugLanguageFlags = [
		{ name: useMsg(messages.langAccented), locale: 'xx-AE' },
		{ name: useMsg(messages.langLongString), locale: 'xx-LS' },
		{ name: useMsg(messages.langHighlightMissing), locale: 'xx-MS' },
	]

	useEffect(() => {
		document.body.classList.toggle('tla-lang-highlight-missing', shouldHighlightMissing)
	}, [shouldHighlightMissing])

	return (
		<AnnotatorUiMenuSubmenu id="debug" label={appFlagsLbl}>
			<AnnotatorUiMenuGroup id="debug app flags">
				{debugLanguageFlags.map((flag) => (
					<AnnotatorUiMenuCheckboxItem
						key={flag.name}
						id={flag.name}
						title={flag.name}
						label={flag.name
							.replace(/([a-z0-9])([A-Z])/g, (m) => `${m[0]} ${m[1].toLowerCase()}`)
							.replace(/^[a-z]/, (m) => m.toUpperCase())}
						checked={
							flag.locale === 'xx-MS'
								? shouldHighlightMissing
								: editor?.user.getLocale() === flag.locale
						}
						onSelect={() => {
							if (flag.locale === 'xx-MS') {
								setShouldHighlightMissing(!shouldHighlightMissing)
							} else {
								editor?.user.updateUserPreferences({ locale: flag.locale })
							}
						}}
					/>
				))}
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}
