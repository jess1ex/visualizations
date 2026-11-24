# Change log

## 2026-10-16
- Created the plain visualization index, leftist heap merge tool, and project guidance.
- Made heaps scale to a stable viewport instead of requiring horizontal scrolling.
- Added smooth node/edge movement and opposing subtree arcs for swaps; preserved highlights. Seeking is instant; reduced motion is respected.
- Verified 200 algorithm cases, JavaScript syntax, and browser layout, merge movement, and seeking; no browser console errors.
- Required directory back links for future simulations; made the existing link work explicitly from disk. Highlighted the merged right spine in green while preserving orange operation rings.
- Corrected spine highlighting: retain the pre-swap merged path by node identity so its bends remain visible through repair and in the final heap.
- Added .gitignore for local/editor/generated files, .nojekyll for static hosting, and GitHub Pages setup instructions in README.md.

## 2026-11-07
- Added quicksort to the main index with animated array swaps, a recursive call tree, and a seekable timeline. Verified partition, swap, and recursion invariants with the Node test suite.
- Added the hash table collision visualization and tested probe order, wraparound, full tables, and duplicate keys.

## 2026-11-24
- Added the Schwarz–Christoffel visualization with linked prevertices and corners, editable parameters, and numerical boundary integration. Verified square geometry, complex constants, the angle at infinity, and invalid inputs with the Node test suite.
- Simplified the Schwarz–Christoffel layout and added fraction-of-π input for the C₁ argument. Verified fraction parsing and invalid inputs with Node tests.
- Added a five-step Schwarz–Christoffel problem-solving guide below the equation.
