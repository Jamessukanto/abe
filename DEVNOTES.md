**TO DO:**
- Nav UI
- Image as Background component
    - Background component renders at the page level
    - Image dimensions are handled by the background component
    - Canvas scales to fit the image dimensions
    - Annotations are positioned relative to the image coordinates
    - upon opening a page, the intial zoom level is relative to the image dimensions ratio
    - user can pan outside image but not annotate outside image
- Annotation Positioning relative to IMAGE coordinates



. Key Files for Implementation
DefaultCanvas.tsx: Main canvas rendering
DefaultBackground.tsx: Background system (currently just a colored div)
ImageShapeUtil.tsx: Current image handling
Editor.ts: Camera and coordinate system
AppPage.ts: Page structure





