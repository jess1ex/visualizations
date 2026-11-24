const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let steps;
let position;
let timer;

function render(animate = false) {
  const step = steps[position];
  const call = step.calls[step.call];
  const array = $('array');
  const origins = new Map(Array.from(array.querySelectorAll('.tile'), tile =>
    [Number(tile.dataset.id), tile.getBoundingClientRect()]));
  array.replaceChildren();

  step.items.forEach(({ id, value }, index) => {
    const slot = document.createElement('li');
    const tile = document.createElement('span');
    const label = document.createElement('small');
    tile.className = 'tile';
    tile.dataset.id = id;
    tile.textContent = value;
    tile.classList.toggle('in-range', Boolean(call && index >= call.lo && index <= call.hi));
    tile.classList.toggle('fixed', step.fixed.includes(index));
    tile.classList.toggle('pivot', id === step.pivot);
    tile.classList.toggle('marked', step.indices.includes(index));
    label.textContent = index;
    slot.append(tile, label);
    array.append(slot);
  });

  if (animate && !reducedMotion.matches) {
    for (const tile of array.querySelectorAll('.tile')) {
      const origin = origins.get(Number(tile.dataset.id));
      const end = tile.getBoundingClientRect();
      const dx = origin.left - end.left;
      const dy = origin.top - end.top;
      if (!dx && !dy) continue;
      const arc = dx > 0 || (!dx && dy > 0) ? -28 : 28;
      tile.animate([
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: `translate(${dx / 2}px, ${dy / 2 + arc}px)` },
        { transform: 'translate(0, 0)' },
      ], { duration: Math.min(650, Number($('speed').value) * .85), easing: 'ease-in-out' });
    }
  }

  const nodes = [];
  $('calls').replaceChildren();
  for (const entry of step.calls) {
    const item = document.createElement('li');
    const text = document.createElement('span');
    const children = document.createElement('ul');
    const side = entry.side ? `${entry.side}: ` : '';
    const status = entry.done ? 'returned' : entry.id === step.call ? 'active' : 'waiting';
    text.textContent = `${side}quicksort(${entry.lo}, ${entry.hi}) · ${status}`;
    if (entry.id === step.call) text.setAttribute('aria-current', 'step');
    item.append(text);
    nodes.push({ item, children });
    if (entry.parent === null) {
      $('calls').append(item);
    } else {
      const parent = nodes[entry.parent];
      parent.item.append(parent.children);
      parent.children.append(item);
    }
  }

  $('message').textContent = step.message;
  $('timeline').value = position;
  $('timeline').setAttribute('aria-valuetext', `Step ${position} of ${steps.length - 1}`);
  $('position').textContent = `${position} / ${steps.length - 1}`;
  $('previous').disabled = $('start').disabled = position === 0;
  $('next').disabled = position === steps.length - 1;
}

function pause() {
  clearInterval(timer);
  timer = null;
  $('play').textContent = 'Play';
}

function seek(target, adjacent = false) {
  const animate = adjacent && steps[Math.max(position, target)].kind === 'swap';
  position = target;
  render(animate);
}

function play() {
  if (position === steps.length - 1) seek(0);
  $('play').textContent = 'Pause';
  timer = setInterval(() => {
    seek(position + 1, true);
    if (position === steps.length - 1) pause();
  }, Number($('speed').value));
}

function load(values) {
  pause();
  steps = quicksortSteps(values);
  $('timeline').max = steps.length - 1;
  seek(0);
}

const input = $('values');
input.addEventListener('input', () => input.setCustomValidity(''));
$('input').addEventListener('submit', event => {
  event.preventDefault();
  const parts = input.value.split(',').map(part => part.trim());
  if (parts.length > 12 || parts.some(part => !/^-?\d{1,3}$/.test(part))) {
    input.setCustomValidity('Enter 1–12 comma-separated integers from −999 to 999.');
    input.reportValidity();
    return;
  }
  load(parts.map(Number));
});
$('random').onclick = () => {
  const values = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) - 5);
  input.value = values.join(', ');
  input.setCustomValidity('');
  load(values);
};
$('start').onclick = () => { pause(); seek(0); };
$('previous').onclick = () => { pause(); seek(position - 1, true); };
$('next').onclick = () => { pause(); seek(position + 1, true); };
$('timeline').oninput = event => { pause(); seek(Number(event.target.value)); };
$('play').onclick = () => { if (timer) pause(); else play(); };
$('speed').onchange = () => { if (timer) { pause(); play(); } };
load(input.value.split(',').map(Number));
