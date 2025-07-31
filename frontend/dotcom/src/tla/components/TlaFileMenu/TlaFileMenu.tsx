/* ---------------------- Menu ---------------------- */

import { FILE_PREFIX, TlaFile } from '@annotator/dotcom-shared'
import { Fragment, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ANNOTATOR_FILE_EXTENSION,
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuTrigger,
	AnnotatorUiMenuContextProvider,
	AnnotatorUiMenuGroup,
	AnnotatorUiMenuItem,
	AnnotatorUiMenuSubmenu,
	getIncrementedName,
	uniqueId,
	useDialogs,
	useMaybeEditor,
	useToasts,
} from 'annotator'
import { routes } from '../../../routeDefs'
import { AnnotatorApp } from '../../app/annotatorApp'
import { useApp } from '../../hooks/useAppState'
import { useCurrentFileId } from '../../hooks/useCurrentFileId'
import { useIsFileOwner } from '../../hooks/useIsFileOwner'
import { useIsFilePinned } from '../../hooks/useIsFilePinned'
import { useFileSidebarFocusContext } from '../../providers/FileInputFocusProvider'
import { TLAppUiEventSource, useAnnotatorAppUiEvents } from '../../utils/app-ui-events'
import { copyTextToClipboard } from '../../utils/copy'
import { defineMessages, useMsg } from '../../utils/i18n'
import { editorMessages } from '../TlaEditor/editor-messages'
import { download } from '../TlaEditor/useFileEditorOverrides'
import { TlaDeleteFileDialog } from '../dialogs/TlaDeleteFileDialog'

const messages = defineMessages({
	copied: { defaultMessage: 'Copied link' },
	copyLink: { defaultMessage: 'Copy link' },
	delete: { defaultMessage: 'Delete' },
	duplicate: { defaultMessage: 'Duplicate' },
	file: { defaultMessage: 'File' },
	forget: { defaultMessage: 'Forget' },
	rename: { defaultMessage: 'Rename' },
	copy: { defaultMessage: 'Copy' },
	pin: { defaultMessage: 'Pin' },
	unpin: { defaultMessage: 'Unpin' },
})

function getDuplicateName(file: TlaFile, app: AnnotatorApp) {
	if (file.name.trim().length === 0) {
		return ''
	}
	const currentFileName = app.getFileName(file.id)
	const allFileNames = app.getUserOwnFiles().map((file) => file.name)
	return getIncrementedName(currentFileName, allFileNames)
}

export function TlaFileMenu({
	children,
	source,
	fileId,
	onRenameAction,
	trigger,
}: {
	children?: ReactNode
	source: TLAppUiEventSource
	fileId: string
	onRenameAction(): void
	trigger: ReactNode
}) {
	return (
		<AnnotatorUiDropdownMenuRoot id={`file-menu-${fileId}-${source}`}>
			<AnnotatorUiMenuContextProvider type="menu" sourceId="dialog">
				<AnnotatorUiDropdownMenuTrigger>{trigger}</AnnotatorUiDropdownMenuTrigger>
				<AnnotatorUiDropdownMenuContent side="bottom" align="start" alignOffset={0} sideOffset={0}>
					<FileItemsWrapper showAsSubMenu={!!children}>
						<FileItems source={source} fileId={fileId} onRenameAction={onRenameAction} />
					</FileItemsWrapper>
					{children}
				</AnnotatorUiDropdownMenuContent>
			</AnnotatorUiMenuContextProvider>
		</AnnotatorUiDropdownMenuRoot>
	)
}

