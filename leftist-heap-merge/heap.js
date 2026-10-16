/* Shared algorithm; usable in a plain browser and Node's built-in test runner. */
(function (scope) {
  const rank = node => node ? node.rank : 0;
  const copy = value => JSON.parse(JSON.stringify(value));
  function merge(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (a.key > b.key) [a, b] = [b, a];
    a.right = merge(a.right, b);
    if (rank(a.left) < rank(a.right)) [a.left, a.right] = [a.right, a.left];
    a.rank = rank(a.right) + 1;
    return a;
  }
  function generate(count, prefix, random = Math.random) {
    let root = null;
    for (let i = 0; i < count; i++) {
      root = merge(root, { id: prefix + (i + 1), key: 1 + Math.floor(random() * 99), rank: 1, left: null, right: null });
    }
    return root;
  }
  function trace(first, second) {
    let a = copy(first), b = copy(second), root = null, tail = null;
    const stack = [], steps = [];
    let spine = [], spineFrozen = false;
    const save = (phase, message, active = []) => {
      if (!spineFrozen) {
        spine = [];
        for (let node = root; node; node = node.right) spine.push(node.id);
      }
      steps.push(copy({phase, message, active, spine, roots: [root, a, b].filter(Boolean), pending: stack.map(n => n.id)}));
    };
    save('Start', 'Two min-leftist heaps. Follow their right paths; their left subtrees stay attached.');
    while (a && b) {
      save('Compare roots', `Compare ${a.key} (${a.id}) and ${b.key} (${b.id}). Choose the smaller root; ties use the first heap.`, [a.id, b.id]);
      if (a.key > b.key) [a, b] = [b, a];
      const chosen = a;
      a = chosen.right;
      chosen.right = null;
      if (tail) tail.right = chosen;
      else root = chosen;
      tail = chosen;
      stack.push(chosen);
      save('Merge right paths', `Append ${chosen.key} (${chosen.id}) to the merged right path. Keep its left subtree attached.`, [chosen.id]);
    }
    const rest = a || b;
    if (tail) tail.right = rest;
    else root = rest;
    a = b = null;
    save('Merge right paths', 'One right path is exhausted. Attach the remaining subtree. Next, repair from the bottom up.', rest ? [rest.id] : []);
    // Preserve the original merged path as swaps bend it left and right.
    spineFrozen = true;
    while (stack.length) {
      const node = stack[stack.length - 1];
      const l = rank(node.left), r = rank(node.right);
      save('Check children', `At ${node.key} (${node.id}): left rank ${l}, right rank ${r}. ${l < r ? 'A child swap is needed.' : 'No child swap is needed.'}`, [node.id]);
      if (l < r) {
        [node.left, node.right] = [node.right, node.left];
        save('Swap children', `Swap the left and right children of ${node.key} (${node.id}) to restore left rank ≥ right rank.`, [node.id]);
      }
      node.rank = rank(node.right) + 1;
      stack.pop();
      save('Update rank', `Set rank of ${node.key} (${node.id}) to ${node.rank}. This subtree is now a valid leftist heap.`, [node.id]);
    }
    save('Done', 'Merge complete. Every parent is ≤ its children, and every left rank is ≥ its right rank.');
    return steps;
  }
  const api = { rank, merge, generate, trace };
  if (typeof module !== 'undefined') module.exports = api;
  else scope.LeftistHeap = api;
})(typeof window !== 'undefined' ? window : globalThis);
