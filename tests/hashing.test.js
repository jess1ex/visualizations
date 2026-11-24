const test = require('node:test');
const assert = require('node:assert/strict');
const { hashingSteps } = require('../hash-table-collisions/hash.js');

test('each mode resolves collisions using its own sequence', () => {
  const keys = [10, 17, 24];
  const expected = {
    chaining: [[3], [3], [3]],
    linear: [[3], [3, 4], [3, 4, 5]],
    double: [[3], [3, 2], [3, 4]],
  };
  for (const [mode, paths] of Object.entries(expected)) {
    const steps = hashingSteps(keys, mode);
    const insertions = steps.filter(step => step.kind === 'insert');
    assert.deepEqual(insertions.map(step => step.probes), paths);
    assert.deepEqual(steps[0].table, [[], [], [], [], [], [], []]);
    assert.deepEqual(insertions[0].table[3], [10]);
    assert.deepEqual(steps.at(-1).table.flat().sort((a, b) => a - b), keys);
  }
});

test('open addressing wraps around and visits each bucket before reporting full', () => {
  for (const mode of ['linear', 'double']) {
    for (let key = -12; key <= 12; key++) {
      const keys = Array.from({ length: 7 }, (_, index) => key + (index + 1) * 42);
      const steps = hashingSteps([...keys, key, keys[0]], mode);
      const full = steps.find(step => step.kind === 'full');
      assert.equal(full.key, key);
      assert.equal(full.probes.length, 7);
      assert.equal(new Set(full.probes).size, 7);
      assert.deepEqual(steps.at(-1).table.flat().sort((a, b) => a - b), keys);
      assert.equal(steps.filter(step => step.kind === 'duplicate').length, 1);
    }
  }
});

test('chaining accepts more keys than buckets and skips duplicates', () => {
  const keys = Array.from({ length: 9 }, (_, index) => index * 7 - 1);
  const steps = hashingSteps([...keys, -1], 'chaining');
  assert.deepEqual(steps.at(-1).table[6], keys);
  assert.equal(steps.at(-2).kind, 'duplicate');
});
