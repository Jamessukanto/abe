import { SignInButton } from '@clerk/clerk-react'
import {
	PUBLISH_PREFIX,
	READ_ONLY_PREFIX,
	ROOM_PREFIX,
	SNAPSHOT_PREFIX,
} from '@annotator/dotcom-shared'
import classNames from 'classnames'
import { useCallback, useMemo, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
	getFromLocalStorage,
	PeopleMenu,
	setInLocalStorage,
	useEditor,
	usePassThroughWheelEvents,
	useTranslation,
} from 'annotator'
import { routes } from '../../../routeDefs'
import { useMaybeApp } from '../../hooks/useAppState'
import { useCurrentFileId } from '../../hooks/useCurrentFileId'
import { useAnnotatorAppUiEvents } from '../../utils/app-ui-events'
import { defineMessages, F, useMsg } from '../../utils/i18n'
import { TlaCtaButton } from '../TlaCtaButton/TlaCtaButton'
import { TlaFileShareMenu } from '../TlaFileShareMenu/TlaFileShareMenu'
import { TlaIcon } from '../TlaIcon/TlaIcon'
import styles from './top.module.css'

const ctaMessages = defineMessages({
	signInToShare: { defaultMessage: 'Sign in to share' },
	signInToSave: { defaultMessage: 'Sign in to save' },
	createFreeAccount: { defaultMessage: 'Create a free account' },
	createYourAccount: { defaultMessage: 'Create your account' },
	saveAndShare: { defaultMessage: 'Save and share' },
	saveYourWork: { defaultMessage: 'Save your work' },
	shareYourWork: { defaultMessage: 'Share your work' },
	shareForFree: { defaultMessage: 'Share for free' },
	signIn: { defaultMessage: 'Sign in' },
	logIn: { defaultMessage: 'Log in' },
	logUp: { defaultMessage: 'Log up' },
	youShould: { defaultMessage: 'You should sign up' },
	pleaseSignIn: { defaultMessage: 'Please sign in' },
	pleaseSignUp: { defaultMessage: 'Please sign up' },
	signUpFreeAndGood: { defaultMessage: 'Sign up (free and good)' },
	youllSignUpWontYou: { defaultMessage: "You'll sign up, won't you?" },
	anAccountWouldBeNice: { defaultMessage: 'An account would be nice' },
	comeWithMe: { defaultMessage: 'Come with me to annotator' },
	betterThanMiro: { defaultMessage: 'Miro but good and free' },
	betterThanExcalidraw: { defaultMessage: 'Not Excalidraw' },
	betterThanFigjam: { defaultMessage: 'Figjam but annotator' },
	joinTheWaitlist: { defaultMessage: 'Join the waitlist' },
	addFriend: { defaultMessage: 'Add friend' },
	hey: { defaultMessage: 'Hey' },
})

function useCtaMessage() {
	const ctaMessage = useMemo(() => {
		if (process.env.NODE_ENV === 'test') return ctaMessages.signInToShare

		const isFirstTime = getFromLocalStorage('tla-has-been-here')
		if (!isFirstTime) {
			setInLocalStorage('tla-has-been-here', 'yep')
			return ctaMessages.signInToShare
		}

		const LIKELIHOOD_START = 0.25
		const LIKELIHOOD_END = 0.0005

		// Make earlier messages more likely and later messages less likely
		const entries = Object.values(ctaMessages)
		const messagesWithLikelihood = entries.map((entry, i) => ({
			...entry,
			likelihood:
				LIKELIHOOD_START * Math.pow(LIKELIHOOD_END / LIKELIHOOD_START, i / (entries.length - 1)),
		}))

		// Calculate total likelihood for weighted selection
		const totalLikelihood = messagesWithLikelihood.reduce((sum, msg) => sum + msg.likelihood, 0)

		// Generate random number between 0 and totalLikelihood
		let random = Math.random() * totalLikelihood

		// Find the message based on weighted probability
		for (const message of messagesWithLikelihood) {
			random -= message.likelihood
			if (random <= 0) {
				return message
			}
		}

		// Fallback (shouldn't happen, but just in case)
		return messagesWithLikelihood[0]
	}, [])

	return ctaMessage
}

export function TlaEditorTopRightPanel({
	isAnonUser,
	context,
}: {
	isAnonUser: boolean
	context: 'file' | 'published-file' | 'scratch'
}) {
	const ctaMessage = useCtaMessage()
	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)
	const fileId = useCurrentFileId()
	const trackEvent = useAnnotatorAppUiEvents()

	if (isAnonUser) {
		return (
			<div ref={ref} className={classNames(styles.topRightPanel)}>
				<PeopleMenu />
				<SignedOutShareButton fileId={fileId} context={context} />
				<SignInButton
					mode="modal"
					data-testid="tla-sign-in-button"
					forceRedirectUrl={location.pathname + location.search}
					signUpForceRedirectUrl={location.pathname + location.search}
				>
					<TlaCtaButton
						data-testid="tla-sign-up"
						onClick={() =>
							trackEvent('sign-up-clicked', {
								source: 'anon-landing-page',
								ctaMessage: ctaMessage.defaultMessage,
							})
						}
					>
						<F {...ctaMessage} />
					</TlaCtaButton>
				</SignInButton>
			</div>
		)
	}

	return (
		<div ref={ref} className={styles.topRightPanel}>
			<PeopleMenu />
			{(
				<TlaFileShareMenu fileId={fileId!} source="file-header" context={context}>
					<TlaCtaButton
						data-testid="tla-share-button"
						onClick={() => trackEvent('open-share-menu', { source: 'top-bar' })}
					>
						<F defaultMessage="Share" />
					</TlaCtaButton>
				</TlaFileShareMenu>
			)}
		</div>
	)
}

export function useGetFileName() {
	const editor = useEditor()
	const msg = useTranslation()
	const defaultPageName = msg('page-menu.new-page-initial-name')

	const documentName = editor.getDocumentSettings().name
	if (documentName?.length > 0) return documentName

	const firstPageName = editor.getPages()[0].name
	if (
		firstPageName.length > 0 &&
		!firstPageName.startsWith('Page 1') &&
		!firstPageName.startsWith(defaultPageName)
	)
		return firstPageName
	return ''
}

function usePrefix() {
	const location = useLocation()
	const roomPrefix = location.pathname.split('/')[1]
	switch (roomPrefix) {
		case ROOM_PREFIX:
		case READ_ONLY_PREFIX:
		case SNAPSHOT_PREFIX:
		case PUBLISH_PREFIX:
			return roomPrefix
	}
	return null
}

export function useRoomInfo() {
	const id = useParams()['roomId'] as string
	const prefix = usePrefix()
	if (!id || !prefix) return null
	return { prefix, id }
}

export const signedOutShareMessages = defineMessages({
	share: { defaultMessage: 'Share' },
})

export function SignedOutShareButton({
	fileId,
	context,
}: {
	fileId?: string
	context: 'file' | 'published-file' | 'scratch'
}) {
	const trackEvent = useAnnotatorAppUiEvents()
	const shareLbl = useMsg(signedOutShareMessages.share)

	return (
		<TlaFileShareMenu fileId={fileId} context={context} source="anon">
			<button
				data-testid="tla-share-button"
				aria-label={shareLbl}
				className={classNames(styles.topRightAnonShareButton)}
				onClick={() => trackEvent('open-share-menu', { source: 'anon-top-bar' })}
			>
				<TlaIcon icon="share" />
			</button>
		</TlaFileShareMenu>
	)
}
