import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createAnamarijaArchitectureShell } from './architecture-shell-v1.js';
import { createPremiumOpenPlanZone } from './premium-zone-v1.js';
import { createPremiumLighting } from './premium-lighting-v1.js';
import { applyProductionMaterialPass } from './production-material-pass-v1.js';
import { createHeroInterior } from './hero-interior-v1.js';
import { createPrivateRoomDetail } from './private-room-detail-v1.js';
import { createProductionAssetLayer } from './production-asset-layer-v1.js';
import { createPoolGardenDetail } from './pool-garden-detail-v1.js';
import { ARCHITECTURE_SPEC } from './architecture-spec-v1.js';
import { auditArchitecture, reportArchitectureAudit } from './architecture-qa-v1.js';
import { createAnamarijaNextgenEngine } from './nextgen-engine-v1.js';
import { TELEPORTS } from './house-config.js';

const canvasHost=document.getElementById('app'),statusEl=document.getElementById('status'),enterBtn=document.getElementById('enter'),modeBtn=document.getElementById('mode'),assetEl=document.getElementById('asset-state'),timeEl=document.getElementById('time'),fullscreenBtn=document.getElementById('fullscreen');
const mobileButtons={up:document.getElementById('move-up'),down:document.getElementById('move-down'),left:document.getElementById('move-left'),right:document.getElementById('move-right')};
window.addEventListener('error',e=>{statusEl.style.display='block';statusEl.textContent=`Startup error: ${e.message||'unknown error'}`});
window.addEventListener('unhandledrejection',e=>{statusEl.style.display='block';statusEl.textContent=`Startup error: ${e.reason?.message||e.reason||'unknown error'}`});

const qa=reportArchitectureAudit(auditArchitecture(ARCHITECTURE_SPEC));
if(!qa.ok){statusEl.style.display='block';statusEl.textContent='Architecture QA found an envelope error — see console';}

const isTouch=matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0;
let mobileActive=false;
if(isTouch)enterBtn.textContent='Enter';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xc9d4d8);
scene.fog=new THREE.Fog(0xc9d4d8,52,130);
const camera=new THREE.PerspectiveCamera(67,innerWidth/innerHeight,.04,180);
camera.position.set(.5,1.65,7.15);
camera.rotation.order='YXZ';
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1;
canvasHost.appendChild(renderer.domElement);

const controls=new PointerLockControls(camera,renderer.domElement);
enterBtn.addEventListener('click',()=>{
  if(isTouch){
    mobileActive=!mobileActive;
    document.body.classList.toggle('mobile-active',mobileActive);
    enterBtn.textContent=mobileActive?'Exit':'Enter';
    statusEl.textContent=mobileActive?'':'Tap Enter to start';
    return;
  }
  try{controls.lock()}catch(e){statusEl.textContent=`Pointer lock unavailable: ${e?.message||e}`}
});
controls.addEventListener('lock',()=>statusEl.textContent='WASD to move · mouse to look');
controls.addEventListener('unlock',()=>statusEl.textContent='Choose a room or enter the walkthrough');

const sun=new THREE.DirectionalLight(0xfff0d8,3);
sun.position.set(-11,16,9);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-26;
sun.shadow.camera.right=26;
sun.shadow.camera.top=26;
sun.shadow.camera.bottom=-26;
sun.shadow.bias=-.0002;
scene.add(sun);

createAnamarijaArchitectureShell({THREE,scene});
createPremiumOpenPlanZone({THREE,scene});
createHeroInterior({THREE,scene});
createPrivateRoomDetail({THREE,scene});
const premiumLighting=createPremiumLighting({THREE,scene,renderer});
createPoolGardenDetail({THREE,scene});
premiumLighting.root.traverse(o=>{if(o.isLight)o.userData.v40BaseIntensity=o.intensity});

applyProductionMaterialPass({THREE,scene,renderer}).catch(e=>console.warn('PBR material pass fallback',e));

async function loadRuntimeRegistry(){
  const r=await fetch('./assets/asset-registry.json',{cache:'no-store'});
  if(!r.ok)throw new Error(`asset registry HTTP ${r.status}`);
  const raw=await r.json(),paths={};
  for(const[id,e]of Object.entries(raw.models||{}))if(e?.path)paths[id]=e.path;
  const ready=Object.values(raw.models||{}).filter(e=>e?.status==='available').length,planned=Object.values(raw.models||{}).filter(e=>e?.status!=='available').length;
  assetEl.textContent=`${ready} production assets · ${planned} staged`;
  return{raw,paths};
}

const registry=await loadRuntimeRegistry().catch(e=>{assetEl.textContent='asset registry unavailable';console.error(e);return{raw:{},paths:{}}});
createProductionAssetLayer({THREE,scene,GLTFLoader,registry:registry.raw,onStatus:e=>{if(e.state==='error')console.warn('Production model failed',e)}});
const engine=createAnamarijaNextgenEngine({THREE,GLTFLoader,scene,camera,renderer,controls,assetRegistry:registry.paths,strictAssets:true,strictMaterials:false,onAssetStatus:e=>{if(e.state==='error')console.warn('Asset load failed',e)}});

