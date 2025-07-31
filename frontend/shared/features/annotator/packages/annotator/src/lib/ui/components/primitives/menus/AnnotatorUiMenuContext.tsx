import { createContext, useContext } from 'react'
import { TLUiEventSource } from '../../../context/events'

/** @public */
export type TLUiMenuContextType =
	| 'panel'
	| 'menu'
	| 'small-icons'
	| 'context-menu'
	| 'icons'
	| 'keyboard-shortcuts'
	| 'helper-buttons'
	| 'toolbar'
	| 'toolbar-overflow'

const menuContext = createContext<{
	type: TLUiMenuContextType
	sourceId: TLUiEventSource
} | null>(null)

/** @public */
export function useAnnotatorUiMenuContext() {
	const context = useContext(menuContext)
	if (!context) {
		throw new Error('useAnnotatorUiMenuContext must be used within a AnnotatorUiMenuContextProvider')
	}
	return context
}

/** @public */
export interface TLUiMenuContextProviderProps {
	type: TLUiMenuContextType
	sourceId: TLUiEventSource
	children: React.ReactNode
}

/** @public @react */
export function AnnotatorUiMenuContextProvider({
	type,
	sourceId,
	children,
}: TLUiMenuContextProviderProps) {
	return <menuContext.Provider value={{ type, sourceId }}>{children}</menuContext.Provider>
}
