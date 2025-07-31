import { track, useEditor, usePresence } from '@annotator/editor'
import { useCallback } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiIcon } from '../primitives/AnnotatorUiIcon'

export const PeopleMenuItem = track(function PeopleMenuItem({ userId }: { userId: string }) {
	const editor = useEditor()
	const msg = useTranslation()
	const trackEvent = useUiEvents()

	const presence = usePresence(userId)

	const handleFollowClick = useCallback(() => {
		if (editor.getInstanceState().followingUserId === userId) {
			editor.stopFollowingUser()
			trackEvent('stop-following', { source: 'people-menu' })
		} else {
			editor.startFollowingUser(userId)
			trackEvent('start-following', { source: 'people-menu' })
		}
	}, [editor, userId, trackEvent])

	const theyAreFollowingYou = presence?.followingUserId === editor.user.getId()
	const youAreFollowingThem = editor.getInstanceState().followingUserId === userId

	if (!presence) return null

	return (
		<div
			className="tlui-people-menu__item tlui-buttons__horizontal"
			data-follow={youAreFollowingThem || theyAreFollowingYou}
		>
			<AnnotatorUiButton
				type="menu"
				className="tlui-people-menu__item__button"
				onClick={() => editor.zoomToUser(userId)}
				onDoubleClick={handleFollowClick}
			>
				<AnnotatorUiIcon label={msg('people-menu.avatar-color')} icon="color" color={presence.color} />
				<div className="tlui-people-menu__name">
					{presence.userName?.trim() || msg('people-menu.anonymous-user')}
				</div>
			</AnnotatorUiButton>
			<AnnotatorUiButton
				type="icon"
				className="tlui-people-menu__item__follow"
				title={
					theyAreFollowingYou
						? msg('people-menu.leading')
						: youAreFollowingThem
							? msg('people-menu.following')
							: msg('people-menu.follow')
				}
				onClick={handleFollowClick}
				disabled={theyAreFollowingYou}
			>
				<AnnotatorUiButtonIcon
					icon={theyAreFollowingYou ? 'leading' : youAreFollowingThem ? 'following' : 'follow'}
				/>
			</AnnotatorUiButton>
		</div>
	)
})
