import { useTools } from '../../../hooks/useTools'
import { AnnotatorUiMenuItem, TLUiMenuItemProps } from './AnnotatorUiMenuItem'

/** @public */
export type TLUiMenuToolItemProps = {
	toolId?: string
} & Pick<TLUiMenuItemProps, 'isSelected' | 'disabled'>

/** @public @react */
export function AnnotatorUiMenuToolItem({ toolId = '', ...rest }: TLUiMenuToolItemProps) {
	const tools = useTools()
	const tool = tools[toolId]
	if (!tool) return null
	return <AnnotatorUiMenuItem {...tool} {...rest} />
}
