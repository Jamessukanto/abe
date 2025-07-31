import { useActions } from '../../../context/actions'
import { AnnotatorUiMenuItem, type TLUiMenuItemProps } from './AnnotatorUiMenuItem'

/** @public */
export type TLUiMenuActionItemProps = {
	actionId?: string
} & Partial<Pick<TLUiMenuItemProps, 'disabled' | 'isSelected' | 'noClose' | 'onSelect'>>

/** @public @react */
export function AnnotatorUiMenuActionItem({ actionId = '', ...rest }: TLUiMenuActionItemProps) {
	const actions = useActions()
	const action = actions[actionId]
	if (!action) return null
	return <AnnotatorUiMenuItem {...action} {...rest} />
}
