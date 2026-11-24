const test = require('node:test');
const assert = require('node:assert/strict');
const { mapPolygon, isSimple, parsePiArgument } = require('../schwarz-christoffel/map.js');

const square = [-1, 0, 1].map(x => ({ x, alpha: 0.5 }));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7,
  `Expected ${actual} to be close to ${expected}`);

test('symmetric prevertices give a square with one corner at infinity', () => {
  const { vertices, infinity } = mapPolygon(square);
  const side = Math.abs(vertices[1][0]);
  close(side, 2.6220575543);
  close(infinity, 0.5);
  [[0, 0], [-side, 0], [-side, -side], [0, -side]].forEach(([x, y], i) => {
    close(vertices[i][0], x);
    close(vertices[i][1], y);
  });
  assert.ok(isSimple(vertices));
});

test('complex constants rotate, scale, and move the selected base prevertex', () => {
  const { vertices } = mapPolygon(square);
  const moved = mapPolygon(square, 2, Math.PI / 2, [3, 4], 1).vertices;
  const [baseX, baseY] = vertices[1];
  vertices.forEach(([x, y], i) => {
    close(moved[i][0], 3 - 2 * (y - baseY));
    close(moved[i][1], 4 + 2 * (x - baseX));
  });
});

test('adding a prevertex updates the infinity angle and boundary', () => {
  const { vertices, infinity } = mapPolygon([...square, { x: 2, alpha: 0.75 }]);
  assert.equal(vertices.length, 5);
  close(infinity, 0.75);
  assert.ok(isSimple(vertices));
  close(vertices.at(-1)[0], vertices.at(-1)[1]);
});

test('rejects repeated prevertices and an invalid implied angle at infinity', () => {
  assert.throws(() => mapPolygon([square[0], square[0]]), /distinct/);
  assert.throws(() => mapPolygon(square.map(point => ({ ...point, alpha: 0.9 }))), /infinity/);
  assert.equal(isSimple([[0, 0], [1, 1], [0, 1], [1, 0]]), false);
});

test('C₁ arguments accept fractions and decimals in units of π', () => {
  close(parsePiArgument('1/2'), Math.PI / 2);
  close(parsePiArgument(' -1 / 4 '), -Math.PI / 4);
  close(parsePiArgument('0.5'), Math.PI / 2);
  assert.ok(Number.isNaN(parsePiArgument('1/0')));
  assert.ok(Number.isNaN(parsePiArgument('1/2/3')));
});
