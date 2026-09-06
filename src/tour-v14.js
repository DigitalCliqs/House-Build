import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';
import { TOUR_SCENES, TOUR_META } from './tour-manifest-v14.js';

const byId=Object.fromEntries(TOUR_SCENES.map(s=>[s.id,s]));
const stage=document.getElementById('stage');
const title=document.getElementById('roomTitle');
const menu=document.getElementById('roomMenu');
const drawer=document.getElementById('drawer');
const floorplan=document.getElementById('floorplan');
const floorplanImg=document.getElementById('floorplanImg');
const assetState=document.getElementById('assetState');
const hotspotLayer=document.getElementById('hotspots');

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.domElement.style.position='absolute';
renderer.domElement.style.inset='0';
stage.prepend(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.01,10);
const cubeLoader=new THREE.CubeTextureLoader();

let current=null;
let yaw=0,pitch=0;
let dragging=false,lastX=0,lastY=0;
let accessibilityMode=false;
let pointerId=null;
const hotspots=[];

function setStatus(text,ok=false){if(!assetState)return;assetState.textContent=text;assetState.dataset.ok=ok?'1':'0';}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function applyCamera(){
  pitch=clamp(pitch,-Math.PI/2+.03,Math.PI/2-.03);
  camera.rotation.order='YXZ';
  camera.rotation.y=yaw;
  camera.rotation.x=pitch;
}

function cubeUrls(s){return [s.cube.px,s.cube.nx,s.cube.py,s.cube.ny,s.cube.pz,s.cube.nz];}
function loadCube(s){
  return new Promise((resolve,reject)=>{
    cubeLoader.load(cubeUrls(s),tex=>{tex.colorSpace=THREE.SRGBColorSpace;resolve(tex)},undefined,reject);
  });
}

function clearHotspots(){hotspots.splice(0).forEach(h=>h.el.remove());}
function linkDirection(yaw,pitch){
  const cp=Math.cos(pitch);
  return new THREE.Vector3(Math.sin(yaw)*cp,Math.sin(pitch),-Math.cos(yaw)*cp);
}
function buildHotspots(s){
  clearHotspots();
  for(const link of s.links||[]){
    const target=byId[link.to]; if(!target)continue;
    const b=document.createElement('button'); b.className='hotspot'; b.textContent=target.label;
    b.onclick=e=>{e.stopPropagation();go(link.to)};
    hotspotLayer.appendChild(b);
    hotspots.push({el:b,dir:linkDirection(link.yaw||0,link.pitch||0)});
  }
}
function projectHotspots(){
  const v=new THREE.Vector3();
  for(const h of hotspots){
    v.copy(h.dir).project(camera);
    const visible=v.z<1 && Math.abs(v.x)<=1.15 && Math.abs(v.y)<=1.15;
    h.el.style.display=visible?'block':'none';
    if(visible){h.el.style.left=`${(v.x*.5+.5)*100}%`;h.el.style.top=`${(-v.y*.5+.5)*100}%`;}
  }
}

async function go(id,push=true){
  const s=byId[id]; if(!s)return;
  if(push)history.replaceState(null,'',`#${id}`);
  title.textContent=s.label;
  current=s;yaw=0;pitch=0;applyCamera();
  setStatus(`Loading six-axis ${TOUR_META.cubeFaceMinimum}px cube…`,false);
  try{
    const tex=await loadCube(s);
    if(scene.background&&scene.background.dispose)scene.background.dispose();
    scene.background=tex;
    setStatus('Full six-axis panorama loaded',true);
  }catch(err){
    scene.background=new THREE.Color(0x171a1e);
    setStatus(`360° asset set missing for ${s.label} — requires six ${TOUR_META.cubeFaceMinimum}×${TOUR_META.cubeFaceMinimum} faces`,false);
  }
  buildHotspots(s);
  document.querySelectorAll('[data-scene]').forEach(el=>el.classList.toggle('active',el.dataset.scene===id));
  drawer.classList.remove('open');
}

function buildMenu(){
  menu.innerHTML='';
  for(const s of TOUR_SCENES){
    const b=document.createElement('button');b.dataset.scene=s.id;b.textContent=s.label;b.onclick=()=>go(s.id);menu.appendChild(b);
  }
}

stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('button'))return;
  dragging=true;pointerId=e.pointerId;lastX=e.clientX;lastY=e.clientY;stage.setPointerCapture?.(e.pointerId);
});
stage.addEventListener('pointermove',e=>{
  if(!dragging||e.pointerId!==pointerId)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
  yaw-=dx*0.0055;pitch-=dy*0.0055;applyCamera();
});
function stopDrag(e){if(e.pointerId!==pointerId)return;dragging=false;pointerId=null;}
stage.addEventListener('pointerup',stopDrag);stage.addEventListener('pointercancel',stopDrag);
stage.addEventListener('wheel',e=>{camera.fov=clamp(camera.fov+e.deltaY*.03,45,90);camera.updateProjectionMatrix()},{passive:true});

window.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')yaw+=.08;
  if(e.key==='ArrowRight')yaw-=.08;
  if(e.key==='ArrowUp')pitch+=.06;
  if(e.key==='ArrowDown')pitch-=.06;
  applyCamera();
});

document.getElementById('menuBtn').onclick=()=>drawer.classList.toggle('open');
document.getElementById('closeDrawer').onclick=()=>drawer.classList.remove('open');
document.getElementById('planBtn').onclick=()=>{floorplan.classList.add('open');floorplanImg.src=TOUR_META.floorplan};
document.getElementById('closePlan').onclick=()=>floorplan.classList.remove('open');
document.getElementById('accessBtn').onclick=()=>{accessibilityMode=!accessibilityMode;document.body.classList.toggle('accessibility',accessibilityMode);document.getElementById('accessBtn').textContent=accessibilityMode?'Wheelchair view ✓':'Wheelchair view'};
document.getElementById('fullBtn').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{}};

buildMenu();document.getElementById('projectTitle').textContent=TOUR_META.title;document.getElementById('projectSub').textContent=TOUR_META.subtitle;
const initial=location.hash.slice(1)&&byId[location.hash.slice(1)]?location.hash.slice(1):TOUR_META.first;go(initial,false);

function animate(){requestAnimationFrame(animate);projectHotspots();renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
