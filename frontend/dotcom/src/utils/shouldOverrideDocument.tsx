import {
	TLUiDialogsContextType,
	AnnotatorUiButton,
	AnnotatorUiButtonLabel,
	AnnotatorUiDialogBody,
	AnnotatorUiDialogCloseButton,
	AnnotatorUiDialogFooter,
	AnnotatorUiDialogHeader,
	AnnotatorUiDialogTitle,
	useTranslation,
} from 'annotator'

/** @public */
export async function shouldOverrideDocument(addDialog: TLUiDialogsContextType['addDialog']) {
	const shouldContinue = await new Promise<boolean>((resolve) => {
		addDialog({
			component: ({ onClose }) => (
				<ConfirmOpenDialog
					onCancel={() => {
						resolve(false)
						onClose()
					}}
					onContinue={() => {
						resolve(true)
						onClose()
					}}
				/>
			),
			onClose: () => {
				resolve(false)
			},
		})
	})

	return shouldContinue
}

function ConfirmOpenDialog({ onCancel, onContinue }: { onCancel(): void; onContinue(): void }) {
	const msg = useTranslation()
	return (
		<>
			<AnnotatorUiDialogHeader>
				<AnnotatorUiDialogTitle>{msg('file-system.confirm-open.title')}</AnnotatorUiDialogTitle>
				<AnnotatorUiDialogCloseButton />
			</AnnotatorUiDialogHeader>
			<AnnotatorUiDialogBody style={{ maxWidth: 350 }}>
				{msg('file-system.confirm-open.description')}
			</AnnotatorUiDialogBody>
			<AnnotatorUiDialogFooter className="tlui-dialog__footer__actions">
				<AnnotatorUiButton type="normal" onClick={onCancel}>
					<AnnotatorUiButtonLabel>{msg('file-system.confirm-open.cancel')}</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
				<AnnotatorUiButton type="primary" onClick={async () => onContinue()}>
					<AnnotatorUiButtonLabel>{msg('file-system.confirm-open.open')}</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
			</AnnotatorUiDialogFooter>
		</>
	)
}
