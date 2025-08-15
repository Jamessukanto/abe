Task: Remove Font Size Selection Functionality
Objective
Completely remove the font size selection feature from the annotator canvas, ensuring all text renders at size 'M' by default.
Current State
Users can currently change font sizes (small, medium, large, extra-large)
This functionality appears in the UI with size pickers and icons
Font sizes are deeply integrated across the codebase
Requirements
Complete Removal: Remove all font size selection functionality, not just hide it in the UI
Default to Medium: All text should render at size 'M' by default
Clean Code: Remove all related code, types, and dead files
Preserve Other Features: Maintain all other existing functionality
Data Migration: Handle existing shapes with old size values
Implementation Scope
1. Schema & Type System Changes
Update TLSizeStyle.ts: Restrict DefaultSizeStyle enum to only allow 'm'
Add Shape Migrations: Create migrations for draw, geo, and line shapes to convert existing 's', 'l', 'xl' values to 'm'
2. UI Component Removal
Remove Style Panel: Remove size picker from DefaultStylePanelContent.tsx
Update STYLES Object: Remove size options from styles.tsx
Update Hooks: Remove size from useRelevantStyles.ts relevant styles list
3. Rendering Logic Simplification
Update Font Size Constants: Remove unused size constants and always use 'm' values
Simplify Shape Utils: Remove size-related logic from DrawShapeUtil.tsx, GeoShapeUtil.tsx, LineShapeUtil.tsx
Update Text Rendering: Ensure all text components default to medium size
4. Asset & Translation Cleanup
Remove Icon Imports: Remove size-related icons from all asset files (imports.vite.js, urls.js, selfHosted.js, imports.js)
Update Icon Types: Remove size icon types from icon-types.ts
Clean Translations: Remove size-style translations from all language files
Update Translation Keys: Remove size keys from TLUiTranslationKey.ts and defaultTranslation.ts
5. Data Migration & Compatibility
Update buildFromV1Document.ts: Map all old size values to 'm'
Update Import Functions: Ensure imported content defaults to 'm' size
Add Shape Migrations: Ensure existing shapes with old size values are converted
6. Test Updates
Update Test Files: Change all test expectations from other sizes to 'm'
Update Test Data: Modify test shapes to use 'm' size values
Update Snapshots: Ensure test snapshots reflect new medium-only behavior
Critical Considerations
Data Migration
Existing Shapes: Shapes in local storage/browser data may have old size values
Migration Strategy: Add shape migrations to convert old values to 'm'
Validation Errors: Without migrations, validation will fail on existing data
Asset Dependencies
Icon References: Size icons may be referenced in multiple asset files
Translation Keys: Size translations exist in multiple language files
Type Definitions: Icon types and translation keys need cleanup
Rendering Edge Cases
Text Sizing: Font sizes affect text rendering and layout
Shape Scaling: Different sizes may affect shape dimensions
Label Sizing: Text labels may have size-specific calculations
Success Criteria
✅ No size picker appears in UI
✅ All text renders at medium size regardless of legacy data
✅ No validation errors on existing shapes
✅ Clean codebase with no dead size-related code
✅ All existing functionality preserved
✅ No console errors related to missing size assets
Testing Checklist
[ ] Fresh page loads without validation errors
[ ] Existing documents with old size values load correctly
[ ] New shapes default to medium size
[ ] No size options appear in style panel
[ ] All other style options (color, fill, dash) work normally
[ ] No missing icon errors in console
[ ] All tests pass with updated expectations






1. User can currently choose color for the outline/marks (this includes outlines for rectangles, ellipses, lines and Draw tool marks). Reduce color options to only blue, green, red

3. User can currently change the Fill of the shapes (none, semi, solid, pattern) . Fill of the shapes: reduce options to only solid and pattern





(base) ➜  abe git:(main) echo "TypeScript/JavaScript files" && find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "./frontend/node_modules/*" -not -path "./backend/node_modules/*" -not -path "./.git/*" -not -path "*/node_modules/*" -not -path "*/.tsbuild/*" -not -path "*/dist/*" 
<st/*" -not -path "*/build/*" | xargs wc -l | tail -1
TypeScript/JavaScript files
  204536 total



  

Really understand the files and dirs of the project by reading all of them and making sense of it all. I want to shave off some functionality. In partficular, I want to completely remove the Arrow drawing functionality from annotator. This includes:


**Core Components to Remove:**
- Arrow shape implementation (packages/annotator/src/lib/shapes/Arrow/)
- Arrow tool (ArrowShapeTool)
- Arrow shape utility (ArrowShapeUtil)
- Arrow binding utility (ArrowBindingUtil)
- Arrow-related UI components (toolbar items, overlays)

**Dependencies to Clean:**
- Remove Arrow from default shape tools
- Remove Arrow from default shape utils
- Remove Arrow from default binding utils
- Remove Arrow from schema definitions
- Remove Arrow-related tests
- Remove Arrow from toolbar and UI components

**Requirements:**
- Remove ALL Arrow functionality cleanly
- Ensure no broken references remain
- Maintain all other drawing tools (rectangle, circle, etc.)
- Verify the dev server still works
- Ensure type checking passes
- Test that other shapes still work properly

Please remove the Arrow functionality systematically and verify everything else still works.














------------




cool

now, the tree row is about pages. but this is not really what we want. what we want is the panel to be the visualisation of the tree information of the the shapes and/or groups drawn in the canvas.

for example, Scenario:
1. User draws five rectangles in this order: rect 1, rect 2, rect 3, rect 4, rect 5.
- rect 1 is frontmost; rect 5 is backmost.
2. User groups rect 1 and rect 3 into Group 1.
3. User groups Group 1 and rect 5 into Group 2.

Expected Tree States (front-to-back order, top = frontmost):

- Initial (no groups):
rect 1
rect 2
rect 3
rect 4
rect 5
- After creating Group 1:
Group 1 (expandable)
rect 2
rect 4
rect 5
- After creating Group 2:
Group 2 (contains Group 1 and rect 5)
rect 4

Rules:
- Each shape or group is represented by its own row (layer tree row) component in the tree.
- Rows can be dragged into groups. When hovered over, a group auto-expands so the user can drop the item precisely inside. This should be 
- All reordering and grouping in the tree is reflected in the canvas, and vice versa.
- Tree order = front-to-back in canvas (frontmost at top).
- Selecting in the canvas highlights the corresponding tree row, and selecting in the tree highlights the corresponding canvas object.
- Selected rows have a lighter background to indicate selection.

Bringing an item to front in the canvas must move it up in the tree (fix current incorrect “down” behavior).