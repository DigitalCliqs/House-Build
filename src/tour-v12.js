import { TOUR_SCENES, TOUR_META } from './tour-manifest-v12.js';

const byId = Object.fromEntries(TOUR_SCENES.map(s=>[s.id,s]));
const stage = document.getElementById('stage');
const imgA = document.getElementById('sceneA');
const imgB = document.getElementById('sceneB');
const title = document.getElementById('roomTitle');
const menu = document.getElementById('roomMenu');
const hotspots = document.getElementById('hotspots');
const drawer = document.getElementById('drawer');
const floorplan = document.getElementById('floorplan');
const floorplanImg = document.getElementById('floorplanImg');
const assetState = document.getElementById('assetState');

let current = null;
let active = imgA;
let standby = imgB;
let yaw = 0;
let pitch = 0;
let zoom = 1.04;
let dragging = false;
let x0 = 0;
let y0 = 0;
let yaw0 = 0;
let pitch0 = 0;
let accessibilityMode = false;

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function applyView(){
  const tx = yaw * 7.5;
  const ty = pitch * 5.2;
  active.style.transform = `translate3d(${tx}%,${ty}%,0) scale(${zoom})`;
}

function setAssetState(ok){
  if(!assetState) return;
  assetState.textContent = ok ? 'Photoreal panorama loaded' : 'Photoreal panorama asset not published yet';
  assetState.dataset.ok = ok ? '1' : '0';
}

function makeHotspots(scene){
  hotspots.innerHTML='';
  const links = scene.next || [];
  links.forEach((id,i)=>{
    const target=byId[id]; if(!target) return;
    const b=document.createElement('button');
    b.className='hotspot';
    b.textContent=target.label;
    const angle=(i/(Math.max(links.length,1)))*Math.PI*2 - Math.PI/2;
    const rx=32*Math.cos(angle), ry=24*Math.sin(angle);
    b.style.left=`calc(50% + ${rx}%)`;
    b.style.top=`calc(50% + ${ry}%)`;
    b.onclick=e=>{e.stopPropagation(); go(id)};
    hotspots.appendChild(b);
  });
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const im=new Image(); im.decoding='async'; im.onload=()=>resolve(im); im.onerror=reject; im.src=src;
  });
}

async function go(id, push=true){
  const scene=byId[id]; if(!scene) return;
  if(push) history.replaceState(null,'',`#${id}`);
  title.textContent=scene.label;
  yaw=0; pitch=0; zoom=1.04;
  standby.classList.remove('ready');
  standby.src='';
  try{
    const loaded=await loadImage(scene.image);
    standby.src=loaded.src;
    standby.style.transform='translate3d(0,0,0) scale(1.04)';
    requestAnimationFrame(()=>standby.classList.add('ready'));
    setTimeout(()=>{
      active.classList.remove('ready');
      const tmp=active; active=standby; standby=tmp;
      applyView();
    },260);
    setAssetState(true);
  }catch(err){
    setAssetState(false);
    standby.removeAttribute('src');
    standby.style.background='radial-gradient(circle at 50% 45%,#3a4148 0,#1f2429 70%)';
    standby.classList.add('ready');
    setTimeout(()=>{ active.classList.remove('ready'); const tmp=active; active=standby; standby=tmp; },180);
  }
  current=scene;
  makeHotspots(scene);
  document.querySelectorAll('[data-scene]').forEach(el=>el.classList.toggle('active',el.dataset.scene===id));
  drawer.classList.remove('open');
}

function buildMenu(){
  menu.innerHTML='';
  TOUR_SCENES.forEach(scene=>{
    const b=document.createElement('button');
    b.dataset.scene=scene.id;
    b.textContent=scene.label;
    b.onclick=()=>go(scene.id);
    menu.appendChild(b);
  });
}

function gestureStart(e){
  if(e.target.closest('button')) return;
  dragging=true; const p=e.touches?e.touches[0]:e; x0=p.clientX; y0=p.clientY; yaw0=yaw; pitch0=pitch;
}
function gestureMove(e){
  if(!dragging) return;
  const p=e.touches?e.touches[0]:e;
  yaw=clamp(yaw0+(p.clientX-x0)/innerWidth*1.15,-1,1);
  pitch=clamp(pitch0+(p.clientY-y0)/innerHeight*.85,-.75,.75);
  applyView(); if(e.cancelable)e.preventDefault();
}
function gestureEnd(){dragging=false;}

stage.addEventListener('pointerdown',gestureStart);
stage.addEventListener('pointermove',gestureMove);
stage.addEventListener('pointerup',gestureEnd);
stage.addEventListener('pointercancel',gestureEnd);
stage.addEventListener('touchstart',gestureStart,{passive:false});
stage.addEventListener('touchmove',gestureMove,{passive:false});
stage.addEventListener('touchend',gestureEnd);
stage.addEventListener('wheel',e=>{zoom=clamp(zoom-e.deltaY*.00035,1.0,1.22);applyView()},{passive:true});

let pinch=0, pinchZoom=zoom;
stage.addEventListener('touchstart',e=>{if(e.touches.length===2){pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);pinchZoom=zoom;}},{passive:true});
stage.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);zoom=clamp(pinchZoom*d/pinch,1,1.22);applyView();}},{passive:true});

window.addEventListener('keydown',e=>{
  if(!current) return;
  if(e.key==='ArrowLeft') yaw=clamp(yaw-.08,-1,1);
  if(e.key==='ArrowRight') yaw=clamp(yaw+.08,-1,1);
  if(e.key==='ArrowUp') pitch=clamp(pitch-.06,-.75,.75);
  if(e.key==='ArrowDown') pitch=clamp(pitch+.06,-.75,.75);
  applyView();
});

document.getElementById('menuBtn').onclick=()=>drawer.classList.toggle('open');
document.getElementById('closeDrawer').onclick=()=>drawer.classList.remove('open');
document.getElementById('planBtn').onclick=()=>{floorplan.classList.add('open'); floorplanImg.src=TOUR_META.floorplan};
document.getElementById('closePlan').onclick=()=>floorplan.classList.remove('open');
document.getElementById('accessBtn').onclick=()=>{
  accessibilityMode=!accessibilityMode;
  document.body.classList.toggle('accessibility',accessibilityMode);
  document.getElementById('accessBtn').textContent=accessibilityMode?'Accessibility ✓':'Accessibility';
};
document.getElementById('fullBtn').onclick=async()=>{
  try{ if(!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); }catch{}
};

buildMenu();
document.getElementById('projectTitle').textContent=TOUR_META.title;
document.getElementById('projectSub').textContent=TOUR_META.subtitle;
const initial=location.hash.slice(1)&&byId[location.hash.slice(1)]?location.hash.slice(1):TOUR_META.first;
go(initial,false);
