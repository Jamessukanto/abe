import { useEditor, useValue } from '@annotator/editor'
import { useActions } from '../../context/actions'
import { AnnotatorUiMenuItem } from '../primitives/menus/AnnotatorUiMenuItem'

export function StopFollowing() {
	const editor = useEditor()
	const actions = useActions()

	const followingUser = useValue(
		'is following user',
		() => !!editor.getInstanceState().followingUserId,
		[editor]
	)
	if (!followingUser) return null

	return <AnnotatorUiMenuItem {...actions['stop-following']} />
}
