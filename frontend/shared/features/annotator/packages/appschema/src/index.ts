import { registerAnnotatorLibraryVersion } from '@annotator/utils'
export { assetIdValidator, createAssetValidator, type TLBaseAsset } from './assets/TLBaseAsset'
export { type TLBookmarkAsset } from './assets/TLBookmarkAsset'
export { type TLImageAsset } from './assets/TLImageAsset'
export { type TLVideoAsset } from './assets/TLVideoAsset'
export {
	bindingIdValidator,
	createBindingValidator,
	type TLBaseBinding,
} from './bindings/TLBaseBinding'
export {
	createPresenceStateDerivation,
	getDefaultUserPresence,
	type TLPresenceStateInfo,
	type TLPresenceUserInfo,
} from './createPresenceStateDerivation'
export {
	createTLSchema,
	defaultBindingSchemas,
	defaultShapeSchemas,
	type SchemaPropsInfo,
	type TLSchema,
} from './createTLSchema'
export {
	boxModelValidator,
	vecModelValidator,
	type BoxModel,
	type VecModel,
} from './misc/geometry-types'
export { idValidator } from './misc/id-validator'
export {
	canvasUiColorTypeValidator,
	TL_CANVAS_UI_COLOR_TYPES,
	type TLCanvasUiColor,
} from './misc/TLColor'
export { TL_CURSOR_TYPES, type TLCursor, type TLCursorType } from './misc/TLCursor'
export { TL_HANDLE_TYPES, type TLHandle, type TLHandleType } from './misc/TLHandle'

