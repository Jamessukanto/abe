/**
 * Check if element is within a scrollable container
 */
export function isInScrollableContainer(
  element: Element,
  getComputedStyle: (element: Element) => CSSStyleDeclaration,
  getParentElement: (element: Element) => Element | null,
  isBody: (element: Element) => boolean
): boolean {
  let current = element
  while (current && !isBody(current)) {
    const computedStyle = getComputedStyle(current)
    if (computedStyle.overflowY === 'auto' || 
        computedStyle.overflowY === 'scroll' || 
        current.classList.contains('overflow-y-auto') ||
        current.classList.contains('custom-scrollbar')) {
      return true
    }
    const parent = getParentElement(current)
    if (!parent) break
    current = parent
  }
  return false
}

/**
 * Check if wheel event should be allowed in scrollable containers
 * Pure function - takes all dependencies as parameters
 */
export function shouldAllowWheelInScrollable(
  event: WheelEvent,
  isInScrollableContainer: (element: Element) => boolean
): boolean {
  const target = event.target as Element
  
  // Allow scrolling within scrollable containers
  if (isInScrollableContainer(target)) {
    // If this is a pinch-to-zoom gesture, block it in scrollable areas
    if (event.ctrlKey || event.deltaZ !== 0) {
      return false
    }
    // Allow normal scrolling
    return true
  }
  
  return false
}

/**
 * Create browser-specific implementations for scrollable utilities
 */
export function createScrollableUtils() {
  return {
    isInScrollableContainer: (element: Element) => 
      isInScrollableContainer(
        element,
        (el) => window.getComputedStyle(el),
        (el) => el.parentElement,
        (el) => el === document.body
      ),
    shouldAllowWheelInScrollable: (event: WheelEvent) =>
      shouldAllowWheelInScrollable(
        event,
        (element) => isInScrollableContainer(
          element,
          (el) => window.getComputedStyle(el),
          (el) => el.parentElement,
          (el) => el === document.body
        )
      )
  }
} 