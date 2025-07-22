/**
 * Check if element is within a scrollable container
 */
export function isInScrollableContainer(element: Element): boolean {
  let current = element
  while (current && current !== document.body) {
    const computedStyle = window.getComputedStyle(current)
    if (computedStyle.overflowY === 'auto' || 
        computedStyle.overflowY === 'scroll' || 
        current.classList.contains('overflow-y-auto') ||
        current.classList.contains('custom-scrollbar')) {
      return true
    }
    current = current.parentElement!
  }
  return false
}

/**
 * Check if wheel event should be allowed in scrollable containers
 */
export function shouldAllowWheelInScrollable(event: WheelEvent): boolean {
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