export { richTextValidator, toRichText, type TLRichText } from './misc/TLRichText'
export { scribbleValidator, TL_SCRIBBLE_STATES, type TLScribble } from './misc/TLScribble'
export {
	assetMigrations,
	AssetRecordType,
	assetValidator,
	type TLAsset,
	type TLAssetId,
	type TLAssetPartial,
	type TLAssetShape,
} from './records/TLAsset'
export {
	createBindingId,
	createBindingPropsMigrationIds,
	createBindingPropsMigrationSequence,
	isBinding,
	isBindingId,
	rootBindingMigrations,
	type TLBinding,
	type TLBindingCreate,
	type TLBindingId,
	type TLBindingUpdate,
	type TLDefaultBinding,
	type TLUnknownBinding,
} from './records/TLBinding'
export { CameraRecordType, type TLCamera, type TLCameraId } from './records/TLCamera'
export {
	DocumentRecordType,
	isDocument,
	TLDOCUMENT_ID,
	type TLDocument,
} from './records/TLDocument'
export {
	pluckPreservingValues,
	TLINSTANCE_ID,
	type TLInstance,
	type TLInstanceId,
} from './records/TLInstance'
export {
	isPageId,
	pageIdValidator,
	PageRecordType,
	type TLPage,
	type TLPageId,
} from './records/TLPage'
export {
	InstancePageStateRecordType,
	type TLInstancePageState,
	type TLInstancePageStateId,
} from './records/TLPageState'
export {
	PointerRecordType,
	TLPOINTER_ID,
	type TLPointer,
	type TLPointerId,
} from './records/TLPointer'
export {
	InstancePresenceRecordType,
	type TLInstancePresence,
	type TLInstancePresenceID,
} from './records/TLPresence'
export { type TLRecord } from './records/TLRecord'
export {
	createShapeId,
	createShapePropsMigrationIds,
	createShapePropsMigrationSequence,
	getShapePropKeysByStyle,
	isShape,
	isShapeId,
	rootShapeMigrations,
	type TLDefaultShape,
	type TLParentId,
	type TLShape,
	type TLShapeId,
	type TLShapePartial,
	type TLUnknownShape,
} from './records/TLShape'
export {
	type RecordProps,
	type RecordPropsType,
	type TLPropsMigration,
	type TLPropsMigrations,
} from './recordsWithProps'
export { type ShapeWithCrop, type TLShapeCrop } from './shapes/ShapeWithCrop'
export {
	createShapeValidator,
	parentIdValidator,
	shapeIdValidator,
	type TLBaseShape,
} from './shapes/TLBaseShape'
export {
	bookmarkShapeMigrations,
	bookmarkShapeProps,
	type TLBookmarkShape,
	type TLBookmarkShapeProps,
} from './shapes/TLBookmarkShape'
export {
	drawShapeMigrations,
	drawShapeProps,
	type AnnotatorShape,
	type AnnotatorShapeProps,
	type AnnotatorShapeSegment,
} from './shapes/AnnotatorShape'
export {
	GeoShapeGeoStyle,
	geoShapeMigrations,
	geoShapeProps,
	type TLGeoShape,
	type TLGeoShapeGeoStyle,
	type TLGeoShapeProps,
} from './shapes/TLGeoShape'
export {
	groupShapeMigrations,
	groupShapeProps,
	type TLGroupShape,
	type TLGroupShapeProps,
} from './shapes/TLGroupShape'
export {
	highlightShapeMigrations,
	highlightShapeProps,
	type TLHighlightShape,
	type TLHighlightShapeProps,
} from './shapes/TLHighlightShape'
export {
	ImageShapeCrop,
	imageShapeMigrations,
	imageShapeProps,
	type TLImageShape,
	type TLImageShapeProps,
} from './shapes/TLImageShape'
export {
	lineShapeMigrations,
	lineShapeProps,
	LineShapeSplineStyle,
	type TLLineShape,
	type TLLineShapePoint,
	type TLLineShapeProps,
	type TLLineShapeSplineStyle,
} from './shapes/TLLineShape'
export {
	noteShapeMigrations,
	noteShapeProps,
	type TLNoteShape,
	type TLNoteShapeProps,
} from './shapes/TLNoteShape'
export {
	textShapeMigrations,
	textShapeProps,
	type TLTextShape,
	type TLTextShapeProps,
} from './shapes/TLTextShape'
export {
	videoShapeMigrations,
	videoShapeProps,
	type TLVideoShape,
	type TLVideoShapeProps,
} from './shapes/TLVideoShape'
export { EnumStyleProp, StyleProp, type StylePropValue } from './styles/StyleProp'
export {
	defaultColorNames,
	DefaultColorStyle,
	DefaultColorThemePalette,
	getDefaultColorTheme,
	type TLDefaultColorStyle,
	type TLDefaultColorTheme,
	type TLDefaultColorThemeColor,
} from './styles/TLColorStyle'
export { DefaultDashStyle, type TLDefaultDashStyle } from './styles/TLDashStyle'
export { DefaultFillStyle, type TLDefaultFillStyle } from './styles/TLFillStyle'
export {
	DefaultFontFamilies,
	DefaultFontStyle,
	type TLDefaultFontStyle,
} from './styles/TLFontStyle'
export {
	DefaultHorizontalAlignStyle,
	type TLDefaultHorizontalAlignStyle,
} from './styles/TLHorizontalAlignStyle'
export { DefaultSizeStyle, type TLDefaultSizeStyle } from './styles/TLSizeStyle'
export { DefaultTextAlignStyle, type TLDefaultTextAlignStyle } from './styles/TLTextAlignStyle'
export {
	DefaultVerticalAlignStyle,
	type TLDefaultVerticalAlignStyle,
} from './styles/TLVerticalAlignStyle'
export {
	type TLAssetContext,
	type TLAssetStore,
	type TLSerializedStore,
	type TLStore,
	type TLStoreProps,
	type TLStoreSchema,
	type TLStoreSnapshot,
} from './TLStore'
export {
	getDefaultTranslationLocale,
	LANGUAGES,
	type TLLanguage,
} from './translations/translations'
export { type SetValue } from './util-types'

registerAnnotatorLibraryVersion(
	(globalThis as any).ANNOTATOR_LIBRARY_NAME,
	(globalThis as any).ANNOTATOR_LIBRARY_VERSION,
	(globalThis as any).ANNOTATOR_LIBRARY_MODULES
)
