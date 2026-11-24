const { mapPolygon, isSimple, parsePiArgument } = SchwarzChristoffel;
const get = id => document.getElementById(id);
const defaults = () => ({
  points: [-1, 0, 1].map((x, id) => ({ x, id, alpha: 0.5 })),
  scale: 1, argument: '0', offset: [0, 0], anchor: 0,
});
let state = defaults();
let nextId = 3;
let selected = 0;

const label = index => String.fromCharCode(65 + index);
const fmt = value => Math.abs(value) < 1e-12 ? "0" : Number(value.toPrecision(5)).toString();
const svg = content => `<svg viewBox="0 0 400 280" aria-hidden="true">${content}</svg>`;
const line = (x1, y1, x2, y2, className = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${className}"/>`;
const text = (x, y, content) => `<text x="${x}" y="${y}">${content}</text>`;

function calculate(value) {
  return mapPolygon(value.points, value.scale, parsePiArgument(value.argument),
    value.offset, value.points.findIndex(point => point.id === value.anchor));
}

function updateSelection() {
  const { vertices, infinity } = calculate(state);
  const index = selected === 'infinity' ? state.points.length :
    state.points.findIndex(point => point.id === selected);
  const source = state.points[index];
  const [x, y] = vertices[index];
  get('selection').textContent =
    `${label(index)} · ${source ? 'z = ' + fmt(source.x) : 'z = ∞'} → w = ${fmt(x)} ${y < 0 ? '−' : '+'} ${fmt(Math.abs(y))}i · angle ${fmt(source?.alpha ?? infinity)}π`;
  document.querySelectorAll('.point').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.point === String(selected)));
  });
}

function addMarker(plot, x, y, index, infinity = false) {
  const point = state.points[index];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = infinity ? 'point infinity' : 'point';
  button.dataset.point = point?.id ?? 'infinity';
  button.style.left = `${x / 4}%`;
  button.style.top = `${y / 2.8}%`;
  button.textContent = infinity ? `${label(index)} · ∞` : label(index);
  button.setAttribute('aria-label', plot.id === 'input'
    ? `Prevertex ${label(index)} at ${point?.x ?? 'infinity'}` : `Corner ${label(index)}`);
  button.addEventListener('click', () => {
    selected = point?.id ?? 'infinity';
    updateSelection();
  });
  plot.append(button);
}

function render() {
  const { points } = state;
  const { vertices } = calculate(state);
  const inputRadius = Math.max(1.75, ...points.map(point => Math.abs(point.x) * 1.18));
  const inputX = x => 200 + x * 174 / inputRadius;
  const input = get('input');
  input.innerHTML = svg(
    '<rect x="17" y="17" width="366" height="143" class="domain"/>' +
    line(17, 160, 383, 160) + line(200, 17, 200, 252) +
    text(26, 42, 'Im z > 0') + text(349, 193, 'Re z') + text(209, 33, 'Im z') +
    text(26, 235, 'The real axis meets at ∞'));
  points.forEach((point, index) => addMarker(input, inputX(point.x), 160, index));
  addMarker(input, 349, 230, points.length, true);

  const xs = vertices.map(([x]) => x);
  const ys = vertices.map(([, y]) => y);
  const xmin = Math.min(-3.1, ...xs);
  const xmax = Math.max(0.8, ...xs);
  const ymin = Math.min(-3.1, ...ys);
  const ymax = Math.max(0.8, ...ys);
  const unit = Math.min(340 / (xmax - xmin), 206 / (ymax - ymin));
  const project = ([x, y]) => [
    200 + (x - (xmin + xmax) / 2) * unit,
    137 - (y - (ymin + ymax) / 2) * unit,
  ];
  const [originX, originY] = project([0, 0]);
  const positions = vertices.map(project);
  const output = get('output');
  output.innerHTML = svg(
    line(17, originY, 383, originY) + line(originX, 17, originX, 252) +
    `<polygon points="${positions.map(pair => pair.join(',')).join(' ')}"/>` +
    text(348, originY + 21, 'Re w') + text(Math.min(originX + 9, 347), 33, 'Im w') +
    text(26, 263, 'Polygon interior'));
  positions.forEach(([x, y], index) => addMarker(output, x, y, index));
  updateSelection();
}

const editor = get('editor');
const parameter = get('parameter');

