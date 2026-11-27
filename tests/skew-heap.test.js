const {test} = require('node:test');
const assert = require('node:assert/strict');
const {generate, trace} = require('../skew-heap-merge/heap.js');

const node = (id, key, left = null, right = null) => ({id, key, left, right});

test('equal roots exchange arguments and terminal attachment keeps its side', () => {
  const a = node('A1', 1);
  const b = node('B1', 1, node('B2', 4));
  const states = trace(a, b);
  assert.deepEqual(states.map(step => step.phase),
    ['Start', 'Compare roots', 'Exchange heaps', 'Attach at last node', 'Done']);
  assert.deepEqual(states[2].roots.map(root => root.id), ['B1', 'A1']);
  assert.deepEqual(states.at(-1).roots, [node('B1', 1, b.left, a)]);
});

test('recursive return attaches on the right before swapping both children', () => {
  const left = node('A2', 3);
  const right = node('A3', 4);
  const a = node('A1', 1, left, right);
  const b = node('B1', 2);
  const states = trace(a, b);
  const detached = states.find(step => step.phase === 'Detach right subtree');
  assert.deepEqual(detached.roots, [node('A1', 1, left), right, b]);
  assert.deepEqual(detached.edge, ['A1', 'A3']);
  assert.deepEqual(detached.pending, ['A1']);
  const attached = states.findIndex(step => step.phase === 'Attach recursive result');
  const merged = node('B1', 2, null, right);
  assert.deepEqual(states[attached].roots, [node('A1', 1, left, merged)]);
  assert.equal(states[attached + 1].phase, 'Swap children');
  assert.deepEqual(states[attached + 1].roots, [node('A1', 1, merged, left)]);
  assert.deepEqual(a, node('A1', 1, left, right));
});

test('base cases return the other heap without edits', () => {
  const a = node('A1', 1, null, node('A2', 2));
  assert.deepEqual(trace(null, a).at(-1).roots, [a]);
  assert.deepEqual(trace(a, null).at(-1).roots, [a]);
  assert.deepEqual(trace(null, null).at(-1).roots, []);
});

test('every forest snapshot preserves heap order and each original node', () => {
  let seed = 1;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2**32);
  for (let i = 0; i < 200; i++) {
    const aSize = i % 15, bSize = Math.floor(i / 15);
    const states = trace(generate(aSize, 'A', random), generate(bSize, 'B', random));
    const expected = [...Array.from({length: aSize}, (_, j) => 'A' + (j + 1)),
      ...Array.from({length: bSize}, (_, j) => 'B' + (j + 1))].sort();
    for (const step of states) {
      const seen = [];
      function visit(root, parentKey = -Infinity) {
        if (!root) return;
        assert.ok(parentKey <= root.key);
        seen.push(root.id);
        visit(root.left, root.key);
        visit(root.right, root.key);
      }
      step.roots.forEach(root => visit(root));
      assert.deepEqual(seen.sort(), expected);
    }
    assert.equal(states.at(-1).roots.length, expected.length ? 1 : 0);
  }
});