export function FileItems({
	source,
	fileId,
	onRenameAction,
}: {
	source: TLAppUiEventSource
	fileId: string
	onRenameAction(): void
}) {
	const app = useApp()
	const editor = useMaybeEditor()
	const { addDialog } = useDialogs()
	const navigate = useNavigate()
	const { addToast } = useToasts()
	const trackEvent = useAnnotatorAppUiEvents()
	const copiedMsg = useMsg(messages.copied)
	const isOwner = useIsFileOwner(fileId)
	const isPinned = useIsFilePinned(fileId)
	const isActive = useCurrentFileId() === fileId

	const handleCopyLinkClick = useCallback(() => {
		const url = routes.tlaFile(fileId, { asUrl: true })
		copyTextToClipboard(editor?.createDeepLink({ url }).toString() ?? url)
		addToast({
			id: 'copied-link',
			title: copiedMsg,
		})
		trackEvent('copy-file-link', { source })
	}, [fileId, addToast, copiedMsg, trackEvent, source, editor])

	const handlePinUnpinClick = useCallback(async () => {
		app.pinOrUnpinFile(fileId)
	}, [app, fileId])

	const focusCtx = useFileSidebarFocusContext()

	const handleDuplicateClick = useCallback(async () => {
		const newFileId = uniqueId()
		const file = app.getFile(fileId)
		if (!file) return
		trackEvent('duplicate-file', { source })
		const res = await app.createFile({
			id: newFileId,
			name: getDuplicateName(file, app),
			createSource: `${FILE_PREFIX}/${fileId}`,
		})
		// copy the state too
		const prevState = app.getFileState(fileId)
		app.createFileStateIfNotExists(newFileId)
		app.updateFileState(newFileId, {
			lastSessionState: prevState?.lastSessionState,
		})
		if (res.ok) {
			focusCtx.shouldRenameNextNewFile = true
			navigate(routes.tlaFile(newFileId))
		}
	}, [app, fileId, focusCtx, navigate, trackEvent, source])

	const handleDeleteClick = useCallback(() => {
		addDialog({
			component: ({ onClose }) => <TlaDeleteFileDialog fileId={fileId} onClose={onClose} />,
		})
	}, [fileId, addDialog])

	const untitledProject = useMsg(editorMessages.untitledProject)
	const handleDownloadClick = useCallback(async () => {
		if (!editor) return
		const defaultName =
			app.getFileName(fileId, false) ?? editor.getDocumentSettings().name ?? untitledProject
		trackEvent('download-file', { source })
		await download(editor, defaultName + ANNOTATOR_FILE_EXTENSION)
	}, [app, editor, fileId, source, trackEvent, untitledProject])

	const copyLinkMsg = useMsg(messages.copyLink)
	const renameMsg = useMsg(messages.rename)
	const duplicateMsg = useMsg(messages.duplicate)
	const pinMsg = useMsg(messages.pin)
	const unpinMsg = useMsg(messages.unpin)
	const deleteOrForgetMsg = useMsg(isOwner ? messages.delete : messages.forget)
	const downloadFile = useMsg(editorMessages.downloadFile)

	return (
		<Fragment>
			<AnnotatorUiMenuGroup id="file-actions">
				{/* todo: in published rooms, support copying link */}
				<AnnotatorUiMenuItem
					label={copyLinkMsg}
					id="copy-link"
					readonlyOk
					onSelect={handleCopyLinkClick}
				/>
				{isOwner && (
					<AnnotatorUiMenuItem label={renameMsg} id="rename" readonlyOk onSelect={onRenameAction} />
				)}
				{/* todo: in published rooms, support duplication / forking */}
				<AnnotatorUiMenuItem
					label={duplicateMsg}
					id="duplicate"
					readonlyOk
					onSelect={handleDuplicateClick}
				/>
				{!source.startsWith('sidebar') ||
					(isActive && (
						// TODO: make a /download/:fileId endpoint so we can download any file
						// from the sidebar, not just the active one
						<AnnotatorUiMenuItem
							label={downloadFile}
							id="download-file"
							readonlyOk
							onSelect={handleDownloadClick}
						/>
					))}
				<AnnotatorUiMenuItem
					label={isPinned ? unpinMsg : pinMsg}
					id="pin-unpin"
					readonlyOk
					onSelect={handlePinUnpinClick}
				/>
			</AnnotatorUiMenuGroup>
			<AnnotatorUiMenuGroup id="file-delete">
				<AnnotatorUiMenuItem
					label={deleteOrForgetMsg}
					id="delete"
					readonlyOk
					onSelect={handleDeleteClick}
				/>
			</AnnotatorUiMenuGroup>
		</Fragment>
	)
}

export function FileItemsWrapper({
	showAsSubMenu,
	children,
}: {
	showAsSubMenu: boolean
	children: ReactNode
}) {
	const fileSubmenuMsg = useMsg(messages.file)

	if (showAsSubMenu) {
		return (
			<AnnotatorUiMenuSubmenu id="file" label={fileSubmenuMsg}>
				{children}
			</AnnotatorUiMenuSubmenu>
		)
	}

	return children
}
