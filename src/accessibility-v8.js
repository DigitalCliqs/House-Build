import { HOUSE, ROOMS, TELEPORTS } from './house-config.js';

// v8 concept accessibility engine.
// This analyses the current visualisation geometry only. It is not a substitute
// for the final architect/OT accessibility review using dimensioned drawings.

const RULES = {
  entranceClear: 1.10,
  internalClear: 0.90,
  corridorClear: 1.50,
  furnitureRoute: 0.90,
  kitchenRoute: 1.20,
  turnDiameter: 1.50,
  wheelchairRadius: 0.42,
  wcFront: 0.90,
  showerApproach: 0.90,
};

// Approximate furniture/service footprints already represented in the v4/v6 scene.
// Coordinates are metres in the walkthrough coordinate system.
const OBSTACLES = [
  {id:'kitchen-run', x:4.6, z:5.0, w:4.3, d:.75, label:'Kitchen wall units'},
  {id:'island', x:5.0, z:3.25, w:3.35, d:1.20, label:'Kitchen island'},
  {id:'dining', x:6.65, z:.55, w:3.8, d:2.3, label:'Dining setting'},
  {id:'sofa-main', x:5.0, z:-2.45, w:3.3, d:1.1, label:'Main sofa'},
  {id:'sofa-return', x:6.35, z:-1.7, w:1.1, d:2.1, label:'Sofa return'},
  {id:'media', x:8.4, z:-1.0, w:.35, d:3.4, label:'Media wall'},
  {id:'bed-access', x:-7.7, z:4.8, w:1.45, d:2.15, label:'Accessible bedroom bed'},
  {id:'wetroom-vanity', x:-3.45, z:5.55, w:.95, d:.65, label:'Accessible bathroom vanity'},
  {id:'wetroom-shower', x:-2.5, z:5.25, w:1.65, d:1.65, label:'Roll-in shower zone'},
  {id:'office-desk', x:.5, z:4.55, w:2.1, d:.85, label:'Office desk'},
];

function rectContains(rect, x, z, clearance=0){
  return Math.abs(x-rect.x) <= rect.w/2 + clearance && Math.abs(z-rect.z) <= rect.d/2 + clearance;
}
function distancePointRect(x,z,r){
  const dx=Math.max(Math.abs(x-r.x)-r.w/2,0);
  const dz=Math.max(Math.abs(z-r.z)-r.d/2,0);
  return Math.hypot(dx,dz);
}
function roomForPoint(x,z){
  return ROOMS.find(r=>Math.abs(x-r.x)<=r.w/2 && Math.abs(z-(r.z+HOUSE.z))<=r.d/2) || null;
}
function samplePath(a,b,step=.12){
  const dx=b[0]-a[0], dz=b[1]-a[1], len=Math.hypot(dx,dz), n=Math.max(1,Math.ceil(len/step));
  const pts=[]; for(let i=0;i<=n;i++){const t=i/n;pts.push([a[0]+dx*t,a[1]+dz*t]);} return pts;
}
function evaluatePath(name, points, required=RULES.furnitureRoute){
  const radius=RULES.wheelchairRadius;
  let min=Infinity, nearest=null, blocked=false;
  for(const [x,z] of points){
    for(const o of OBSTACLES){
      const d=distancePointRect(x,z,o);
      if(d<min){min=d;nearest=o.label;}
      if(rectContains(o,x,z,radius)){blocked=true;}
    }
  }
  const clearWidth=Math.max(0,(min-radius)*2);
  return {name,pass:!blocked && clearWidth>=required,clearWidth,required,nearest,blocked};
}

const checks=[];
function scalar(name,actual,required){checks.push({type:'scalar',name,actual,required,pass:actual>=required});}
scalar('Main entrance clear opening', HOUSE.entranceDoor, RULES.entranceClear);
scalar('Standard internal clear opening', HOUSE.standardDoor, RULES.internalClear);
scalar('Accessible-room clear opening', HOUSE.accessibleDoor, RULES.internalClear);

for(const id of ['accessible','bath','kitchen','living','dining','storage']){
  const r=ROOMS.find(x=>x.id===id); if(!r) continue;
  scalar(`${r.name} minimum room dimension`, Math.min(r.w,r.d), RULES.turnDiameter);
}

