Really understand the files and dirs of the project by reading all of them and making sense of it all. I want to shave off some functionality.

Note that in canvas, currently, user can: 
1. Choose color for the outline/marks (this includes outlines for rectangles, ellipses, lines and Draw tool marks) 
2. Change the transparency of the outlines/marks 
3. Change the Fill of the shapes (none, semi, solid, pattern) 
4. Change the dash style (draw, dashed, dotted, solid) 
5. Change the font size (s, m, l, xl) 
6. Change the font (serif, sans, mono, draw) 
7. Change the label alignment (start, end, middle, top)

What i'd like you to do with respect to the above are:
1. color for the outline/marks: reduce color options to only blue, green, red
2. transparency of the outlines/marks: remove this functionality altogether cleanly. We don't need this functionality at all as user does not need it and it shouldn't appear on UI at all. Transparency should always be 100%.
3. Fill of the shapes: reduce options to only solid and pattern
4. dash style: remove this functionality altogether cleanly. We don't need this functionality at all as user does not need it and it shouldn't appear on UI at all. Dash should always be solid. 
5. font size: remove this functionality altogether cleanly. We don't need this functionality at all as user does not need it and it shouldn't appear on UI at all. Size should always be M
6. font: remove this functionality altogether cleanly. We don't need this functionality at all as user does not need it and it shouldn't appear on UI at all. Font should always be sans. 
7. label alignment: remove this functionality altogether cleanly. We don't need this functionality at all as user does not need it and it shouldn't appear on UI at all. DLabel alignmentash should always be middle. 

Be careful to modify. maintain other functionalities and remove dead code or files.



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