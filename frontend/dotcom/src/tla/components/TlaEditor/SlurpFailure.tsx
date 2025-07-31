import {
	AnnotatorUiButton,
	AnnotatorUiButtonLabel,
	AnnotatorUiDialogBody,
	AnnotatorUiDialogCloseButton,
	AnnotatorUiDialogFooter,
	AnnotatorUiDialogHeader,
	AnnotatorUiDialogTitle,
} from 'annotator'
import { routes } from '../../../routeDefs'
import { F } from '../../utils/i18n'
import { ExternalLink } from '../ExternalLink/ExternalLink'

export function SlurpFailure({
	slurpPersistenceKey,
	onTryAgain,
	onClose,
}: {
	slurpPersistenceKey: string
	onTryAgain(): void
	onClose(): void
}) {
	return (
		<>
			<AnnotatorUiDialogHeader>
				<AnnotatorUiDialogTitle>
					<strong style={{ fontSize: 14 }}>
						<F defaultMessage="Upload failed" />
					</strong>
				</AnnotatorUiDialogTitle>
				<AnnotatorUiDialogCloseButton />
			</AnnotatorUiDialogHeader>
			<AnnotatorUiDialogBody
				style={{
					maxWidth: 350,
					display: 'flex',
					flexDirection: 'column',
					gap: 'var(--space-4)',
				}}
			>
				<p>
					<F defaultMessage="We failed to upload some of the content you created before you signed in." />
				</p>
				<p>
					<F defaultMessage="Follow these steps to import the content manually:" />
				</p>
				<ol>
					<li>
						<ExternalLink to={routes.tlaLocalFile(slurpPersistenceKey)}>
							<F defaultMessage="Go here to see the content" />
						</ExternalLink>
					</li>
					<li>
						<F defaultMessage="Export the content as a .tldr file: Select 'Download' in the top left menu." />
					</li>
					<li>
						<F defaultMessage="Drag the file into the sidebar on this page. Or select the 'Import file' option from the user menu." />
					</li>
				</ol>
				<p>
					<F
						defaultMessage="Still having trouble? {GetHelpLink}"
						values={{
							GetHelpLink: (
								<ExternalLink to="https://discord.annotator.com/?utm_source=dotcom&utm_medium=organic&utm_campaign=slurp-failure">
									<F defaultMessage="Get help on Discord" />
								</ExternalLink>
							),
						}}
					/>
				</p>
			</AnnotatorUiDialogBody>
			<AnnotatorUiDialogFooter className="tlui-dialog__footer__actions">
				<AnnotatorUiButton type="normal" onClick={() => onTryAgain()}>
					<AnnotatorUiButtonLabel>
						<F defaultMessage="Try Again" />
					</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
				<AnnotatorUiButton type="primary" onClick={() => onClose()}>
					<AnnotatorUiButtonLabel>
						<F defaultMessage="Close" />
					</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
			</AnnotatorUiDialogFooter>
		</>
	)
}
