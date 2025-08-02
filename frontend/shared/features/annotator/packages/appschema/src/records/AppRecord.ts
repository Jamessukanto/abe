import { AppAsset } from './AppAsset'
import { AppBinding } from './AppBinding'
import { AppCamera } from './AppCamera'
import { AppDocument } from './AppDocument'
import { AppInstance } from './AppInstance'
import { TLPage } from './TLPage'
import { TLInstancePageState } from './TLPageState'
import { TLPointer } from './TLPointer'
import { TLInstancePresence } from './TLPresence'
import { TLShape } from './TLShape'

/** @public */
export type TLRecord =
	| AppAsset
	| AppBinding
	| AppCamera
	| AppDocument
	| AppInstance
	| AppInstancePageState
	| AppPage
	| AppShape
	| AppInstancePresence
	| AppPointer