function refreshMenu(choice = 'new') {
  parameter.innerHTML = '<option value="new">Add a prevertex</option>' +
    state.points.map((point, index) =>
      `<option value="${point.id}">Edit ${label(index)} (x = ${fmt(point.x)})</option>`).join('') +
    '<option value="multiplier">Edit C₁</option><option value="offset">Edit C₂</option>' +
    '<option value="anchor">Edit z₀</option>';
  parameter.value = choice;
  refreshFields();
}

function refreshFields() {
  const choice = parameter.value;
  const point = state.points.find(item => String(item.id) === choice);
  const last = state.points.at(-1);
  const number = (id, title, value, limits = '') =>
    `<label>${title}<input name="${id}" type="number" step="any" value="${value}" ${limits} required></label>`;
  const fields = get('fields');
  if (choice === 'multiplier') {
    fields.innerHTML = number('scale', 'Magnitude', state.scale, 'min="0.001" max="1000"') +
      `<label>Argument (× π)<input name="argument" value="${state.argument}" aria-describedby="argument-hint" required></label>
       <small id="argument-hint">For example, 1/2 gives a rotation of π/2.</small>`;
  } else if (choice === 'offset') {
    fields.innerHTML = number('real', 'Real part', state.offset[0], 'min="-1000" max="1000"') +
      number('imag', 'Imaginary part', state.offset[1], 'min="-1000" max="1000"');
  } else if (choice === 'anchor') {
    fields.innerHTML = '<label>Base prevertex <select name="base">' +
      state.points.map((item, index) =>
        `<option value="${item.id}" ${item.id === state.anchor ? 'selected' : ''}>${label(index)} · ${fmt(item.x)}</option>`).join('') +
      '</select></label>';
  } else {
    fields.innerHTML = number('x', 'Real prevertex x', point?.x ?? Math.min(last.x + 1, 100),
      'min="-100" max="100"') + number('alpha', 'Angle (× π)', point?.alpha ?? 0.75, 'min="0.05" max="1.95"');
  }
  get('angle-hint').hidden = !point && choice !== 'new';
  get('remove').hidden = !point || state.points.length <= 2;
  get('apply').textContent = choice === 'new' ? 'Add point' : 'Apply';
  showError('');
}

function showError(message) {
  get('error').textContent = message;
  get('error').hidden = !message;
}

function commit(candidate, choice, selection) {
  candidate.points.sort((a, b) => a.x - b.x);
  try {
    const { vertices } = calculate(candidate);
    if (!isSimple(vertices)) throw new Error('These parameters make the polygon cross itself. Try another angle or prevertex.');
  } catch (error) {
    showError(error.message);
    return false;
  }
  state = candidate;
  selected = selection;
  render();
  refreshMenu(choice);
  return true;
}

editor.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(editor);
  const value = name => Number(data.get(name));
  const choice = parameter.value;
  const candidate = { ...state, points: [...state.points] };
  let selection = selected;
  if (choice === 'multiplier') {
    candidate.scale = value('scale');
    candidate.argument = data.get('argument').trim();
    if (!Number.isFinite(parsePiArgument(candidate.argument))) {
      showError('Enter the argument in units of π, such as 1/2, -1/4, or 0.5. Use a nonzero denominator.');
      return;
    }
  } else if (choice === 'offset') {
    candidate.offset = [value('real'), value('imag')];
  } else if (choice === 'anchor') {
    candidate.anchor = value('base');
    selection = candidate.anchor;
  } else {
    if (choice === 'new' && state.points.length >= 10) {
      showError('This graph supports up to ten finite prevertices.');
      return;
    }
    selection = choice === 'new' ? nextId : Number(choice);
    const point = { id: selection, x: value('x'), alpha: value('alpha') };
    candidate.points = [...candidate.points.filter(item => item.id !== selection), point];
  }
  if (commit(candidate, choice === 'new' ? String(selection) : choice, selection) && choice === 'new') {
    nextId++;
  }
});

get('remove').addEventListener('click', () => {
  const id = Number(parameter.value);
  const points = state.points.filter(point => point.id !== id);
  const anchor = id === state.anchor ? points[0].id : state.anchor;
  if (commit({ ...state, points, anchor }, 'new', selected === id ? anchor : selected)) {
    parameter.focus();
  }
});
get('add').addEventListener('click', event => {
  editor.hidden = !editor.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!editor.hidden));
  if (!editor.hidden) parameter.focus();
  else showError('');
});
get('reset').addEventListener('click', () => {
  state = defaults();
  selected = 0;
  nextId = 3;
  render();
  refreshMenu();
});
parameter.addEventListener('change', refreshFields);
refreshMenu();
render();
