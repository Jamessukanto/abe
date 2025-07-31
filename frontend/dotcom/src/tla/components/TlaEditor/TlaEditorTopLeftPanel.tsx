import { SignInButton } from '@clerk/clerk-react'
import classNames from 'classnames'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
	DefaultPageMenu,
	EditSubmenu,
	ExportFileContentSubMenu,
	ExtrasGroup,
	PreferencesGroup,
	AnnotatorUiButton,
	AnnotatorUiButtonLabel,
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuTrigger,
	AnnotatorUiInput,
	AnnotatorUiMenuActionItem,
	AnnotatorUiMenuContextProvider,
	AnnotatorUiMenuGroup,
	ViewSubmenu,
	useEditor,
	usePassThroughWheelEvents,
	useValue,
} from 'annotator'
import { useApp, useMaybeApp } from '../../hooks/useAppState'
import { useCurrentFileId } from '../../hooks/useCurrentFileId'
import { useIsFileOwner } from '../../hooks/useIsFileOwner'
import { TLAppUiEventSource, useAnnotatorAppUiEvents } from '../../utils/app-ui-events'
import { getIsCoarsePointer } from '../../utils/getIsCoarsePointer'
import { defineMessages, useIntl, useMsg } from '../../utils/i18n'
import { TlaFileMenu } from '../TlaFileMenu/TlaFileMenu'
import { TlaIcon } from '../TlaIcon/TlaIcon'
import { TlaLogo } from '../TlaLogo/TlaLogo'
import { sidebarMessages } from '../TlaSidebar/components/TlaSidebarFileLink'
import {
	GiveUsFeedbackMenuItem,
	LegalSummaryMenuItem,
	UserManualMenuItem,
} from '../menu-items/menu-items'
import { useRoomInfo } from './TlaEditorTopRightPanel'
import styles from './top.module.css'

const messages = defineMessages({
	signIn: { defaultMessage: 'Sign in' },
	pageMenu: { defaultMessage: 'Page menu' },
	brand: { defaultMessage: 'annotator' },
	untitledProject: { defaultMessage: 'Untitled file' },
})

// There are some styles in tla.css that adjust the regular tlui top panels

export function TlaEditorTopLeftPanel({ isAnonUser }: { isAnonUser: boolean }) {
	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	return (
		<div ref={ref} className={classNames(styles.topLeftPanel)}>
			<div className={classNames(styles.topLeftPanelButtons)}>
				{isAnonUser ? <TlaEditorTopLeftPanelAnonymous /> : <TlaEditorTopLeftPanelSignedIn />}
			</div>
		</div>
	)
}

export function TlaEditorTopLeftPanelAnonymous() {
	const separator = '/'
	const pageMenuLbl = useMsg(messages.pageMenu)
	// GOTCHA: 'anonymous' doesn't always mean logged out
	// we show this version of the panel for published files as well.
	const app = useMaybeApp()

	const roomInfo = useRoomInfo()

	const canCopyToApp = app && roomInfo?.prefix

	const editor = useEditor()
	const anonFileName = useValue('fileName', () => editor.getDocumentSettings().name || undefined, [
		editor,
	])

	const hasPages = useValue('hasPages', () => editor.getPages().length > 1, [editor])

	// This is used in three places
	// - root, ie annotator.com
	// - being an anonymous guest on someone else's file
	// - being a logged out viewer of a published file

	return (
		<>
			<Link to="/" className={styles.topLeftOfflineLogo}>
				<TlaLogo data-testid="tla-sidebar-logo-icon" />
			</Link>
			{anonFileName && (
				<>
					<span
						className={styles.topLeftPanelSeparator}
						// undo nth-last-of-type rule in top.module.css
						style={{ marginRight: 0 }}
					>
						{separator}
					</span>
					<div className={classNames(styles.topLeftInputWrapper)}>
						<button className={styles.topLeftInputNameWidthSetter} data-testid="tla-file-name">
							{anonFileName.replace(/ /g, '\u00a0')}
						</button>
					</div>
				</>
			)}
			{hasPages && (
				<>
					<span className={styles.topLeftPanelSeparator}>{separator}</span>
					<DefaultPageMenu />
				</>
			)}
			<AnnotatorUiDropdownMenuRoot id={`file-menu-anon`}>
				<AnnotatorUiMenuContextProvider type="menu" sourceId="dialog">
					<AnnotatorUiDropdownMenuTrigger>
						<button
							className={styles.topLeftMainMenuTrigger}
							title={pageMenuLbl}
							data-testid="tla-main-menu"
						>
							<TlaIcon icon="dots-vertical-strong" />
						</button>
					</AnnotatorUiDropdownMenuTrigger>
					<AnnotatorUiDropdownMenuContent side="bottom" align="start" alignOffset={0} sideOffset={0}>
						<AnnotatorUiMenuGroup id="basic">
							<EditSubmenu />
							<ViewSubmenu />
							<ExportFileContentSubMenu />
							<ExtrasGroup />
							<AnnotatorUiMenuActionItem actionId={'save-file-copy'} />
							{canCopyToApp && <AnnotatorUiMenuActionItem actionId={'copy-to-my-files'} />}
						</AnnotatorUiMenuGroup>
						<PreferencesGroup />
						<AnnotatorUiMenuGroup id="misc">
							<UserManualMenuItem />
							<GiveUsFeedbackMenuItem />
							<LegalSummaryMenuItem />
						</AnnotatorUiMenuGroup>
						{!app && (
							<AnnotatorUiMenuGroup id="signin">
								<SignInMenuItem />
							</AnnotatorUiMenuGroup>
						)}
					</AnnotatorUiDropdownMenuContent>
				</AnnotatorUiMenuContextProvider>
			</AnnotatorUiDropdownMenuRoot>
		</>
	)
}

