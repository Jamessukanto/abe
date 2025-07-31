import { useEditor, useValue } from '@annotator/editor'
import { useCallback, useRef, useState } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiInput } from '../primitives/AnnotatorUiInput'
import { UserPresenceColorPicker } from './UserPresenceColorPicker'

export function UserPresenceEditor() {
	const editor = useEditor()
	const trackEvent = useUiEvents()
	const userName = useValue('userName', () => editor.user.getName(), [])
	const msg = useTranslation()

	const rOriginalName = useRef(userName)
	const rCurrentName = useRef(userName)

	// Whether the user is editing their name or not
	const [isEditingName, setIsEditingName] = useState(false)
	const toggleEditingName = useCallback(() => {
		setIsEditingName((s) => !s)
	}, [])

	const handleValueChange = useCallback(
		(value: string) => {
			rCurrentName.current = value
			editor.user.updateUserPreferences({ name: value })
		},
		[editor]
	)

	const handleBlur = useCallback(() => {
		if (rOriginalName.current === rCurrentName.current) return
		trackEvent('change-user-name', { source: 'people-menu' })
		rOriginalName.current = rCurrentName.current
	}, [trackEvent])

	const handleCancel = useCallback(() => {
		setIsEditingName(false)
		editor.user.updateUserPreferences({ name: rOriginalName.current })
		editor.menus.clearOpenMenus()
	}, [editor])

	return (
		<div className="tlui-people-menu__user">
			<UserPresenceColorPicker />
			{isEditingName ? (
				<AnnotatorUiInput
					className="tlui-people-menu__user__input"
					defaultValue={userName}
					onValueChange={handleValueChange}
					onComplete={toggleEditingName}
					onCancel={handleCancel}
					onBlur={handleBlur}
					shouldManuallyMaintainScrollPositionWhenFocused
					autoFocus
					autoSelect
				/>
			) : (
				<>
					<div
						className="tlui-people-menu__user__name"
						onDoubleClick={() => {
							if (!isEditingName) setIsEditingName(true)
						}}
					>
						{userName || msg('people-menu.anonymous-user')}
					</div>
					{!userName ? (
						<div className="tlui-people-menu__user__label">{msg('people-menu.user')}</div>
					) : null}
				</>
			)}
			<AnnotatorUiButton
				type="icon"
				className="tlui-people-menu__user__edit"
				data-testid="people-menu.change-name"
				title={msg('people-menu.change-name')}
				onClick={toggleEditingName}
			>
				<AnnotatorUiButtonIcon icon={isEditingName ? 'check' : 'edit'} />
			</AnnotatorUiButton>
		</div>
	)
}
