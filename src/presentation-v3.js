import { HOUSE_SPECS, ROOM_NOTES } from './specifications.js';

const panel=document.querySelector('.panel');
const teleport=document.getElementById('teleport');
const sceneLabel=document.getElementById('sceneLabel');

function section(title, html){
  const el=document.createElement('div'); el.className='section';
  el.innerHTML=`<div class="section-title">${title}</div>${html}`;
  panel.appendChild(el); return el;
}

const tour=section('Presentation', `
  <div class="grid">
    <button id="guidedTour">Start guided tour</button>
    <button id="fullscreen" class="secondary">Fullscreen</button>
  </div>
  <div class="row"><label>Scene info</label><select id="sceneInfo"><option value="on">Show</option><option value="off">Hide</option></select></div>
  <div id="roomNote" class="spec-card">Finished-concept presentation mode.</div>
`);

const specEl=section('House specification', `
  <div class="row"><label>Category</label><select id="specCategory"></select></div>
  <div id="specList" class="spec-list"></div>
`);

const style=document.createElement('style');
style.textContent=`
.spec-card{font-size:12px;line-height:1.5;padding:10px 11px;border-radius:10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08)}
.spec-list{display:grid;gap:6px}.spec-row{display:grid;grid-template-columns:42% 58%;gap:8px;padding:7px 8px;border-radius:8px;background:rgba(255,255,255,.055);font-size:11px;line-height:1.35}.spec-row b{opacity:.75}.tour-toast{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:9;max-width:min(680px,calc(100vw - 30px));padding:12px 16px;border-radius:12px;background:rgba(10,13,18,.82);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);color:#fff;font:600 13px/1.45 Inter,system-ui,sans-serif;pointer-events:none;text-align:center}.panel.compact{opacity:.12;transition:opacity .2s}.panel.compact:hover{opacity:1}
`;
document.head.appendChild(style);

const specCategory=document.getElementById('specCategory'), specList=document.getElementById('specList');
Object.keys(HOUSE_SPECS).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k;specCategory.appendChild(o);});
function renderSpecs(){specList.innerHTML=HOUSE_SPECS[specCategory.value].map(([a,b])=>`<div class="spec-row"><b>${a}</b><span>${b}</span></div>`).join('');}
specCategory.onchange=renderSpecs; renderSpecs();

function updateRoomNote(name){
  const note=ROOM_NOTES[name]||'Premium accessible EuroMax finished-concept visualisation.';
  document.getElementById('roomNote').textContent=note;
  if(document.getElementById('sceneInfo').value==='on') sceneLabel.textContent=`${name} · ${note}`;
}
teleport.addEventListener('change',()=>updateRoomNote(teleport.value));
document.querySelectorAll('.quick').forEach(b=>b.addEventListener('click',()=>updateRoomNote(b.dataset.go)));
document.getElementById('sceneInfo').onchange=e=>sceneLabel.style.display=e.target.value==='on'?'block':'none';

document.getElementById('fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();

const toast=document.createElement('div');toast.className='tour-toast';toast.style.display='none';document.body.appendChild(toast);
const sequence=[
  ['Entrance',4500,'Tall entrance, step-free threshold and wide central circulation.'],
  ['Living',6500,'The main showpiece: panoramic glazing, marble-look floor, mood lighting and raised feature ceiling.'],
  ['Kitchen',6000,'Premium kitchen and island with generous accessible circulation.'],
  ['Accessible bedroom',5200,'Extra wheelchair circulation with oak herringbone flooring.'],
  ['Accessible bathroom',6000,'Level wet room, roll-in shower and 1.50 m turning-space design intent.'],
  ['Main bedroom',4800,'Warm private suite with oak herringbone and tall architectural doors.'],
  ['Office',4200,'Dedicated office with fitted furniture and oak floor.'],
  ['Terrace',5800,'Flush indoor-outdoor transition under the pergola with architectural lighting.'],
  ['Pool',6500,'8 × 4 m pool with automatic slatted cover and accessible poolside route.'],
  ['Garden',6500,'Landscaped ~1,200 m² plot, privacy hedging, trees, level paths and driveway.'],
];
let tourToken=0;
function selectAndDispatch(id,value){const el=document.getElementById(id);if(!el)return;el.value=value;el.dispatchEvent(new Event('change'));}
async function runTour(){
  const token=++tourToken; document.getElementById('guidedTour').textContent='Stop guided tour'; panel.classList.add('compact');
  selectAndDispatch('doors','open'); selectAndDispatch('blinds','open'); selectAndDispatch('poolCover','open'); selectAndDispatch('mood','evening');
  for(const [name,ms,text] of sequence){
    if(token!==tourToken)break;
    teleport.value=name;teleport.dispatchEvent(new Event('change'));updateRoomNote(name);toast.textContent=text;toast.style.display='block';
    await new Promise(r=>setTimeout(r,ms));
  }
  if(token===tourToken){toast.textContent='Tour complete — continue exploring freely.';setTimeout(()=>toast.style.display='none',3500);}
  panel.classList.remove('compact');document.getElementById('guidedTour').textContent='Start guided tour';
}
document.getElementById('guidedTour').onclick=()=>{if(document.getElementById('guidedTour').textContent.startsWith('Stop')){tourToken++;toast.style.display='none';panel.classList.remove('compact');document.getElementById('guidedTour').textContent='Start guided tour';}else runTour();};

updateRoomNote('Entrance');
