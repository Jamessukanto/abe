import { useParams } from 'react-router-dom'
import {
	DefaultMainMenu,
	DefaultMainMenuContent,
	TLComponents,
	AnnotatorUiMenuActionItem,
	AnnotatorUiMenuGroup,
} from 'annotator'
import { LocalEditor } from '../../components/LocalEditor'

const components: TLComponents = {
	ErrorFallback: ({ error }) => {
		throw error
	},
	SharePanel: null,
	MainMenu: () => (
		<DefaultMainMenu>
			<AnnotatorUiMenuGroup id="download">
				<AnnotatorUiMenuActionItem actionId={'save-file-copy'} />
			</AnnotatorUiMenuGroup>
			<DefaultMainMenuContent />
		</DefaultMainMenu>
	),
}

export function Component() {
	const { fileSlug } = useParams<{ fileSlug: string }>()
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<LocalEditor persistenceKey={fileSlug} components={components} />
		</div>
	)
}
