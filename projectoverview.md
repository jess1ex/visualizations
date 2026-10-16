# Project overview

A continually growing collection of small, interactive learning tools for different subjects.

## Structure

- `index.html`: intentionally plain directory of titles and links.
- `leftist-heap-merge/`: min-leftist heap merge visualization.
  - `index.html`: controls, explanation, and diagram surface.
  - `heap.js`: heap generation, merge, and immutable step snapshots; browser/Node compatible.
  - `app.js`: SVG trees, timeline, and playback.
- `tests/`: algorithm checks using Node's built-in test runner.
- `AGENTS.md`: instructions for future contributors and coding agents.
- `README.md`: getting started.
- `logs.md`: concise dated change history.

## Leftist heap merge

Uses rank(empty) = 0 and rank(leaf) = 1. Parents have values no larger than their children; left subtree rank is at least right subtree rank. Equal roots prefer the first merge argument.

First merge the right paths while preserving attached left subtrees. Then repair bottom-up, with separate check, child-swap (when needed), and rank-update steps. Pending ranks are explicitly marked. All timeline states are stored as independent snapshots, so seeking is reversible. Node IDs preserve original-heap identity even with duplicate values.

The merged right spine grows in green during merging, then its node identities are frozen before repair. Those same nodes and their connecting edges stay green as swaps bend the path, including in the final heap. Orange operation highlights take precedence.

Controls: random generation, heap size, previous/next, start, play/pause, playback speed, and timeline slider. Diagrams scale to the viewport with a stable canvas across steps. Identity-based node motion carries attached edges; child swaps use opposing subtree arcs. Scrubbing is instant, interrupted animations resume from visible positions, and reduced-motion preferences disable animation.

## Future additions

Create one folder per visualization, include a visible back link to the root index.html, add one link to the root index, and record its purpose here. Keep the collection buildless unless a concrete need justifies changing that approach.
