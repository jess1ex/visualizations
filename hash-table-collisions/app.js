const $ = id => document.getElementById(id);
const rules = {
  chaining: 'Each bucket holds a chain. A new key joins the end of its home bucket’s chain.',
  linear: 'Each bucket holds one key. After a collision, move one bucket ahead and wrap around at the end.',
  double: 'Each bucket holds one key. Use stride h₂(k) = 1 + (k mod 6) after a collision. Seven is prime, so each stride from 1 to 6 can visit every bucket.',
};
const input = $('keys');
const mode = $('mode');
let keys = input.value.split(',').map(Number);
let steps;
let position;
let timer;

function seek(target) {
  position = target;
  const step = steps[position];
  $('buckets').replaceChildren();
  step.table.forEach((bucket, index) => {
    const row = $('buckets').insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = index;
    row.append(heading);
    const contents = row.insertCell();
    if (!bucket.length) contents.textContent = 'Empty';
    bucket.forEach((key, offset) => {
      if (offset) contents.append(' → ');
      const chip = document.createElement('span');
      chip.className = 'key';
      chip.textContent = key;
      contents.append(chip);
    });
    const visit = row.insertCell();
    const order = step.probes.indexOf(index);
    if (order !== -1) {
      row.dataset.visited = '';
      visit.textContent = order + 1;
    }
    if (index === step.index) {
      row.setAttribute('aria-current', 'true');
      if (step.kind === 'insert') row.dataset.inserted = '';
      visit.append(` · ${step.kind === 'insert' ? 'inserted' : step.kind}`);
    }
  });

  $('message').textContent = step.message;
  $('probes').textContent = step.probes.length
    ? `Buckets visited for key ${step.key}: ${step.probes.join(' → ')}`
    : 'No active probe.';
  $('position').textContent = `${position} / ${steps.length - 1}`;
  $('timeline').value = position;
  $('timeline').setAttribute('aria-valuetext', `Step ${position} of ${steps.length - 1}`);
  $('start').disabled = $('previous').disabled = position === 0;
  $('next').disabled = position === steps.length - 1;
}

function pause() {
  clearInterval(timer);
  timer = null;
  $('play').textContent = 'Play';
}

function play() {
  if (position === steps.length - 1) seek(0);
  $('play').textContent = 'Pause';
  timer = setInterval(() => {
    seek(position + 1);
    if (position === steps.length - 1) pause();
  }, Number($('speed').value));
}

function reset() {
  pause();
  steps = hashingSteps(keys, mode.value);
  $('rule').textContent = rules[mode.value];
  $('timeline').max = steps.length - 1;
  seek(0);
}

input.oninput = () => input.setCustomValidity('');
$('input').onsubmit = event => {
  event.preventDefault();
  const parts = input.value.split(',').map(part => part.trim());
  if (parts.length > 15 || parts.some(part => !/^-?\d{1,3}$/.test(part))) {
    input.setCustomValidity('Enter 1–15 comma-separated integers from −999 to 999.');
    input.reportValidity();
    return;
  }
  keys = parts.map(Number);
  reset();
};
mode.onchange = reset;
$('start').onclick = () => { pause(); seek(0); };
$('previous').onclick = () => { pause(); seek(position - 1); };
$('next').onclick = () => { pause(); seek(position + 1); };
$('timeline').oninput = event => { pause(); seek(Number(event.target.value)); };
$('play').onclick = () => { if (timer) pause(); else play(); };
$('speed').onchange = () => { if (timer) { pause(); play(); } };
reset();
