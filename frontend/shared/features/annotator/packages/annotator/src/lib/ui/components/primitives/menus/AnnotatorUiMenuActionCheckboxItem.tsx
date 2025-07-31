import { useActions } from '../../../context/actions'
import {
	AnnotatorUiMenuCheckboxItem,
	type TLUiMenuCheckboxItemProps,
} from './AnnotatorUiMenuCheckboxItem'

/** @public */
export type TLUiMenuActionCheckboxItemProps = {
	actionId?: string
} & Pick<TLUiMenuCheckboxItemProps, 'disabled' | 'checked' | 'toggle'>

/** @public @react */
export function AnnotatorUiMenuActionCheckboxItem({
	actionId = '',
	...rest
}: TLUiMenuActionCheckboxItemProps) {
	const actions = useActions()
	const action = actions[actionId]
	if (!action) return null
	return <AnnotatorUiMenuCheckboxItem {...action} {...rest} />
}
