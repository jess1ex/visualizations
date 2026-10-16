const {test} = require('node:test');
const assert = require('node:assert/strict');
const {generate, trace} = require('../leftist-heap-merge/heap.js');
function inspect(n, valid = true, ids = []) {
  if (!n) return {rank:0,ids};
  assert.ok(!ids.includes(n.id), 'each node appears exactly once'); ids.push(n.id);
  for (const child of [n.left,n.right]) if (child) assert.ok(n.key <= child.key, 'min-heap ordering');
  const l = inspect(n.left,valid,ids), r = inspect(n.right,valid,ids);
  if (valid) { assert.ok(l.rank >= r.rank,'leftist property'); assert.equal(n.rank,1+Math.min(l.rank,r.rank)); }
  return {rank:1+Math.min(l.rank,r.rank),ids};
}
test('random merges conserve nodes at every step and finish as valid leftist heaps', () => {
  let seed = 12345;
  const random = () => ((seed = (1664525*seed+1013904223) >>> 0) / 2**32);
  for (let i=0;i<200;i++) {
    const a = generate(i%15,'A',random), b = generate((i*7)%15,'B',random);
    const expected = [...inspect(a).ids,...inspect(b).ids].sort();
    const before = JSON.stringify([a,b]);
    const states = trace(a,b);
    assert.equal(JSON.stringify([a,b]),before,'inputs remain unchanged');
    for (const state of states) {
      const ids=[]; state.roots.forEach(root => inspect(root,false,ids));
      assert.deepEqual(ids.sort(),expected);
    }
    const result = states.at(-1);
    assert.ok(result.roots.length <= 1);
    inspect(result.roots[0]);
  }
});
test('child swaps are separate from merging and rank updates, including duplicate keys', () => {
  const states = trace(generate(7,'A',()=>0.5),generate(7,'B',()=>0.5));
  assert.ok(states.some(s=>s.phase==='Swap children'));
  states.forEach((s,i)=> {
    if (s.phase==='Swap children') { assert.equal(states[i-1].phase,'Check children'); assert.equal(states[i+1].phase,'Update rank'); }
  });
  assert.equal(states.at(-1).phase,'Done');
  inspect(states.at(-1).roots[0]);
});
test('the pre-swap spine keeps its identity and connected edges as swaps bend it', () => {
  const states = trace(generate(7,'A',()=>0.5),generate(7,'B',()=>0.5));
  const repair = states.findIndex(s => s.phase === 'Check children');
  const merged = states[repair-1];
  const original = [];
  for (let n = merged.roots[0]; n; n = n.right) original.push(n.id);
  assert.deepEqual(merged.spine, original);
  let bendsLeft = false;
  for (const state of states.slice(repair)) {
    assert.deepEqual(state.spine, original);
    const nodes = new Map();
    function collect(n) { if (!n) return; nodes.set(n.id,n); collect(n.left); collect(n.right); }
    state.roots.forEach(collect);
    for (let i=0;i<original.length-1;i++) {
      const parent = nodes.get(original[i]), child = original[i+1];
      assert.ok(parent.left?.id === child || parent.right?.id === child);
      if (parent.left?.id === child) bendsLeft = true;
    }
  }
  assert.ok(bendsLeft, 'highlighted path survives a right-to-left child swap');
});
