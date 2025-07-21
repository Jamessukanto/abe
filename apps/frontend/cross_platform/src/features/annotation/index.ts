// UI Components
export { TopBar } from './components/ui/TopBar'
export { RightPanel } from './components/ui/RightPanel'
export { CanvasArea } from './components/ui/CanvasArea'
export { BottomToolsPanel } from './components/ui/BottomToolsPanel'

// Providers
export { AnnotationProvider } from './components/providers/AnnotationProvider'

// Core Engine (algorithms, hit testing, performance)
export * from './engine'

// Canvas Rendering & Interaction (tools, rendering)
export * from './canvas'

// Feature-specific Types (Redux is now centralized in store/)
export * from './lib/types' 