let viewMode='walking';
function syncModeLabel(){modeBtn.textContent=viewMode==='walking'?'Wheelchair Mode':'Walking Mode'}
modeBtn.addEventListener('click',()=>{
  viewMode=viewMode==='walking'?'wheelchair':'walking';
  engine.setViewHeight(viewMode);
  syncModeLabel();
  statusEl.textContent=`${viewMode==='walking'?'Walking':'Wheelchair'} view active`;
});
syncModeLabel();

function setActiveView(name){
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===name));
}
function jumpTo(name){
  const view=TELEPORTS[name];
  if(!view)return;
  const [x,,z,yaw]=view;
  camera.position.set(x,viewMode==='wheelchair'?1.20:1.65,z);
  camera.rotation.set(0,yaw||0,0);
  setActiveView(name);
  statusEl.textContent=`${name} · ${viewMode==='wheelchair'?'wheelchair':'walking'} viewpoint`;
}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>jumpTo(btn.dataset.view)));

const presentationPresets={
  day:{bg:0xc9d4d8,fog:0xc9d4d8,exposure:1.08,sun:3,premium:1},
  evening:{bg:0x81786f,fog:0x81786f,exposure:.98,sun:1.25,premium:1.35},
  night:{bg:0x1d2530,fog:0x1d2530,exposure:.82,sun:.18,premium:1.72},
};
function applyTimeOfDay(mode){
  const p=presentationPresets[mode]||presentationPresets.day;
  scene.background.setHex(p.bg);
  scene.fog.color.setHex(p.fog);
  renderer.toneMappingExposure=p.exposure;
  sun.intensity=p.sun;
  premiumLighting.root.traverse(o=>{if(o.isLight&&Number.isFinite(o.userData.v40BaseIntensity))o.intensity=o.userData.v40BaseIntensity*p.premium});
  statusEl.textContent=`${mode[0].toUpperCase()+mode.slice(1)} presentation lighting`;
}
timeEl?.addEventListener('change',()=>applyTimeOfDay(timeEl.value));
applyTimeOfDay(timeEl?.value||'day');

fullscreenBtn?.addEventListener('click',async()=>{
  try{
    if(!document.fullscreenElement)await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }catch(e){statusEl.textContent=`Fullscreen unavailable: ${e?.message||e}`}
});
document.addEventListener('fullscreenchange',()=>{if(fullscreenBtn)fullscreenBtn.textContent=document.fullscreenElement?'Exit Fullscreen':'Fullscreen'});

const keys=new Set();
addEventListener('keydown',e=>keys.add(e.code));
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
const touchMove={up:false,down:false,left:false,right:false};
function bindHold(b,k){
  if(!b)return;
  const start=e=>{e.preventDefault();touchMove[k]=true},stop=e=>{e.preventDefault();touchMove[k]=false};
  b.addEventListener('pointerdown',start);b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('pointerleave',stop);
}
Object.entries(mobileButtons).forEach(([k,b])=>bindHold(b,k));

let lookPointerId=null,lastLookX=0,lastLookY=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(!isTouch||!mobileActive)return;lookPointerId=e.pointerId;lastLookX=e.clientX;lastLookY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!isTouch||!mobileActive||e.pointerId!==lookPointerId)return;const dx=e.clientX-lastLookX,dy=e.clientY-lastLookY;lastLookX=e.clientX;lastLookY=e.clientY;camera.rotation.y-=dx*.004;camera.rotation.x-=dy*.004;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x,-Math.PI*.48,Math.PI*.48)});
const endLook=e=>{if(e.pointerId===lookPointerId)lookPointerId=null};
renderer.domElement.addEventListener('pointerup',endLook);renderer.domElement.addEventListener('pointercancel',endLook);

const clock=new THREE.Clock(),forward=new THREE.Vector3(),right=new THREE.Vector3(),intended=new THREE.Vector3(),worldUp=new THREE.Vector3(0,1,0);
function updateMovement(delta){
  if(!(controls.isLocked||(isTouch&&mobileActive)))return;
  const speed=viewMode==='wheelchair'?1.65:2.25;let f=0,r=0;
  if(keys.has('KeyW')||keys.has('ArrowUp')||touchMove.up)f++;
  if(keys.has('KeyS')||keys.has('ArrowDown')||touchMove.down)f--;
  if(keys.has('KeyD')||keys.has('ArrowRight')||touchMove.right)r++;
  if(keys.has('KeyA')||keys.has('ArrowLeft')||touchMove.left)r--;
  if(!f&&!r)return;
  camera.getWorldDirection(forward);forward.y=0;if(forward.lengthSq()<1e-8)forward.set(0,0,-1);forward.normalize();
  right.crossVectors(forward,worldUp).normalize();
  intended.set(0,0,0).addScaledVector(forward,f).addScaledVector(right,r);if(intended.lengthSq()>1)intended.normalize();
  intended.multiplyScalar(speed*Math.min(delta,.05));engine.moveFirstPerson(intended,viewMode);
}
function animate(){requestAnimationFrame(animate);updateMovement(clock.getDelta());renderer.render(scene,camera)}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const wsUrl=new URLSearchParams(location.search).get('ws');
if(wsUrl?.startsWith('wss://')||wsUrl?.startsWith('ws://localhost'))engine.connect(wsUrl,s=>console.log('live scene',s));
if(qa.ok)statusEl.textContent=isTouch?'Choose a room or tap Enter':'Choose a room or enter the walkthrough';
