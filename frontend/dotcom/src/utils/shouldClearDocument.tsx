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

export async function shouldClearDocument(addDialog: TLUiDialogsContextType['addDialog']) {
	const shouldContinue = await new Promise<boolean>((resolve) => {
		addDialog({
			component: ({ onClose }) => (
				<ConfirmClearDialog
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

function ConfirmClearDialog({ onCancel, onContinue }: { onCancel(): void; onContinue(): void }) {
	const msg = useTranslation()
	return (
		<>
			<AnnotatorUiDialogHeader>
				<AnnotatorUiDialogTitle>{msg('file-system.confirm-clear.title')}</AnnotatorUiDialogTitle>
				<AnnotatorUiDialogCloseButton />
			</AnnotatorUiDialogHeader>
			<AnnotatorUiDialogBody style={{ maxWidth: 350 }}>
				{msg('file-system.confirm-clear.description')}
			</AnnotatorUiDialogBody>
			<AnnotatorUiDialogFooter className="tlui-dialog__footer__actions">
				<AnnotatorUiButton type="normal" onClick={onCancel}>
					<AnnotatorUiButtonLabel>{msg('file-system.confirm-clear.cancel')}</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
				<AnnotatorUiButton type="primary" onClick={async () => onContinue()}>
					<AnnotatorUiButtonLabel>{msg('file-system.confirm-clear.continue')}</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
			</AnnotatorUiDialogFooter>
		</>
	)
}
