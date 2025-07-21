// Feature-agnostic UI components
export * from './components/ui'

// Feature-specific exports
export * from './features/annotation'

// Redux store and utilities (centralized following PROJECT_TREE)
export { default as store, useAppDispatch, useAppSelector } from './store'
export type { RootState, AppDispatch } from './store'
// Export all Redux actions, thunks, and selectors
export * from './store'

// Shared utilities
export * from './lib/utils'

// Export global styles
import './globals.css'; 