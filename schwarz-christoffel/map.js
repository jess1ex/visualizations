(function (root) {
  // Gauss–Legendre nodes and weights on [-1, 1].
  const nodes = [0.09501250983763744, 0.2816035507792589, 0.4580167776572274,
    0.6178762444026438, 0.755404408355003, 0.8656312023878318,
    0.9445750230732326, 0.9894009349916499];
  const weights = [0.1894506104550685, 0.1826034150449236, 0.16915651939500254,
    0.14959598881657673, 0.12462897125553387, 0.09515851168249278,
    0.06225352393864789, 0.027152459411754095];

  function halfIntegral(integrand, alpha, reversed) {
    let total = 0;
    for (let i = 0; i < 8; i++) {
      for (const sign of [-1, 1]) {
        for (let panel = 0; panel < 8; panel++) {
          const u = (panel + (1 + sign * nodes[i]) / 2) / 8;
          const near = Math.pow(u, 1 / alpha) / 2;
          total += weights[i] * near / (16 * alpha * u) *
            integrand(reversed ? 1 - near : near, reversed ? near : 1 - near);
        }
      }
    }
    return total;
  }

  function mapPolygon(points, scale = 1, rotation = 0, offset = [0, 0], anchor = 0) {
    const xs = points.map(point => point.x);
    const alphas = points.map(point => point.alpha);
    const infinity = points.length - 1 - alphas.reduce((sum, angle) => sum + angle, 0);
    if (points.length < 2 || xs.some((x, i) => !Number.isFinite(x) || (i && x <= xs[i - 1]))) {
      throw new Error('Use at least two distinct, increasing real prevertices.');
    }
    if ([...alphas, infinity].some(alpha => !Number.isFinite(alpha) || alpha < 0.05 - 1e-12 || alpha > 1.95 + 1e-12)) {
      throw new Error('All angles, including the angle at infinity, must be between 0.05π and 1.95π.');
    }
    if (!(scale > 0) || ![scale, rotation, ...offset].every(Number.isFinite)) {
      throw new Error('Use a positive scale and finite constants.');
    }

    const vertices = [[0, 0]];
    for (let i = 0; i < xs.length; i++) {
      const tail = i === xs.length - 1;
      const width = tail ? 1 : xs[i + 1] - xs[i];
      const magnitude = (t, remaining) => {
        // Keep both endpoint distances explicit near singularities.
        let log = Math.log(width);
        if (tail) {
          log += (infinity - 1) * Math.log(remaining);
        }
        for (let j = 0; j < xs.length; j++) {
          const distance = tail
            ? (xs[i] - xs[j]) * remaining + t
            : j <= i ? xs[i] - xs[j] + width * t : xs[j] - xs[i + 1] + width * remaining;
          log += (alphas[j] - 1) * Math.log(distance);
        }
        return Math.exp(log);
      };
      const length = halfIntegral(magnitude, alphas[i], false) +
        halfIntegral(magnitude, tail ? infinity : alphas[i + 1], true);
      const argument = Math.PI * alphas.slice(i + 1).reduce((sum, alpha) => sum + alpha - 1, 0);
      const [x, y] = vertices[i];
      vertices.push([x + length * Math.cos(argument), y + length * Math.sin(argument)]);
    }

    const [baseX, baseY] = vertices[anchor];
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return {
      infinity,
      vertices: vertices.map(([x, y]) => [
        offset[0] + scale * ((x - baseX) * cos - (y - baseY) * sin),
        offset[1] + scale * ((x - baseX) * sin + (y - baseY) * cos),
      ]),
    };
  }

  function isSimple(vertices) {
    const orientation = ([ax, ay], [bx, by], [cx, cy]) =>
      (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const intersects = (a, b, c, d) => {
      const crosses = (p, q, r, s) => orientation(p, q, r) * orientation(p, q, s) <= 0;
      return crosses(a, b, c, d) && crosses(c, d, a, b) &&
        [0, 1].every(axis => Math.max(Math.min(a[axis], b[axis]), Math.min(c[axis], d[axis])) <=
          Math.min(Math.max(a[axis], b[axis]), Math.max(c[axis], d[axis])));
    };
    return vertices.every((a, i) => vertices.every((c, j) =>
      j <= i + 1 || (i === 0 && j === vertices.length - 1) ||
      !intersects(a, vertices[i + 1], c, vertices[(j + 1) % vertices.length])));
  }

  function parsePiArgument(input) {
    const match = input.trim().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*\/\s*(\d+))?$/);
    if (!match) return NaN;
    const radians = Math.PI * (Number(match[1]) / Number(match[2] ?? 1));
    return Number.isFinite(radians) ? radians : NaN;
  }

  const api = { mapPolygon, isSimple, parsePiArgument };
  if (typeof module === 'object') module.exports = api;
  else root.SchwarzChristoffel = api;
})(globalThis);
