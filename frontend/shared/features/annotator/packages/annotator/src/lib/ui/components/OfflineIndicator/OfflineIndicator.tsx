import classNames from 'classnames'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiIcon } from '../primitives/AnnotatorUiIcon'

/** @public @react */
export function OfflineIndicator() {
	const msg = useTranslation()

	return (
		<div className={classNames('tlui-offline-indicator')}>
			{msg('status.offline')}
			<AnnotatorUiIcon label={msg('status.offline')} icon="status-offline" small />
		</div>
	)
}
