function quicksortSteps(values) {
  const items = values.map((value, id) => ({ value, id }));
  const calls = [];
  const fixed = [];
  const steps = [];

  function record(kind, message, call = null, pivot = null, indices = []) {
    steps.push({
      kind, message, call, pivot, indices,
      items: items.slice(),
      calls: calls.map(entry => ({ ...entry })),
      fixed: fixed.slice(),
    });
  }

  function swap(left, right, call, pivot, message) {
    if (left === right) return;
    [items[left], items[right]] = [items[right], items[left]];
    record('swap', message, call, pivot, [left, right]);
  }

  function sort(lo, hi, parent, side) {
    const id = calls.length;
    calls.push({ id, lo, hi, parent, side, done: false });
    record('call', `Enter quicksort(${lo}, ${hi}).`, id);

    if (lo >= hi) {
      if (lo === hi) fixed.push(lo);
      calls[id].done = true;
      record('return', lo > hi ? 'Empty range. Return.' : 'One item is already in its final position. Return.', id);
      return;
    }

    const pivot = items[hi].id;
    const value = items[hi].value;
    let boundary = lo;
    record('pivot', `Choose the rightmost value, ${value}, as pivot.`, id, pivot);
    for (let scan = lo; scan < hi; scan++) {
      const goesLeft = items[scan].value <= value;
      record('compare', `Compare ${items[scan].value} with ${value}. ${goesLeft ? `It belongs on the left at index ${boundary}.` : 'It stays in the greater-than region for now.'}`, id, pivot, [scan, boundary]);
      if (goesLeft) {
        swap(scan, boundary, id, pivot, `Swap indices ${scan} and ${boundary}.`);
        boundary++;
      }
    }

    swap(boundary, hi, id, pivot, `Move the pivot to index ${boundary}.`);
    fixed.push(boundary);
    record('partition', `Pivot fixed at index ${boundary}. Recurse on the two remaining ranges.`, id, pivot);
    sort(lo, boundary - 1, id, 'left');
    sort(boundary + 1, hi, id, 'right');
    calls[id].done = true;
    record('return', `Return from quicksort(${lo}, ${hi}).`, id);
  }

  record('start', 'The full array is ready to sort.');
  sort(0, items.length - 1, null, '');
  record('done', 'Sorting complete.');
  return steps;
}

if (typeof module !== 'undefined') module.exports = { quicksortSteps };