export function TlaEditorTopLeftPanelSignedIn() {
	const editor = useEditor()
	const intl = useIntl()
	const [isRenaming, setIsRenaming] = useState(false)
	const pageMenuLbl = useMsg(messages.pageMenu)

	const isEmbed = !!new URLSearchParams(window.location.search).get('embed')

	const fileSlug = useParams<{ fileSlug: string }>().fileSlug ?? '_not_a_file_' // fall back to a string that will not match any file
	const isOwner = useIsFileOwner(fileSlug)

	const app = useApp()
	const fileId = useCurrentFileId()!
	const fileName = useValue(
		'fileName',
		// TODO(david): This is a temporary fix for allowing guests to see the file name.
		// We update the name in the document record on it's DO when the file record changes.
		// We should figure out a way to have a single source of truth for the file name.
		// And to allow guests to 'subscribe' to file metadata updates somehow.
		() => {
			// we need that backup file name for empty file names (the initial value for the name is empty)
			return (
				app.getFileName(fileId, false)?.trim() ||
				editor.getDocumentSettings().name ||
				// rather than displaying the date for the project here, display Untitled project
				intl.formatMessage(messages.untitledProject)
			)
		},
		[app, editor, fileId, intl]
	)
	const handleFileNameChange = useCallback(
		(name: string) => {
			if (isOwner) {
				setIsRenaming(false)
				// only actually update the name if name is a value, otherwise keep the previous name
				if (name) {
					// don't allow guests to update the file name
					app.updateFile(fileId, { name })
					editor.updateDocumentSettings({ name })
				}
			}
		},
		[app, editor, fileId, isOwner]
	)

	const handleRenameAction = () => {
		if (getIsCoarsePointer()) {
			const newName = prompt(intl.formatMessage(sidebarMessages.renameFile), fileName)?.trim()
			if (newName) {
				app.updateFile(fileId, { name: newName })
			}
		} else {
			setIsRenaming(true)
		}
	}
	const handleRenameEnd = () => setIsRenaming(false)

	const separator = '/'
	return (
		<>
			{/* spacer for the sidebar toggle button */}
			{isEmbed ? null : <div style={{ width: 40, flexShrink: 0 }} />}
			<TlaFileNameEditor
				source="file-header"
				isRenaming={isRenaming}
				fileName={fileName}
				onChange={isOwner ? handleFileNameChange : undefined}
				onEnd={handleRenameEnd}
			/>
			<span className={styles.topLeftPanelSeparator}>{separator}</span>
			<DefaultPageMenu />
			<TlaFileMenu
				fileId={fileId}
				source="file-header"
				onRenameAction={handleRenameAction}
				trigger={
					<button
						className={styles.topLeftMainMenuTrigger}
						title={pageMenuLbl}
						data-testid="tla-main-menu"
					>
						<TlaIcon icon="dots-vertical-strong" />
					</button>
				}
			>
				<AnnotatorUiMenuGroup id="regular-stuff">
					<EditSubmenu />
					<ViewSubmenu />
					<ExportFileContentSubMenu />
					<ExtrasGroup />
					<AnnotatorUiMenuActionItem actionId={'save-file-copy'} />
				</AnnotatorUiMenuGroup>
				<AnnotatorUiMenuGroup id="preferences">
					<PreferencesGroup />
				</AnnotatorUiMenuGroup>
			</TlaFileMenu>
		</>
	)
}

