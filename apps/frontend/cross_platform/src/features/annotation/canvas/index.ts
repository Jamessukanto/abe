// New layered canvas architecture
export { CanvasContainer } from './CanvasContainer'
export { ViewportManager } from './viewport/ViewportManager'
export { InteractionManager } from './interaction/InteractionManager'
export { RenderingEngine } from './rendering/RenderingEngine'
export { BackgroundRenderer } from './rendering/BackgroundRenderer'
export { ShapeRenderer } from './rendering/ShapeRenderer'
export { OverlayRenderer } from './rendering/OverlayRenderer'
export { RenderingOptimizer } from './rendering/RenderingOptimizer'

// Event-driven architecture
export * from './events/EventBus'

// Tool management with command pattern
export { ToolController } from './tools/ToolController'
