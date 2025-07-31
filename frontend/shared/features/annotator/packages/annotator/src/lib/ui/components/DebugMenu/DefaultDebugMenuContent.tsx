import {
	DebugFlag,
	Editor,
	TLShapePartial,
	createShapeId,
	debugFlags,
	featureFlags,
	hardResetEditor,
	track,
	uniqueId,
	useEditor,
} from '@annotator/editor'
import React from 'react'
import { useDialogs } from '../../context/dialogs'
import { useToasts } from '../../context/toasts'
import { untranslated } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonCheck } from '../primitives/Button/AnnotatorUiButtonCheck'
import { AnnotatorUiButtonLabel } from '../primitives/Button/AnnotatorUiButtonLabel'
import {
	AnnotatorUiDialogBody,
	AnnotatorUiDialogCloseButton,
	AnnotatorUiDialogFooter,
	AnnotatorUiDialogHeader,
	AnnotatorUiDialogTitle,
} from '../primitives/AnnotatorUiDialog'
import { AnnotatorUiMenuCheckboxItem } from '../primitives/menus/AnnotatorUiMenuCheckboxItem'
import { AnnotatorUiMenuGroup } from '../primitives/menus/AnnotatorUiMenuGroup'
import { AnnotatorUiMenuItem } from '../primitives/menus/AnnotatorUiMenuItem'
import { AnnotatorUiMenuSubmenu } from '../primitives/menus/AnnotatorUiMenuSubmenu'

