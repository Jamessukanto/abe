import { TLAssetId, TLShapeId } from '@annotator/tlschema'
import { VecLike } from '../../primitives/Vec'
import { TLContent } from './clipboard-types'

/** @public */
export interface TLAnnotatorExternalContentSource {
	type: 'annotator'
	data: TLContent
}

/** @public */
export interface TLExcalidrawExternalContentSource {
	type: 'excalidraw'
	data: any
}

/** @public */
export interface TLTextExternalContentSource {
	type: 'text'
	data: string
	subtype: 'json' | 'html' | 'text' | 'url'
}

/** @public */
export interface TLErrorExternalContentSource {
	type: 'error'
	data: string | null
	reason: string
}

/** @public */
export type TLExternalContentSource =
	| TLAnnotatorExternalContentSource
	| TLExcalidrawExternalContentSource
	| TLTextExternalContentSource
	| TLErrorExternalContentSource

/** @public */
export interface TLBaseExternalContent {
	sources?: TLExternalContentSource[]
	point?: VecLike
}

/** @public */
export interface TLTextExternalContent extends TLBaseExternalContent {
	type: 'text'
	text: string
	html?: string
}

/** @public */
export interface TLFilesExternalContent extends TLBaseExternalContent {
	type: 'files'
	files: File[]
	ignoreParent?: boolean
}

/** @public */
export interface TLFileReplaceExternalContent extends TLBaseExternalContent {
	type: 'file-replace'
	file: File
	shapeId: TLShapeId
	isImage: boolean
}

/** @public */
export interface TLUrlExternalContent extends TLBaseExternalContent {
	type: 'url'
	url: string
}

/** @public */
export interface TLSvgTextExternalContent extends TLBaseExternalContent {
	type: 'svg-text'
	text: string
}

/** @public */
export interface TLEmbedExternalContent<EmbedDefinition> extends TLBaseExternalContent {
	type: 'embed'
	url: string
	embed: EmbedDefinition
}

/** @public */
export interface TLAnnotatorExternalContent extends TLBaseExternalContent {
	type: 'annotator'
	content: TLContent
}

/** @public */
export interface TLExcalidrawExternalContent extends TLBaseExternalContent {
	type: 'excalidraw'
	content: any
}

/** @public */
export type TLExternalContent<EmbedDefinition> =
	| TLTextExternalContent
	| TLFilesExternalContent
	| TLFileReplaceExternalContent
	| TLUrlExternalContent
	| TLSvgTextExternalContent
	| TLEmbedExternalContent<EmbedDefinition>
	| TLAnnotatorExternalContent
	| TLExcalidrawExternalContent

/** @public */
export interface TLFileExternalAsset {
	type: 'file'
	file: File
	assetId?: TLAssetId
}

/** @public */
export interface TLUrlExternalAsset {
	type: 'url'
	url: string
}

/** @public */
export type TLExternalAsset = TLFileExternalAsset | TLUrlExternalAsset
