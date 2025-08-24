import { useMaybeApp } from '../../../hooks/useAppState'
import { TlaEditorAppBar } from '../TlaEditorAppBar'

export function TlaEditorAppPanel() {
	const app = useMaybeApp()
	return <TlaEditorAppBar isAnonUser={!app} />
}