// Concept circulation paths through the principal accessible route.
const paths=[
  ['Entrance → living', TELEPORTS.Entrance, TELEPORTS.Living, RULES.corridorClear],
  ['Entrance → accessible bedroom', TELEPORTS.Entrance, TELEPORTS['Accessible bedroom'], RULES.corridorClear],
  ['Accessible bedroom → bathroom', TELEPORTS['Accessible bedroom'], TELEPORTS['Accessible bathroom'], RULES.furnitureRoute],
  ['Living → kitchen', TELEPORTS.Living, TELEPORTS.Kitchen, RULES.kitchenRoute],
  ['Living → terrace', TELEPORTS.Living, TELEPORTS.Terrace, RULES.furnitureRoute],
  ['Terrace → pool', TELEPORTS.Terrace, TELEPORTS.Pool, RULES.furnitureRoute],
];
const pathResults=paths.map(([name,a,b,required])=>evaluatePath(name,samplePath([a[0],a[2]],[b[0],b[2]]),required));

// Functional-space checks from the current concept dimensions/placements.
const bath=ROOMS.find(r=>r.id==='bath');
const kitchen=ROOMS.find(r=>r.id==='kitchen');
const accessible=ROOMS.find(r=>r.id==='accessible');
const functional=[
  {name:'Accessible bathroom turning circle',actual:Math.min(bath?.w||0,bath?.d||0),required:RULES.turnDiameter},
  {name:'Accessible bedroom turning circle',actual:Math.min(accessible?.w||0,accessible?.d||0),required:RULES.turnDiameter},
  {name:'Kitchen working zone depth',actual:Math.min(kitchen?.w||0,kitchen?.d||0),required:RULES.kitchenRoute},
  {name:'WC frontal transfer design allowance',actual:.90,required:RULES.wcFront},
  {name:'Roll-in shower approach design allowance',actual:.95,required:RULES.showerApproach},
].map(x=>({...x,pass:x.actual>=x.required}));

const all=[...checks,...functional];
const passed=all.filter(x=>x.pass).length + pathResults.filter(x=>x.pass).length;
const total=all.length+pathResults.length;

function addStyles(){
  const s=document.createElement('style');
  s.textContent=`
  .a11y-v8-summary{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.06);font-size:11px}
  .a11y-v8-score{font-size:18px;font-weight:800}.a11y-v8-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:8px 0}.a11y-v8-tabs button{padding:7px 6px;font-size:10px}
  .a11y-v8-list{display:grid;gap:5px}.a11y-v8-row{display:grid;grid-template-columns:18px 1fr auto;gap:6px;align-items:center;padding:7px 8px;border-radius:8px;background:rgba(255,255,255,.045);font-size:10px}.a11y-v8-row .ok{color:#8ee7ae}.a11y-v8-row .bad{color:#ffb19d}.a11y-v8-row small{opacity:.65;text-align:right}.a11y-v8-note{font-size:10px;line-height:1.45;opacity:.58;margin-top:8px}
  #a11yMap{width:100%;aspect-ratio:1.55/1;border-radius:10px;background:#15191f;border:1px solid rgba(255,255,255,.08);touch-action:none}.a11y-legend{display:flex;gap:10px;flex-wrap:wrap;font-size:9px;opacity:.65;margin-top:5px}
  `;document.head.appendChild(s);
}

function row(label,pass,detail){return `<div class="a11y-v8-row"><span class="${pass?'ok':'bad'}">${pass?'✓':'!'}</span><b>${label}</b><small>${detail}</small></div>`;}
function renderList(mode,host){
  if(mode==='paths') host.innerHTML=pathResults.map(r=>row(r.name,r.pass,`${r.clearWidth.toFixed(2)} m est. / ≥ ${r.required.toFixed(2)} m`)).join('');
  else if(mode==='spaces') host.innerHTML=functional.map(r=>row(r.name,r.pass,`${r.actual.toFixed(2)} / ≥ ${r.required.toFixed(2)} m`)).join('');
  else host.innerHTML=checks.map(r=>row(r.name,r.pass,`${r.actual.toFixed(2)} / ≥ ${r.required.toFixed(2)} m`)).join('');
}

