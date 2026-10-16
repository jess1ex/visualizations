# Working in this repository

This is an evolving collection of educational visualizations. Read projectoverview.md before changing it.

- Keep the root index.html plain HTML: titles and links, with no styling framework or application shell.
- Every simulation must have a visible “← All visualizations” back link to the root index.html (use an explicit relative file path so navigation also works from disk).
- Put each visualization in its own descriptive kebab-case directory and link it from the root index.
- Prefer plain HTML, CSS, and JavaScript, with no build step, network dependency, or package installation. Pages should work when opened directly from disk.
- Keep styles local to a visualization. Use semantic controls, visible labels, keyboard support, and readable diagrams.
- Algorithm visualizations must accurately distinguish intermediate states from final invariants. Keep algorithm logic separate from rendering when practical.
- Preserve deterministic, seekable steps. Playback, backward steps, and timeline scrubbing must show the same state.
- Test meaningful algorithm invariants and edge cases with Node's built-in test runner. Do not add dependencies just for testing.
- Update projectoverview.md and the index when adding a subject. Document assumptions and local usage in README.md.

- Keep logs.md concise: dated bullets covering meaningful changes and validation, not a transcript.
