const test = require('node:test');
const assert = require('node:assert/strict');
const { quicksortSteps } = require('../quicksort/sort.js');

test('quicksort snapshots preserve identity and mark only final positions', () => {
  for (const values of [[], [4], [3, 3, 3], [1, 2, 3, 4], [4, 3, 2, 1], [8, -1, 3, 0, -1, 2]]) {
    const steps = quicksortSteps(values);
    const expected = values.slice().sort((a, b) => a - b);
    assert.deepEqual(steps, quicksortSteps(values));
    assert.deepEqual(steps[0].items.map(item => item.value), values);
    assert.deepEqual(steps.at(-1).items.map(item => item.value), expected);
    assert.equal(steps.at(-1).fixed.length, values.length);
    assert.ok(steps.at(-1).calls.every(call => call.done));

    for (const [index, step] of steps.entries()) {
      assert.equal(new Set(step.items.map(item => item.id)).size, values.length);
      for (const item of step.items) assert.equal(item.value, values[item.id]);
      for (const fixed of step.fixed) assert.equal(step.items[fixed].value, expected[fixed]);
      if (step.kind === 'swap') {
        const before = steps[index - 1].items.slice();
        const [left, right] = step.indices;
        assert.notEqual(left, right);
        [before[left], before[right]] = [before[right], before[left]];
        assert.deepEqual(step.items, before);
      }
      if (step.kind === 'partition') {
        const { lo, hi } = step.calls[step.call];
        const pivot = step.items.findIndex(item => item.id === step.pivot);
        const value = step.items[pivot].value;
        assert.ok(step.items.slice(lo, pivot).every(item => item.value <= value));
        assert.ok(step.items.slice(pivot + 1, hi + 1).every(item => item.value > value));
      }
    }
  }
});

test('quicksort records left and right calls, including empty ranges', () => {
  const steps = quicksortSteps([3, 1, 2]);
  const calls = steps.at(-1).calls;
  assert.deepEqual(calls.map(({ lo, hi, parent, side }) => [lo, hi, parent, side]), [
    [0, 2, null, ''], [0, 0, 0, 'left'], [2, 2, 0, 'right'],
  ]);
  const baseCases = quicksortSteps([1, 2]).at(-1).calls;
  assert.ok(baseCases.some(call => call.side === 'right' && call.lo > call.hi));
  assert.equal(steps.find(step => step.kind === 'call').calls[0].done, false);
});
