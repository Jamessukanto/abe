/// <reference types="react" />

import { registerAnnotatorLibraryVersion } from '@annotator/editor'
export {
	PathBuilder,
	PathBuilderGeometry2d,
	type BasePathBuilderOpts,
	type CubicBezierToPathBuilderCommand,
	type DashedPathBuilderOpts,
	type DrawPathBuilderDOpts,
	type DrawPathBuilderOpts,
	type LineToPathBuilderCommand,
	type MoveToPathBuilderCommand,
	type PathBuilderCommand,
	type PathBuilderCommandBase,
	type PathBuilderCommandInfo,
	type PathBuilderCommandOpts,
	type PathBuilderLineOpts,
	type PathBuilderOpts,
	type PathBuilderToDOpts,
	type SolidPathBuilderOpts,
} from './lib/shapes/shared/PathBuilder'
export { usePrefersReducedMotion } from './lib/shapes/shared/usePrefersReducedMotion'
export { DefaultA11yAnnouncer, useSelectedShapesAnnouncer } from './lib/ui/components/A11y'
export { ColorSchemeMenu } from './lib/ui/components/ColorSchemeMenu'
export { DefaultDialogs } from './lib/ui/components/Dialogs'
export {
	AnnotatorUiMenuActionCheckboxItem,
	type TLUiMenuActionCheckboxItemProps,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuActionCheckboxItem'
export {
	AnnotatorUiMenuActionItem,
	type TLUiMenuActionItemProps,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuActionItem'
export {
	AnnotatorUiMenuToolItem,
	type TLUiMenuToolItemProps,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuToolItem'
export { DefaultToasts } from './lib/ui/components/Toasts'
export { AnnotatorUiTranslationProvider } from './lib/ui/hooks/useTranslation/useTranslation'
// eslint-disable-next-line local/no-export-star
export * from '@annotator/editor'
export { BookmarkShapeUtil } from './lib/shapes/bookmark/BookmarkShapeUtil'
export { DrawShapeTool } from './lib/shapes/draw/DrawShapeTool'
export { DrawShapeUtil, type DrawShapeOptions } from './lib/shapes/draw/DrawShapeUtil'

export { GeoShapeTool } from './lib/shapes/geo/GeoShapeTool'
export { GeoShapeUtil } from './lib/shapes/geo/GeoShapeUtil'

export { defaultShapeUtils } from './lib/defaultShapeUtils'
export { defaultShapeTools } from './lib/defaultShapeTools'
export { defaultBindingUtils } from './lib/defaultBindingUtils'

export { HighlightShapeTool } from './lib/shapes/highlight/HighlightShapeTool'
export {
	HighlightShapeUtil,
	type HighlightShapeOptions,
} from './lib/shapes/highlight/HighlightShapeUtil'
export { ImageShapeUtil } from './lib/shapes/image/ImageShapeUtil'
export { LineShapeTool } from './lib/shapes/line/LineShapeTool'
export { LineShapeUtil } from './lib/shapes/line/LineShapeUtil'
export { NoteShapeTool } from './lib/shapes/note/NoteShapeTool'
export { NoteShapeUtil, type NoteShapeOptions } from './lib/shapes/note/NoteShapeUtil'
export {
	ASPECT_RATIO_OPTIONS,
	ASPECT_RATIO_TO_VALUE,
	getCropBox,
	getDefaultCrop,
	getUncroppedSize,
	type ASPECT_RATIO_OPTION,
	type CropBoxOptions,
} from './lib/shapes/shared/crop'
export {
	FONT_FAMILIES,
	FONT_SIZES,
	LABEL_FONT_SIZES,
	STROKE_SIZES,
	TEXT_PROPS,
} from './lib/shapes/shared/default-shape-constants'
export {
	allDefaultFontFaces,
	DefaultFontFaces,
	type TLDefaultFont,
	type TLDefaultFonts,
} from './lib/shapes/shared/defaultFonts'
export {
	PlainTextLabel,
	TextLabel,
	type PlainTextLabelProps,
} from './lib/shapes/shared/PlainTextLabel'
export {
	RichTextLabel,
	RichTextSVG,
	type RichTextLabelProps,
	type RichTextSVGProps,
} from './lib/shapes/shared/RichTextLabel'
export { useDefaultColorTheme } from './lib/shapes/shared/useDefaultColorTheme'
export { useEditablePlainText, useEditableText } from './lib/shapes/shared/useEditablePlainText'
export { useEditableRichText } from './lib/shapes/shared/useEditableRichText'
export {
	useAsset,
	useImageOrVideoAsset,
	type UseImageOrVideoAssetOptions,
} from './lib/shapes/shared/useImageOrVideoAsset'
export { PlainTextArea } from './lib/shapes/text/PlainTextArea'
export { RichTextArea, type TextAreaProps } from './lib/shapes/text/RichTextArea'
export { TextShapeTool } from './lib/shapes/text/TextShapeTool'
export { TextShapeUtil } from './lib/shapes/text/TextShapeUtil'
export { VideoShapeUtil, type VideoShapeOptions } from './lib/shapes/video/VideoShapeUtil'
export { type StyleValuesForUi } from './lib/styles'
export { Annotator, type TLComponents, type AnnotatorBaseProps, type AnnotatorProps } from './lib/Annotator'
export { AnnotatorImage, type AnnotatorImageProps } from './lib/AnnotatorImage'
export { EraserTool } from './lib/tools/EraserTool/EraserTool'
export { HandTool } from './lib/tools/HandTool/HandTool'
export { LaserTool } from './lib/tools/LaserTool/LaserTool'
export { SelectTool } from './lib/tools/SelectTool/SelectTool'
export { ZoomTool } from './lib/tools/ZoomTool/ZoomTool'
export {
	setDefaultUiAssetUrls,
	type TLUiAssetUrlOverrides,
	type TLUiAssetUrls,
} from './lib/ui/assetUrls'
export {
	DefaultActionsMenu,
	type TLUiActionsMenuProps,
} from './lib/ui/components/ActionsMenu/DefaultActionsMenu'
export {
	AlignMenuItems,
	DefaultActionsMenuContent,
	DistributeMenuItems,
	GroupOrUngroupMenuItem,
	ReorderMenuItems,
	RotateCWMenuItem,
	StackMenuItems,
	ZoomOrRotateMenuItem,
} from './lib/ui/components/ActionsMenu/DefaultActionsMenuContent'
export {
	DefaultContextMenu as ContextMenu,
	DefaultContextMenu,
	type TLUiContextMenuProps,
} from './lib/ui/components/ContextMenu/DefaultContextMenu'
export { DefaultContextMenuContent } from './lib/ui/components/ContextMenu/DefaultContextMenuContent'
export {
	DefaultDebugMenu,
	type TLUiDebugMenuProps,
} from './lib/ui/components/DebugMenu/DefaultDebugMenu'
export {
	DebugFlags,
	DefaultDebugMenuContent,
	ExampleDialog,
	FeatureFlags,
	type ExampleDialogProps,
} from './lib/ui/components/DebugMenu/DefaultDebugMenuContent'
export { DefaultMenuPanel } from './lib/ui/components/DefaultMenuPanel'
export {
	DefaultHelperButtons,
	type TLUiHelperButtonsProps,
} from './lib/ui/components/HelperButtons/DefaultHelperButtons'
export { DefaultHelperButtonsContent } from './lib/ui/components/HelperButtons/DefaultHelperButtonsContent'
export {
	DefaultHelpMenu,
	type TLUiHelpMenuProps,
} from './lib/ui/components/HelpMenu/DefaultHelpMenu'
export {
	DefaultHelpMenuContent,
	KeyboardShortcutsMenuItem,
} from './lib/ui/components/HelpMenu/DefaultHelpMenuContent'
export {
	DefaultKeyboardShortcutsDialog,
	type TLUiKeyboardShortcutsDialogProps,
} from './lib/ui/components/KeyboardShortcutsDialog/DefaultKeyboardShortcutsDialog'
export { DefaultKeyboardShortcutsDialogContent } from './lib/ui/components/KeyboardShortcutsDialog/DefaultKeyboardShortcutsDialogContent'
export { LanguageMenu } from './lib/ui/components/LanguageMenu'
export {
	DefaultMainMenu,
	type TLUiMainMenuProps,
} from './lib/ui/components/MainMenu/DefaultMainMenu'
export {
	DefaultMainMenuContent,
	EditSubmenu,
	ExportFileContentSubMenu,
	ExtrasGroup,
	MiscMenuGroup,
	PreferencesGroup,
	UndoRedoGroup,
	ViewSubmenu,
} from './lib/ui/components/MainMenu/DefaultMainMenuContent'
export {
	ArrangeMenuSubmenu,
	ClipboardMenuGroup,
	ConversionsMenuGroup,
	ConvertToBookmarkMenuItem,

	CopyAsMenuGroup,
	CopyMenuItem,
	CursorChatItem,
	CutMenuItem,
	DeleteMenuItem,
	DuplicateMenuItem,
	EditLinkMenuItem,
	EditMenuSubmenu,
	GroupMenuItem,
	MoveToPageMenu,
	PasteMenuItem,
	PrintItem,
	ReorderMenuSubmenu,
	SelectAllMenuItem,
	ToggleAutoSizeMenuItem,
	ToggleDebugModeItem,
	ToggleDynamicSizeModeItem,
	ToggleEdgeScrollingItem,
	ToggleFocusModeItem,
	ToggleGridItem,
	ToggleKeyboardShortcutsItem,
	ToggleLockMenuItem,
	TogglePasteAtCursorItem,
	ToggleReduceMotionItem,
	ToggleSnapModeItem,
	ToggleToolLockItem,
	ToggleTransparentBgMenuItem,
	ToggleWrapModeItem,
	UngroupMenuItem,
	UnlockAllMenuItem,
	ZoomTo100MenuItem,
	ZoomToFitMenuItem,
	ZoomToSelectionMenuItem,
} from './lib/ui/components/menu-items'
export { DefaultMinimap } from './lib/ui/components/Minimap/DefaultMinimap'
export { MobileStylePanel } from './lib/ui/components/MobileStylePanel'
export { DefaultNavigationPanel } from './lib/ui/components/NavigationPanel/DefaultNavigationPanel'
export { OfflineIndicator } from './lib/ui/components/OfflineIndicator/OfflineIndicator'
export { DefaultPageMenu } from './lib/ui/components/PageMenu/DefaultPageMenu'
export { PageItemInput, type PageItemInputProps } from './lib/ui/components/PageMenu/PageItemInput'
export {
	PageItemSubmenu,
	type PageItemSubmenuProps,
} from './lib/ui/components/PageMenu/PageItemSubmenu'
export {
	AnnotatorUiButton,
	type TLUiButtonProps,
} from './lib/ui/components/primitives/Button/AnnotatorUiButton'
export {
	AnnotatorUiButtonCheck,
	type TLUiButtonCheckProps,
} from './lib/ui/components/primitives/Button/AnnotatorUiButtonCheck'
export {
	AnnotatorUiButtonIcon,
	type TLUiButtonIconProps,
} from './lib/ui/components/primitives/Button/AnnotatorUiButtonIcon'
export {
	AnnotatorUiButtonLabel,
	type TLUiButtonLabelProps,
} from './lib/ui/components/primitives/Button/AnnotatorUiButtonLabel'
export {
	AnnotatorUiMenuCheckboxItem,
	type TLUiMenuCheckboxItemProps,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuCheckboxItem'
export {
	AnnotatorUiMenuContextProvider,
	type TLUiMenuContextProviderProps,
	type TLUiMenuContextType,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuContext'
export {
	AnnotatorUiMenuGroup,
	type TLUiMenuGroupProps,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuGroup'
export {
	AnnotatorUiMenuItem,
	type TLUiMenuItemProps,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuItem'
export {
	AnnotatorUiMenuSubmenu,
	type TLUiMenuSubmenuProps,
} from './lib/ui/components/primitives/menus/AnnotatorUiMenuSubmenu'
export {
	AnnotatorUiButtonPicker,
	type TLUiButtonPickerProps,
} from './lib/ui/components/primitives/AnnotatorUiButtonPicker'
export {
	AnnotatorUiContextualToolbar,
	type TLUiContextualToolbarProps,
} from './lib/ui/components/primitives/AnnotatorUiContextualToolbar'
export {
	AnnotatorUiDialogBody,
	AnnotatorUiDialogCloseButton,
	AnnotatorUiDialogFooter,
	AnnotatorUiDialogHeader,
	AnnotatorUiDialogTitle,
	type TLUiDialogBodyProps,
	type TLUiDialogFooterProps,
	type TLUiDialogHeaderProps,
	type TLUiDialogTitleProps,
} from './lib/ui/components/primitives/AnnotatorUiDialog'
export {
	AnnotatorUiDropdownMenuCheckboxItem,
	AnnotatorUiDropdownMenuContent,
	AnnotatorUiDropdownMenuGroup,
	AnnotatorUiDropdownMenuIndicator,
	AnnotatorUiDropdownMenuItem,
	AnnotatorUiDropdownMenuRoot,
	AnnotatorUiDropdownMenuSub,
	AnnotatorUiDropdownMenuSubTrigger,
	AnnotatorUiDropdownMenuTrigger,
	type TLUiDropdownMenuCheckboxItemProps,
	type TLUiDropdownMenuContentProps,
	type TLUiDropdownMenuGroupProps,
	type TLUiDropdownMenuItemProps,
	type TLUiDropdownMenuRootProps,
	type TLUiDropdownMenuSubProps,
	type TLUiDropdownMenuSubTriggerProps,
	type TLUiDropdownMenuTriggerProps,
} from './lib/ui/components/primitives/AnnotatorUiDropdownMenu'
export {
	AnnotatorUiIcon,
	type TLUiIconJsx,
	type TLUiIconProps,
} from './lib/ui/components/primitives/AnnotatorUiIcon'
export { AnnotatorUiInput, type TLUiInputProps } from './lib/ui/components/primitives/AnnotatorUiInput'
export { AnnotatorUiKbd, type TLUiKbdProps } from './lib/ui/components/primitives/AnnotatorUiKbd'
export {
	AnnotatorUiPopover,
	AnnotatorUiPopoverContent,
	AnnotatorUiPopoverTrigger,
	type TLUiPopoverContentProps,
	type TLUiPopoverProps,
	type TLUiPopoverTriggerProps,
} from './lib/ui/components/primitives/AnnotatorUiPopover'
export { AnnotatorUiSlider, type TLUiSliderProps } from './lib/ui/components/primitives/AnnotatorUiSlider'
export {
	AnnotatorUiToolbar,
	AnnotatorUiToolbarButton,
	AnnotatorUiToolbarToggleGroup,
	AnnotatorUiToolbarToggleItem,
	type TLUiToolbarButtonProps,
	type TLUiToolbarProps,
	type TLUiToolbarToggleGroupProps,
	type TLUiToolbarToggleItemProps,
} from './lib/ui/components/primitives/AnnotatorUiToolbar'
export {
	DefaultQuickActions,
	type TLUiQuickActionsProps,
} from './lib/ui/components/QuickActions/DefaultQuickActions'
export { DefaultQuickActionsContent } from './lib/ui/components/QuickActions/DefaultQuickActionsContent'
export { DefaultSharePanel } from './lib/ui/components/SharePanel/DefaultSharePanel'
export { PeopleMenu, type PeopleMenuProps } from './lib/ui/components/SharePanel/PeopleMenu'
export { Spinner } from './lib/ui/components/Spinner'
export {
	DefaultStylePanel,
	type TLUiStylePanelProps,
} from './lib/ui/components/StylePanel/DefaultStylePanel'
export {
	CommonStylePickerSet,
	DefaultStylePanelContent,
	GeoStylePickerSet,
	OpacitySlider,
	TextStylePickerSet,
	type StylePickerSetProps,
	type ThemeStylePickerSetProps,
	type TLUiStylePanelContentProps,
} from './lib/ui/components/StylePanel/DefaultStylePanelContent'
export {
	DefaultImageToolbar,
	type TLUiImageToolbarProps,
} from './lib/ui/components/Toolbar/DefaultImageToolbar'
export {
	DefaultImageToolbarContent,
	type DefaultImageToolbarContentProps,
} from './lib/ui/components/Toolbar/DefaultImageToolbarContent'
export {
	DefaultRichTextToolbar,
	type TLUiRichTextToolbarProps,
} from './lib/ui/components/Toolbar/DefaultRichTextToolbar'
export {
	DefaultRichTextToolbarContent,
	type DefaultRichTextToolbarContentProps,
} from './lib/ui/components/Toolbar/DefaultRichTextToolbarContent'
export {
	DefaultToolbar,
	type DefaultToolbarProps,
} from './lib/ui/components/Toolbar/DefaultToolbar'
export {
	DefaultToolbarContent,
	DrawToolbarItem,
	EllipseToolbarItem,
	EraserToolbarItem,
	HandToolbarItem,
	LaserToolbarItem,
	LineToolbarItem,
	NoteToolbarItem,
	RectangleToolbarItem,
	SelectToolbarItem,
	ToolbarItem,
	useIsToolSelected,
	type ToolbarItemProps,
} from './lib/ui/components/Toolbar/DefaultToolbarContent'
export {
	DefaultVideoToolbar,
	type TLUiVideoToolbarProps,
} from './lib/ui/components/Toolbar/DefaultVideoToolbar'
export {
	DefaultVideoToolbarContent,
	type DefaultVideoToolbarContentProps,
} from './lib/ui/components/Toolbar/DefaultVideoToolbarContent'
export {
	OverflowingToolbar,
	type OverflowingToolbarProps,
} from './lib/ui/components/Toolbar/OverflowingToolbar'
export {
	CenteredTopPanelContainer,
	type CenteredTopPanelContainerProps,
} from './lib/ui/components/TopPanel/CenteredTopPanelContainer'
export { DefaultTopPanel } from './lib/ui/components/TopPanel/DefaultTopPanel'
export {
	DefaultZoomMenu,
	type TLUiZoomMenuProps,
} from './lib/ui/components/ZoomMenu/DefaultZoomMenu'
export { DefaultZoomMenuContent } from './lib/ui/components/ZoomMenu/DefaultZoomMenuContent'
export { PORTRAIT_BREAKPOINT } from './lib/ui/constants'
export {
	AnnotatorUiA11yProvider,
	useA11y,
	type A11yPriority,
	type A11yProviderProps,
	type TLUiA11y,
	type TLUiA11yContextType,
} from './lib/ui/context/a11y'
export {
	unwrapLabel,
	useActions,
	type ActionsProviderProps,
	type TLUiActionItem,
	type TLUiActionsContextType,
} from './lib/ui/context/actions'
export { AssetUrlsProvider, useAssetUrls } from './lib/ui/context/asset-urls'
export {
	BreakPointProvider,
	useBreakpoint,
	type BreakPointProviderProps,
} from './lib/ui/context/breakpoints'
export {
	AnnotatorUiComponentsProvider,
	useAnnotatorUiComponents,
	type TLUiComponents,
	type TLUiComponentsProviderProps,
} from './lib/ui/context/components'
export {
	AnnotatorUiDialogsProvider,
	useDialogs,
	type TLUiDialog,
	type TLUiDialogProps,
	type TLUiDialogsContextType,
	type TLUiDialogsProviderProps,
} from './lib/ui/context/dialogs'
export {
	AnnotatorUiEventsProvider,
	useUiEvents,
	type EventsProviderProps,
	type TLUiEventContextType,
	type TLUiEventData,
	type TLUiEventHandler,
	type TLUiEventMap,
	type TLUiEventSource,
} from './lib/ui/context/events'
export {
	AnnotatorUiContextProvider,
	type TLUiContextProviderProps,
} from './lib/ui/context/AnnotatorUiContextProvider'
export {
	AnnotatorUiToastsProvider,
	useToasts,
	type AlertSeverity,
	type TLUiToast,
	type TLUiToastAction,
	type TLUiToastsContextType,
	type TLUiToastsProviderProps,
} from './lib/ui/context/toasts'
export { useCanRedo, useCanUndo } from './lib/ui/hooks/menu-hooks'
export { useMenuClipboardEvents, useNativeClipboardEvents } from './lib/ui/hooks/useClipboardEvents'
export {
	useCollaborationStatus,
	useShowCollaborationUi,
} from './lib/ui/hooks/useCollaborationStatus'
export { useCopyAs } from './lib/ui/hooks/useCopyAs'
export { useExportAs } from './lib/ui/hooks/useExportAs'
export { useKeyboardShortcuts } from './lib/ui/hooks/useKeyboardShortcuts'
export { useLocalStorageState } from './lib/ui/hooks/useLocalStorageState'
export { useMenuIsOpen } from './lib/ui/hooks/useMenuIsOpen'
export { useReadonly } from './lib/ui/hooks/useReadonly'
export { useRelevantStyles } from './lib/ui/hooks/useRelevantStyles'
export {
	useTools,
	type TLUiToolItem,
	type TLUiToolsContextType,
	type TLUiToolsProviderProps,
} from './lib/ui/hooks/useTools'
export { type TLUiTranslationKey } from './lib/ui/hooks/useTranslation/TLUiTranslationKey'
export { type TLUiTranslation } from './lib/ui/hooks/useTranslation/translations'
export {
	useCurrentTranslation,
	useTranslation,
	type TLUiTranslationContextType,
	type TLUiTranslationProviderProps,
} from './lib/ui/hooks/useTranslation/useTranslation'
export { type TLUiIconType } from './lib/ui/icon-types'
export { useDefaultHelpers, type TLUiOverrideHelpers, type TLUiOverrides } from './lib/ui/overrides'
export { AnnotatorUi, type AnnotatorUiProps } from './lib/ui/AnnotatorUi'
export { containBoxSize, downsizeImage, type BoxWidthHeight } from './lib/utils/assets/assets'
export { preloadFont, type TLTypeFace } from './lib/utils/assets/preload-font'

export { putExcalidrawContent } from './lib/utils/excalidraw/putExcalidrawContent'
export { copyAs, type CopyAsOptions, type TLCopyType } from './lib/utils/export/copyAs'
export { exportToBlob } from './lib/utils/export/export'
export { downloadFile, exportAs, type ExportAsOptions } from './lib/utils/export/exportAs'

export {
	defaultEditorAssetUrls,
	setDefaultEditorAssetUrls,
	type TLEditorAssetUrls,
} from './lib/utils/static-assets/assetUrls'
export {
	defaultAddFontsFromNode,
	KeyboardShiftEnterTweakExtension,
	renderHtmlFromRichText,
	renderHtmlFromRichTextForMeasurement,
	renderPlaintextFromRichText,
	renderRichTextFromHTML,
	tipTapDefaultExtensions,
} from './lib/utils/text/richText'
export { truncateStringWithEllipsis } from './lib/utils/text/text'
export { TextDirection } from './lib/utils/text/textDirection'
export {
	buildFromV1Document,
	TLV1AlignStyle,
	TLV1AssetType,
	TLV1ColorStyle,
	TLV1DashStyle,
	TLV1FontStyle,
	TLV1ShapeType,
	TLV1SizeStyle,

	type TLV1Asset,
	type TLV1BaseAsset,
	type TLV1BaseBinding,
	type TLV1BaseShape,
	type TLV1Binding,
	type TLV1Bounds,
	type TLV1Document,
	type TLV1DrawShape,
	type TLV1EllipseShape,
	type TLV1GroupShape,
	type TLV1Handle,
	type TLV1ImageAsset,
	type TLV1ImageShape,
	type TLV1Page,
	type TLV1PageState,
	type TLV1RectangleShape,
	type TLV1Shape,
	type TLV1ShapeStyles,
	type TLV1StickyShape,
	type TLV1TextShape,
	type TLV1TriangleShape,
	type TLV1VideoAsset,
	type TLV1VideoShape,
} from './lib/utils/tldr/buildFromV1Document'
export {
	parseAndLoadDocument,
	parseAnnotatorJsonFile,
	serializeAnnotatorJson,
	serializeAnnotatorJsonBlob,
	ANNOTATOR_FILE_EXTENSION,
	type AnnotatorFile,
	type AnnotatorFileParseError,
} from './lib/utils/tldr/file'

registerAnnotatorLibraryVersion(
	(globalThis as any).ANNOTATOR_LIBRARY_NAME,
	(globalThis as any).ANNOTATOR_LIBRARY_VERSION,
	(globalThis as any).ANNOTATOR_LIBRARY_MODULES
)
