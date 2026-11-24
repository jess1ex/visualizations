const TABLE_SIZE = 7;
const mod = (key, divisor) => ((key % divisor) + divisor) % divisor;

function hashingSteps(keys, mode) {
  const table = Array.from({ length: TABLE_SIZE }, () => []);
  const steps = [];

  function record(kind, message, index = null, key = null, probes = []) {
    steps.push({ kind, message, index, key, probes: probes.slice(), table: table.map(bucket => bucket.slice()) });
  }

  record('start', 'The table is empty.');
  for (const key of keys) {
    const home = mod(key, TABLE_SIZE);
    const stride = mode === 'double' ? 1 + mod(key, TABLE_SIZE - 1) : 1;
    const probes = [];
    const limit = mode === 'chaining' ? 1 : TABLE_SIZE;
    for (let attempt = 0; attempt < limit; attempt++) {
      const index = mod(home + attempt * stride, TABLE_SIZE);
      const bucket = table[index];
      probes.push(index);
      const calculation = mode === 'chaining'
        ? `h₁(${key}) = ${home}`
        : `(${home} + ${attempt} × ${stride}) mod ${TABLE_SIZE} = ${index}`;
      record('probe', `Key ${key}: ${calculation}. Inspect bucket ${index}.`, index, key, probes);
      if (bucket.includes(key)) {
        record('duplicate', `Key ${key} is already in bucket ${index}.`, index, key, probes);
        break;
      }
      if (bucket.length) {
        const action = mode === 'chaining' ? 'Append to its chain.' : 'Continue along the probe sequence.';
        const explanation = attempt + 1 === TABLE_SIZE ? 'Every bucket has been checked.' : action;
        record('collision', `Bucket ${index} already holds ${bucket.join(', ')}. ${explanation}`, index, key, probes);
      }
      if (!bucket.length || mode === 'chaining') {
        bucket.push(key);
        record('insert', `Insert ${key} in bucket ${index}.`, index, key, probes);
        break;
      }
      if (attempt + 1 === TABLE_SIZE) {
        record('full', `The table is full. Key ${key} could not be inserted.`, index, key, probes);
      }
    }
  }
  record('done', 'All insertion attempts are complete.');
  return steps;
}

if (typeof module !== 'undefined') module.exports = { hashingSteps };