/** @public @react */
export function DefaultDebugMenuContent() {
	const editor = useEditor()
	const { addToast } = useToasts()
	const { addDialog } = useDialogs()
	const [error, setError] = React.useState<boolean>(false)

	return (
		<>
			<AnnotatorUiMenuGroup id="items">
				<AnnotatorUiMenuItem id="hard-reset" onSelect={hardResetEditor} label={'Hard reset'} />
				<AnnotatorUiMenuItem
					id="add-toast"
					onSelect={() => {
						addToast({
							id: uniqueId(),
							title: 'Something good happened',
							description: 'Hey, attend to this thing over here. It might be important!',
							keepOpen: true,
							severity: 'success',
						})
						addToast({
							id: uniqueId(),
							title: 'Something happened',
							description: 'Hey, attend to this thing over here. It might be important!',
							keepOpen: true,
							severity: 'info',
							actions: [
								{
									label: 'Primary',
									type: 'primary',
									onClick: () => {
										void null
									},
								},
								{
									label: 'Normal',
									type: 'normal',
									onClick: () => {
										void null
									},
								},
								{
									label: 'Danger',
									type: 'danger',
									onClick: () => {
										void null
									},
								},
							],
						})
						addToast({
							id: uniqueId(),
							title: 'Something maybe bad happened',
							description: 'Hey, attend to this thing over here. It might be important!',
							keepOpen: true,
							severity: 'warning',
							actions: [
								{
									label: 'Primary',
									type: 'primary',
									onClick: () => {
										void null
									},
								},
								{
									label: 'Normal',
									type: 'normal',
									onClick: () => {
										void null
									},
								},
								{
									label: 'Danger',
									type: 'danger',
									onClick: () => {
										void null
									},
								},
							],
						})
						addToast({
							id: uniqueId(),
							title: 'Something bad happened',
							severity: 'error',
							keepOpen: true,
						})
					}}
					label={untranslated('Show toast')}
				/>
				<AnnotatorUiMenuItem
					id="show-dialog"
					label={'Show dialog'}
					onSelect={() => {
						addDialog({
							component: ({ onClose }) => (
								<ExampleDialog
									displayDontShowAgain
									onCancel={() => onClose()}
									onContinue={() => onClose()}
								/>
							),
							onClose: () => {
								void null
							},
						})
					}}
				/>
				<AnnotatorUiMenuItem
					id="create-shapes"
					label={'Create 100 shapes'}
					onSelect={() => createNShapes(editor, 100)}
				/>
				<AnnotatorUiMenuItem
					id="count-nodes"
					label={'Count shapes / nodes'}
					onSelect={() => {
						const selectedShapes = editor.getSelectedShapes()
						const shapes =
							selectedShapes.length === 0 ? editor.getRenderingShapes() : selectedShapes
						window.alert(
							`Shapes ${shapes.length}, DOM nodes:${document.querySelector('.tl-shapes')!.querySelectorAll('*')?.length}`
						)
					}}
				/>
				{(() => {
					if (error) throw Error('oh no!')
					return null
				})()}
				<AnnotatorUiMenuItem id="throw-error" onSelect={() => setError(true)} label={'Throw error'} />
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup id="flags">
				<DebugFlags />
				<FeatureFlags />
			</AnnotatorUiMenuGroup>
		</>
	)
}
/** @public @react */
export function DebugFlags() {
	const items = Object.values(debugFlags)
	if (!items.length) return null
	return (
		<AnnotatorUiMenuSubmenu id="debug flags" label="Debug Flags">
			<AnnotatorUiMenuGroup id="debug flags">
				{items.map((flag) => (
					<DebugFlagToggle key={flag.name} flag={flag} />
				))}
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}
/** @public @react */
export function FeatureFlags() {
	const items = Object.values(featureFlags)
	if (!items.length) return null
	return (
		<AnnotatorUiMenuSubmenu id="feature flags" label="Feature Flags">
			<AnnotatorUiMenuGroup id="feature flags">
				{items.map((flag) => (
					<DebugFlagToggle key={flag.name} flag={flag} />
				))}
			</AnnotatorUiMenuGroup>
		</AnnotatorUiMenuSubmenu>
	)
}

/** @public */
export interface ExampleDialogProps {
	title?: string
	body?: React.ReactNode
	cancel?: string
	confirm?: string
	displayDontShowAgain?: boolean
	maxWidth?: string
	onCancel(): void
	onContinue(): void
}

/** @public @react */
export function ExampleDialog({
	title = 'title',
	body = 'hello hello hello',
	cancel = 'Cancel',
	confirm = 'Continue',
	displayDontShowAgain = false,
	maxWidth = '350',
	onCancel,
	onContinue,
}: ExampleDialogProps) {
	const [dontShowAgain, setDontShowAgain] = React.useState(false)

	return (
		<>
			<AnnotatorUiDialogHeader>
				<AnnotatorUiDialogTitle>{title}</AnnotatorUiDialogTitle>
				<AnnotatorUiDialogCloseButton />
			</AnnotatorUiDialogHeader>
			<AnnotatorUiDialogBody style={{ maxWidth }}>{body}</AnnotatorUiDialogBody>
			<AnnotatorUiDialogFooter className="tlui-dialog__footer__actions">
				{displayDontShowAgain && (
					<AnnotatorUiButton
						type="normal"
						onClick={() => setDontShowAgain(!dontShowAgain)}
						style={{ marginRight: 'auto' }}
					>
						<AnnotatorUiButtonCheck checked={dontShowAgain} />
						<AnnotatorUiButtonLabel>Don’t show again</AnnotatorUiButtonLabel>
					</AnnotatorUiButton>
				)}
				<AnnotatorUiButton type="normal" onClick={onCancel}>
					<AnnotatorUiButtonLabel>{cancel}</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
				<AnnotatorUiButton type="primary" onClick={async () => onContinue()}>
					<AnnotatorUiButtonLabel>{confirm}</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
			</AnnotatorUiDialogFooter>
		</>
	)
}

const DebugFlagToggle = track(function DebugFlagToggle({
	flag,
	onChange,
}: {
	flag: DebugFlag<boolean>
	onChange?(newValue: boolean): void
}) {
	const value = flag.get()
	return (
		<AnnotatorUiMenuCheckboxItem
			id={flag.name}
			title={flag.name}
			label={flag.name
				.replace(/([a-z0-9])([A-Z])/g, (m) => `${m[0]} ${m[1].toLowerCase()}`)
				.replace(/^[a-z]/, (m) => m.toUpperCase())}
			checked={value}
			onSelect={() => {
				flag.set(!value)
				onChange?.(!value)
			}}
		/>
	)
})

let t = 0

function createNShapes(editor: Editor, n: number) {
	const gap = editor.options.adjacentShapeMargin
	const shapesToCreate: TLShapePartial[] = Array(n)
	const cols = Math.floor(Math.sqrt(n))

	for (let i = 0; i < n; i++) {
		t++
		shapesToCreate[i] = {
			id: createShapeId('box' + t),
			type: 'geo',
			x: (i % cols) * (100 + gap),
			y: Math.floor(i / cols) * (100 + gap),
		}
	}

	editor.run(() => {
		// allow this to trigger the max shapes alert
		editor.createShapes(shapesToCreate).setSelectedShapes(shapesToCreate.map((s) => s.id))
	})
}
