import { LoadingScreen as LoadingScreenContainer, useEditorComponents } from '@annotator/editor'

/** @public @react */
export const LoadingScreen = () => {
	const { Spinner } = useEditorComponents()
	return <LoadingScreenContainer>{Spinner ? <Spinner /> : null}</LoadingScreenContainer>
}
