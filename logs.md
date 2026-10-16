# Change log

## 2026-10-16
- Created the plain visualization index, leftist heap merge tool, and project guidance.
- Made heaps scale to a stable viewport instead of requiring horizontal scrolling.
- Added smooth node/edge movement and opposing subtree arcs for swaps; preserved highlights. Seeking is instant; reduced motion is respected.
- Verified 200 algorithm cases, JavaScript syntax, and browser layout, merge movement, and seeking; no browser console errors.
- Required directory back links for future simulations; made the existing link work explicitly from disk. Highlighted the merged right spine in green while preserving orange operation rings.
- Corrected spine highlighting: retain the pre-swap merged path by node identity so its bends remain visible through repair and in the final heap.
- Added .gitignore for local/editor/generated files, .nojekyll for static hosting, and GitHub Pages setup instructions in README.md.
