import { AnnotatorUiMenuGroup, AnnotatorUiMenuItem } from 'annotator'
import { useOpenUrlAndTrack } from '../hooks/useOpenUrlAndTrack'

export function LegacyLinks() {
	const openAndTrack = useOpenUrlAndTrack('main-menu')

	return (
		<>
			<AnnotatorUiMenuGroup id="links">
				<AnnotatorUiMenuItem
					id="about"
					label="help-menu.terms"
					readonlyOk
					onSelect={() => {
						openAndTrack(
							'https://github.com/annotator/annotator/blob/main/apps/dotcom/client/TERMS_OF_SERVICE.md'
						)
					}}
				/>
				<AnnotatorUiMenuItem
					id="about"
					label="help-menu.privacy"
					readonlyOk
					onSelect={() => {
						openAndTrack(
							'https://github.com/annotator/annotator/blob/main/apps/dotcom/client/PRIVACY_POLICY.md'
						)
					}}
				/>
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup id="annotator">
				<AnnotatorUiMenuItem
					id="about"
					label="help-menu.about"
					readonlyOk
					onSelect={() => {
						openAndTrack(
							'https://annotator.dev/?utm_source=dotcom&utm_medium=organic&utm_campaign=learn-more'
						)
					}}
				/>
			</AnnotatorUiMenuGroup>
		</>
	)
}
