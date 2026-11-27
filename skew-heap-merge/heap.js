(function (scope) {
  const copy = value => JSON.parse(JSON.stringify(value));
  const describe = node => `${node.id} (${node.key})`;

  function merge(h, other, record = () => {}) {
    if (!h || !other) {
      const rest = h || other;
      record('Return heap', 'An input is empty. Return the other input.', rest ? [rest] : []);
      return rest;
    }

    record('Compare roots', `Compare h = ${describe(h)} and h′ = ${describe(other)}.`, [h, other]);
    if (other.key <= h.key) {
      [h, other] = [other, h];
      record('Exchange heaps', `Exchange h and h′. Now h = ${describe(h)} has the smaller or equal root.`, [h, other]);
    }
    if (!h.right) {
      h.right = other;
      record('Attach at last node', `Attach ${describe(other)} as the right child of ${describe(h)} and return. This terminal case skips the child swap.`, [h, other]);
      return h;
    }

    const right = h.right;
    h.right = null;
    record('Detach right subtree', `Detach the right subtree of ${describe(h)}. Recursively merge ${describe(right)} with ${describe(other)}.`, [h, right]);
    h.right = merge(right, other, record);
    record('Attach recursive result', `Attach the result, rooted at ${describe(h.right)}, to the right of ${describe(h)}.`, [h, h.right]);
    [h.left, h.right] = [h.right, h.left];
    record('Swap children', `Swap the left and right children of ${describe(h)}, then return this subtree.`, [h, h.left, h.right].filter(Boolean));
    return h;
  }

  function generate(count, prefix, random = Math.random) {
    let root = null;
    for (let i = 0; i < count; i++) {
      root = merge(root, {id: prefix + (i + 1), key: 1 + Math.floor(random() * 99), left: null, right: null});
    }
    return root;
  }

  function trace(first, second) {
    const [a, b] = copy([first, second]);
    const roots = [a, b].filter(Boolean);
    const pending = [];
    const steps = [];
    const spine = [];
    function save(phase, message, nodes = [], edge) {
      steps.push(copy({phase, message, roots, active: nodes.map(node => node.id), pending, spine, edge}));
    }
    save('Start', 'Two skew heaps. Start by comparing their roots.');
    const result = merge(a, b, (phase, message, nodes) => {
      const [parent, child] = nodes;
      let edge;
      if (phase === 'Exchange heaps') {
        const i = roots.indexOf(parent), j = roots.indexOf(child);
        [roots[i], roots[j]] = [roots[j], roots[i]];
      }
      if (phase === 'Detach right subtree') {
        roots.splice(roots.indexOf(parent) + 1, 0, child);
        pending.push(parent.id);
        spine.push(parent.id);
        edge = [parent.id, child.id];
      }
      if (phase.startsWith('Attach')) {
        roots.splice(roots.indexOf(child), 1);
        if (phase === 'Attach at last node') spine.push(parent.id);
        else pending.pop();
        edge = [parent.id, child.id];
      }
      save(phase, message, nodes, edge);
    });
    save('Done', result ? `Merge complete. The result is rooted at ${describe(result)}. Each parent is ≤ its children.` : 'Merge complete. Both inputs were empty.');
    return steps;
  }

  const api = {merge, generate, trace};
  if (typeof module !== 'undefined') module.exports = api;
  else scope.SkewHeap = api;
})(typeof window !== 'undefined' ? window : globalThis);