function TlaFileNameEditor({
	fileName,
	onChange,
	onEnd,
	isRenaming,
	source,
}: {
	fileName: string
	onChange?(name: string): void
	onEnd?(): void
	isRenaming?: boolean
	source: TLAppUiEventSource
}) {
	const [isEditing, setIsEditing] = useState(false)
	const trackEvent = useAnnotatorAppUiEvents()

	const intl = useIntl()
	const handleEditingStart = useCallback(() => {
		if (!onChange) return
		if (getIsCoarsePointer()) {
			const newName = prompt(intl.formatMessage(sidebarMessages.renameFile), fileName)?.trim()
			if (newName) {
				onChange(newName)
			}
		} else {
			setIsEditing(true)
		}
	}, [fileName, intl, onChange])

	const handleEditingEnd = useCallback(() => {
		if (!onChange) return
		setIsEditing(false)
		onEnd?.()
	}, [onChange, onEnd])

	const handleEditingComplete = useCallback(
		(name: string) => {
			if (!onChange) return
			setIsEditing(false)
			onChange(name)
			onEnd?.()
			trackEvent('rename-file', { name, source })
		},
		[onChange, onEnd, trackEvent, source]
	)

	useEffect(() => {
		if (isRenaming && !isEditing) {
			// Wait a tick, otherwise the blur event immediately exits the input.
			setTimeout(() => setIsEditing(true), 0)
		}
	}, [isRenaming, isEditing])

	return (
		<div
			className={classNames(
				styles.topLeftInputWrapper,
				onChange && styles.topLeftInputWrapperEditable
			)}
		>
			{isEditing ? (
				<TlaFileNameEditorInput
					fileName={fileName}
					onComplete={handleEditingComplete}
					onBlur={handleEditingEnd}
				/>
			) : (
				<button
					className={styles.topLeftInputNameWidthSetter}
					onClick={onChange ? handleEditingStart : undefined}
					data-testid="tla-file-name"
				>
					{fileName.replace(/ /g, '\u00a0')}
				</button>
			)}
		</div>
	)
}

function TlaFileNameEditorInput({
	fileName,
	onComplete,
	onBlur,
}: {
	fileName: string
	onComplete(name: string): void
	onBlur(): void
}) {
	const rTemporaryName = useRef<string>(fileName)
	const [temporaryFileName, setTemporaryFileName] = useState(fileName)

	const handleCancel = useCallback(() => {
		// restore original filename from file
		setTemporaryFileName(fileName)
		rTemporaryName.current = fileName
		onBlur()
	}, [onBlur, fileName])

	const handleBlur = useCallback(() => {
		// dispatch the new filename via onComplete
		const newFileName = rTemporaryName.current.replace(/\s+/g, ' ').trim()
		if (newFileName === fileName) return handleCancel()
		setTemporaryFileName(newFileName)
		rTemporaryName.current = newFileName
		onComplete(newFileName)
		onBlur()
	}, [onBlur, onComplete, fileName, handleCancel])

	const handleValueChange = useCallback((value: string) => {
		setTemporaryFileName(value)
		rTemporaryName.current = value
	}, [])

	return (
		<>
			<AnnotatorUiInput
				value={temporaryFileName}
				onValueChange={handleValueChange}
				onCancel={handleCancel}
				onBlur={handleBlur}
				autoSelect
				autoFocus
			/>
			<div className={styles.topLeftInputNameWidthSetter}>
				{temporaryFileName.replace(/ /g, '\u00a0')}
			</div>
		</>
	)
}

function SignInMenuItem() {
	const msg = useMsg(messages.signIn)
	return (
		<SignInButton
			mode="modal"
			forceRedirectUrl={location.pathname + location.search}
			signUpForceRedirectUrl={location.pathname + location.search}
		>
			<AnnotatorUiButton type="menu" data-testid="tla-sign-in-menu-button">
				<AnnotatorUiButtonLabel>{msg}</AnnotatorUiButtonLabel>
				<TlaIcon icon="sign-in" />
			</AnnotatorUiButton>
		</SignInButton>
	)
}
