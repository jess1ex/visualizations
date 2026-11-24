# Project overview

A continually growing collection of small, interactive learning tools for different subjects.

## Structure

- `index.html`: intentionally plain directory of titles and links.
- `leftist-heap-merge/`: min-leftist heap merge visualization.
  - `index.html`: controls, explanation, and diagram surface.
  - `heap.js`: heap generation, merge, and immutable step snapshots; browser/Node compatible.
  - `app.js`: SVG trees, timeline, and playback.
- `quicksort/`: array and recursion tree visualization, with a standalone step generator in `sort.js`.
- `hash-table-collisions/`: collision strategy comparison with seekable insertion snapshots in `hash.js`.
- `tests/`: algorithm checks using Node's built-in test runner.
- `AGENTS.md`: instructions for future contributors and coding agents.
- `README.md`: getting started.
- `logs.md`: concise dated change history.

## Leftist heap merge

Uses rank(empty) = 0 and rank(leaf) = 1. Parents have values no larger than their children; left subtree rank is at least right subtree rank. Equal roots prefer the first merge argument.

First merge the right paths while preserving attached left subtrees. Then repair bottom-up, with separate check, child-swap (when needed), and rank-update steps. Pending ranks are explicitly marked. All timeline states are stored as independent snapshots, so seeking is reversible. Node IDs preserve original-heap identity even with duplicate values.

The merged right spine grows in green during merging, then its node identities are frozen before repair. Those same nodes and their connecting edges stay green as swaps bend the path, including in the final heap. Orange operation highlights take precedence.

Controls: random generation, heap size, previous/next, start, play/pause, playback speed, and timeline slider. Diagrams scale to the viewport with a stable canvas across steps. Identity-based node motion carries attached edges; child swaps use opposing subtree arcs. Scrubbing is instant, interrupted animations resume from visible positions, and reduced-motion preferences disable animation.

## Quicksort

Uses inclusive, zero-based ranges and Lomuto partitioning. The rightmost item is the pivot, and values equal to it go in the left partition. The recursion tree records empty and single-item calls. Array values have stable identities so swaps animate along opposing arcs even when values repeat. Comparisons, swaps, pivot placement, and call entry and return are seekable.

## Hash table collisions

Uses seven buckets and nonnegative modular arithmetic. Chaining appends to the home bucket. Linear probing advances by one, and double hashing uses a stride of 1 + (key mod 6). The prime capacity lets every possible stride visit all buckets. Duplicate keys are skipped, and open addressing reports a full table after seven unsuccessful probes.

## Future additions

Create one folder per visualization, include a visible back link to the root index.html, add one link to the root index, and record its purpose here. Keep the collection buildless unless a concrete need justifies changing that approach.
