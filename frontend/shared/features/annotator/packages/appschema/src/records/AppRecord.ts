import { AppAsset } from './AppAsset'
import { AppBinding } from './AppBinding'
import { AppCamera } from './AppCamera'
import { AppDocument } from './AppDocument'
import { AppInstance } from './AppInstance'
import { AppPage } from './AppPage'
import { TLShape } from './AppShape'
import { AppInstancePageState } from './AppPageState'
import { AppPointer } from './AppPointer'
import { AppInstancePresence } from './AppPresence'

/** @public */
export type TLRecord =
	| AppAsset
	| AppBinding
	| AppCamera
	| AppDocument
	| AppInstance
	| AppInstancePageState
	| AppPage
	| TLShape
	| AppInstancePresence
	| AppPointer
