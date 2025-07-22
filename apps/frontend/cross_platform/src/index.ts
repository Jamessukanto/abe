// Feature-agnostic UI components
export * from './components/ui'

// Feature-specific exports
export * from './features/annotation'

// Redux store and utilities (centralized following PROJECT_TREE)
export { clientStore, useAppDispatch, useAppSelector } from './store'
export type { ClientRootState, ClientAppDispatch } from './store'
// Export all Redux actions, thunks, and selectors
export * from './store/annotationSlice'
export * from './store/thunks'

// Shared utilities
export * from './lib/utils'

// Export global styles
import './globals.css'; 