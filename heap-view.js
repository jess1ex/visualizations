const $ = id => document.getElementById(id);
const skew = Boolean(window.SkewHeap);
const heap = window.SkewHeap || window.LeftistHeap;
let steps = [], position = 0, timer = null;
const ns = 'http://www.w3.org/2000/svg';
function element(tag, attrs, text) {
  const e = document.createElementNS(ns, tag);
  Object.entries(attrs || {}).forEach(([k,v]) => e.setAttribute(k,v));
  if (text !== undefined) e.textContent = text;
  return e;
}
let frame = null, displayed = new Map(), previousStep = null;
let sceneWidth = 650, sceneHeight = 350;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function layout(step) {
  const nodes = [], edges = [], labels = [];
  let cursor = 0, maxDepth = 0;
  function visit(n, depth) {
    if (!n) return null;
    maxDepth = Math.max(depth, maxDepth);
    const left = visit(n.left, depth + 1);
    const here = {node:n, x:48 + cursor++ * 62, y:90 + depth * 82};
    nodes.push(here);
    const right = visit(n.right, depth + 1);
    if (left) edges.push({a:here,b:left,label:'L'});
    if (right) edges.push({a:here,b:right,label:'R'});
    return here;
  }
  for (const root of step.roots) {
    const begin = cursor;
    visit(root, 0);
    let text = step === steps[0] || step === steps[1] ? `Heap ${root.id[0]}` : labels.length === 0 ? 'Merged path / result' : 'Remaining';
    if (skew) {
      const argument = ['Compare roots', 'Exchange heaps'].includes(step.phase) ? step.active.indexOf(root.id) : -1;
      if (argument >= 0) text = argument === 0 ? 'h' : 'h′';
      else if (step.phase === 'Start') text = `Heap ${root.id[0]}`;
      else if (step.phase === 'Done') text = 'Merged heap';
      else text = step.pending.includes(root.id) ? 'Waiting' : '';
    }
    labels.push({x:48 + (begin + cursor - 1) * 31, text});
    cursor++;
  }
  return {nodes, edges, labels, width:Math.max(400,cursor*62+34), height:Math.max(300,maxDepth*82+175)};
}
function draw(step, animate = true) {
  cancelAnimationFrame(frame);
  const svg = $('trees'), scene = layout(step);
  const offset = (sceneWidth-scene.width)/2;
  scene.nodes.forEach(n => n.x += offset);
  scene.labels.forEach(n => n.x += offset);
  svg.setAttribute('viewBox', `0 0 ${sceneWidth} ${sceneHeight}`);
  svg.replaceChildren(element('title',{id:'tree-title'},skew ? 'Skew heap merge' : 'Leftist heap merge'),element('desc',{id:'tree-description'},step.message));
  const arcs = new Map();
  // Entire subtrees take opposite arcs, keeping their structure recognizable.
  const swap = step.phase === 'Swap children' ? step : previousStep?.phase === 'Swap children' && ['Check children', 'Attach recursive result'].includes(step.phase) ? previousStep : null;
  if (swap) {
    function mark(n, direction) { if (!n) return; arcs.set(n.id,direction); mark(n.left,direction); mark(n.right,direction); }
    function find(n) {
      if (!n) return;
      if (n.id === swap.active[0]) { mark(n.left,-1); mark(n.right,1); }
      else { find(n.left); find(n.right); }
    }
    swap.roots.forEach(find);
  }
  const spine = new Set(step.spine);
  const from = new Map(displayed);
  const duration = animate && from.size && !reducedMotion.matches ? Math.min(700,Number($('speed').value)*0.8) : 0;
  const edgeKey = edge => `${edge.a.node.id}/${edge.b.node.id}`;
  const animateEdges = skew && duration && previousStep;
  const priorEdges = animateEdges ? layout(previousStep).edges : [];
  const priorKeys = new Set(priorEdges.map(edgeKey));
  const currentKeys = new Set(scene.edges.map(edgeKey));
  const removedEdges = priorEdges.filter(edge => !currentKeys.has(edgeKey(edge)));
  const edgeViews = [...scene.edges, ...removedEdges].map(edge => {
    const key = edgeKey(edge);
    const removed = !currentKeys.has(key);
    const added = animateEdges && !priorKeys.has(key);
    const changed = removed || step.edge?.join('/') === key;
    const onSpine = spine.has(edge.a.node.id) && spine.has(edge.b.node.id);
    const line = element('line',{stroke:changed?'#a84a00':onSpine?'#16804a':'#89929d','stroke-width':changed||onSpine?4:2,'stroke-dasharray':removed?'5 4':'none'});
    const label = element('text',{'text-anchor':'middle',fill:'#515c69','font-size':12},edge.label);
    svg.append(line,label);
    return {...edge,line,labelElement:label,removed,added};
  });
  for (const l of scene.labels) svg.append(element('text',{x:l.x,y:28,'text-anchor':'middle',fill:'#515c69','font-size':14},l.text));
  const views = scene.nodes.map(({node:n}) => {
    const active = step.active.includes(n.id), pending = step.pending.includes(n.id);
    const description = skew ? `${n.id}: value ${n.key}${pending ? ' (waiting for recursive result)' : ''}` :
      `${n.id}: value ${n.key}, rank ${n.rank}${pending ? ' (pending repair)' : ''}`;
    const g = element('g',{'aria-label':description});
    g.append(element('title',{},description));
    g.append(element('circle',{r:23,fill:spine.has(n.id)?'#dcf5e5':n.id.startsWith('A')?'#eaf3ff':'#f0ecfa',stroke:active?'#a84a00':spine.has(n.id)?'#16804a':'#667789','stroke-width':active?4:spine.has(n.id)?2.5:1.5,'stroke-dasharray':pending?'5 3':'none'}));
    g.append(element('text',{y:5,'text-anchor':'middle',fill:'#20252c','font-size':17,'font-weight':600},n.key));
    g.append(element('text',{y:39,'text-anchor':'middle',fill:'#515c69','font-size':12},skew ? n.id : `${n.id} · r=${n.rank}${pending?'*':''}`));
    svg.append(g);
    return g;
  });
  const started = performance.now();
  function paint(now) {
    const t = duration ? Math.min(1,(now-started)/duration) : 1;
    const eased = t*t*(3-2*t);
    displayed = new Map();
    scene.nodes.forEach((target,i) => {
      const origin = from.get(target.node.id) || target;
      const moving = Math.abs(origin.x-target.x)+Math.abs(origin.y-target.y)>1;
      const arc = moving ? (arcs.get(target.node.id)||0)*32*Math.sin(Math.PI*t) : 0;
      const point = {x:origin.x+(target.x-origin.x)*eased,y:origin.y+(target.y-origin.y)*eased+arc};
      displayed.set(target.node.id,point);
      views[i].setAttribute('transform',`translate(${point.x} ${point.y})`);
    });
    for (const edge of edgeViews) {
      const opacity = edge.removed ? 1-eased : edge.added ? eased : 1;
      edge.line.setAttribute('opacity',opacity);
      edge.labelElement.setAttribute('opacity',opacity);
      const a=displayed.get(edge.a.node.id),b=displayed.get(edge.b.node.id);
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      const inset=Math.min(24,len/2);
      Object.entries({x1:a.x+dx/len*inset,y1:a.y+dy/len*inset,x2:b.x-dx/len*inset,y2:b.y-dy/len*inset}).forEach(([k,v])=>edge.line.setAttribute(k,v));
      edge.labelElement.setAttribute('x',(a.x+b.x)/2+(edge.label==='L'?-10:10));
      edge.labelElement.setAttribute('y',(a.y+b.y)/2);
    }
    if (t<1) frame=requestAnimationFrame(paint);
  }
  paint(started);
  previousStep=step;
}
function render(animate = true) {
  const step = steps[position];
  $('position').textContent = `${position} / ${steps.length-1}`;
  $('phase').textContent = step.phase;
  $('status').textContent = step.message;
  $('timeline').value = position;
  $('timeline').setAttribute('aria-valuetext', `Step ${position}: ${step.phase}`);
  $('previous').disabled = $('start').disabled = position === 0;
  $('next').disabled = position === steps.length-1;
  draw(step, animate);
}
function pause() { clearInterval(timer); timer = null; $('play').textContent = 'Play'; }
function play() {
  if (position === steps.length-1) position = 0;
  $('play').textContent = 'Pause';
  render();
  timer = setInterval(() => { position++; render(); if (position === steps.length-1) pause(); }, Number($('speed').value));
}
$('play').onclick = () => timer ? pause() : play();
$('next').onclick = () => { pause(); position = Math.min(position+1, steps.length-1); render(); };
$('previous').onclick = () => { pause(); position = Math.max(0,position-1); render(); };
$('start').onclick = () => { pause(); position=0; render(); };
$('timeline').oninput = event => { pause(); position=Number(event.target.value); render(false); };
$('speed').onchange = () => { if (timer) { pause(); play(); } };
function regenerate(random = Math.random) {
  pause(); position = 0;
  const count = Number($('size').value);
  steps = heap.trace(heap.generate(count,'A',random),heap.generate(count,'B',random));
  const layouts = steps.map(layout);
  sceneWidth = Math.max(...layouts.map(s=>s.width));
  sceneHeight = Math.max(...layouts.map(s=>s.height));
  displayed.clear(); previousStep=null;
  $('timeline').max = steps.length-1;
  render();
}
$('generate').onclick = () => regenerate();
$('size').onchange = () => regenerate();
let seed = 1;
regenerate(skew ? () => ((seed = (1664525*seed + 1013904223) >>> 0) / 2**32) : Math.random);
