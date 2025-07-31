import { useTranslation } from '../../../hooks/useTranslation/useTranslation'
import { AnnotatorUiIcon } from '../AnnotatorUiIcon'

/** @public */
export interface TLUiButtonCheckProps {
	checked: boolean
}

/** @public @react */
export function AnnotatorUiButtonCheck({ checked }: TLUiButtonCheckProps) {
	const msg = useTranslation()
	return (
		<AnnotatorUiIcon
			data-checked={!!checked}
			label={msg(checked ? 'ui.checked' : 'ui.unchecked')}
			icon={checked ? 'check' : 'none'}
			className="tlui-button__icon"
			small
		/>
	)
}