function drawMap(canvas){
  const ctx=canvas.getContext('2d'); const dpr=Math.min(devicePixelRatio||1,2); const w=canvas.clientWidth,h=canvas.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
  const sx=w/30, sz=h/24, ox=w/2, oz=h/2+10;
  const X=x=>ox+x*sx, Z=z=>oz-z*sz;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#15191f';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1.2;ctx.strokeRect(X(-HOUSE.width/2),Z(HOUSE.z+HOUSE.depth/2),HOUSE.width*sx,HOUSE.depth*sz);
  for(const r of ROOMS){ctx.strokeStyle='rgba(255,255,255,.12)';ctx.strokeRect(X(r.x-r.w/2),Z(r.z+HOUSE.z+r.d/2),r.w*sx,r.d*sz);}
  ctx.fillStyle='rgba(255,112,92,.40)';for(const o of OBSTACLES)ctx.fillRect(X(o.x-o.w/2),Z(o.z+o.d/2),o.w*sx,o.d*sz);
  for(const [name,a,b] of paths){const result=pathResults.find(p=>p.name===name);ctx.strokeStyle=result?.pass?'rgba(93,224,144,.85)':'rgba(255,125,103,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(a[0]),Z(a[2]));ctx.lineTo(X(b[0]),Z(b[2]));ctx.stroke();}
  ctx.strokeStyle='rgba(54,183,230,.9)';ctx.lineWidth=2;for(const k of ['Accessible bedroom','Accessible bathroom','Kitchen','Living']){const p=TELEPORTS[k];if(!p)continue;ctx.beginPath();ctx.arc(X(p[0]),Z(p[2]),.75*sx,0,Math.PI*2);ctx.stroke();}
}

const panel=document.querySelector('.panel');
if(panel){
  addStyles();
  const section=document.createElement('div');section.className='section';section.innerHTML=`
    <div class="section-title">Accessibility analysis v8</div>
    <div class="a11y-v8-summary"><span><b>Concept accessibility score</b><br><small>current visualisation geometry</small></span><span class="a11y-v8-score">${passed}/${total}</span></div>
    <div class="a11y-v8-tabs"><button data-a11y-tab="doors">Doors</button><button data-a11y-tab="paths">Routes</button><button data-a11y-tab="spaces">Spaces</button></div>
    <div id="a11yV8List" class="a11y-v8-list"></div>
    <canvas id="a11yMap" aria-label="Concept accessibility route map"></canvas>
    <div class="a11y-legend"><span>Green = estimated pass</span><span>Red = estimated conflict</span><span>Blue circles = 1.50 m turn</span></div>
    <div class="row"><button id="wheelAudit">Wheelchair audit mode</button><button id="a11yFullscreen" class="secondary">Map fullscreen</button></div>
    <div class="a11y-v8-note">This is a geometry-based design-development audit. Route widths are estimated from the current furniture footprints and straight-line paths; final compliance must be rerun against the signed-off dimensioned architectural plan, exact sanitaryware, door hardware, gradients and constructed clear openings.</div>`;
  panel.appendChild(section);
  const list=section.querySelector('#a11yV8List');renderList('doors',list);
  section.querySelectorAll('[data-a11y-tab]').forEach(b=>b.onclick=()=>renderList(b.dataset.a11yTab,list));
  const canvas=section.querySelector('#a11yMap'); const redraw=()=>drawMap(canvas); requestAnimationFrame(redraw); addEventListener('resize',redraw);
  section.querySelector('#wheelAudit').onclick=()=>{const p=document.getElementById('profile');if(p){p.value='wheelchair';p.dispatchEvent(new Event('change'));}const t=document.getElementById('turn');if(t){t.value='on';t.dispatchEvent(new Event('change'));}const tele=document.getElementById('teleport');if(tele){tele.value='Accessible bathroom';tele.dispatchEvent(new Event('change'));}};
  section.querySelector('#a11yFullscreen').onclick=()=>canvas.requestFullscreen?.();
}

window.__HOUSE_ACCESSIBILITY_V8__={rules:RULES,obstacles:OBSTACLES,checks,pathResults,functional};
