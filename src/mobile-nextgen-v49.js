import * as THREE from 'three';
import { createAnamarijaArchitectureShell } from './architecture-shell-v1.js';
import { createPremiumOpenPlanZone } from './premium-zone-v1.js';
import { createPremiumLighting } from './premium-lighting-v1.js';
import { createHeroInterior } from './hero-interior-v1.js';
import { createHeroFinishV40 } from './hero-finish-v40.js';
import { createHeroZoneV42 } from './hero-zone-v42.js';
import { createPrivateRoomDetail } from './private-room-detail-v1.js';
import { createPoolGardenDetail } from './pool-garden-detail-v1.js';
import { TELEPORTS } from './house-config.js';

const $=s=>document.querySelector(s);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xc9d4d8);
scene.fog=new THREE.Fog(0xc9d4d8,52,130);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.05,180);
camera.rotation.order='YXZ';

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.04;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const hemi=new THREE.HemisphereLight(0xeaf3ff,0x665f57,.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,2.8);sun.position.set(-11,16,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-25;sun.shadow.camera.right=25;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;sun.shadow.bias=-.0002;scene.add(sun);

createAnamarijaArchitectureShell({THREE,scene});
createPremiumOpenPlanZone({THREE,scene});
createHeroInterior({THREE,scene});
createHeroFinishV40({THREE,scene});
createHeroZoneV42({THREE,scene});
createPrivateRoomDetail({THREE,scene});
const premiumLighting=createPremiumLighting({THREE,scene,renderer});
createPoolGardenDetail({THREE,scene});
premiumLighting.root.traverse(o=>{if(o.isLight)o.userData.baseIntensity=o.intensity});

let viewMode='walking';
let currentRoom='Living Room';
const status=$('#status');
function jumpTo(name){
  const v=TELEPORTS[name]; if(!v)return;
  const [x,,z,yaw]=v;camera.position.set(x,viewMode==='wheelchair'?1.20:1.62,z);camera.rotation.set(0,yaw||0,0);
  currentRoom=name;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  if(status)status.textContent=name;
}
window.jumpToMobileRoom=jumpTo;

document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>jumpTo(b.dataset.view)));
jumpTo('Living Room');

const presets={day:{bg:0xc9d4d8,fog:0xc9d4d8,exp:1.04,sun:2.8,hemi:.7,premium:1},evening:{bg:0x8b7d72,fog:0x8b7d72,exp:.97,sun:1.1,hemi:.45,premium:1.35},night:{bg:0x1d2530,fog:0x1d2530,exp:.86,sun:.16,hemi:.22,premium:1.72}};
let timeMode='day';
function setTime(mode){const p=presets[mode]||presets.day;timeMode=mode;scene.background.setHex(p.bg);scene.fog.color.setHex(p.fog);renderer.toneMappingExposure=p.exp;sun.intensity=p.sun;hemi.intensity=p.hemi;premiumLighting.root.traverse(o=>{if(o.isLight&&Number.isFinite(o.userData.baseIntensity))o.intensity=o.userData.baseIntensity*p.premium});$('#time-label').textContent=mode[0].toUpperCase()+mode.slice(1);}
$('#time-toggle').addEventListener('click',()=>setTime(timeMode==='day'?'evening':timeMode==='evening'?'night':'day'));
$('#mode-toggle').addEventListener('click',()=>{viewMode=viewMode==='walking'?'wheelchair':'walking';$('#mode-label').textContent=viewMode==='walking'?'Walk':'Wheelchair';jumpTo(currentRoom)});
setTime('day');

const sheet=$('#sheet');$('#menu-toggle').addEventListener('click',()=>sheet.classList.add('open'));$('#sheet-close').addEventListener('click',()=>sheet.classList.remove('open'));sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.classList.remove('open')});

let joyId=null,joyX=0,joyY=0;const joy=$('#joystick'),knob=$('#joystick-knob');
function setJoy(x,y){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=x-cx,dy=y-cy;const max=r.width*.31,len=Math.hypot(dx,dy)||1;if(len>max){dx*=max/len;dy*=max/len}joyX=dx/max;joyY=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`}
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);setJoy(e.clientX,e.clientY);e.preventDefault()});joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)setJoy(e.clientX,e.clientY)});function joyEnd(e){if(e.pointerId!==joyId)return;joyId=null;joyX=joyY=0;knob.style.transform='translate(0,0)'}joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);

let lookId=null,lastX=0,lastY=0;renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX<innerWidth*.38&&e.clientY>innerHeight*.60)return;lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId)});renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;camera.rotation.y-=dx*.0042;camera.rotation.x-=dy*.0038;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x,-1.25,1.25)});const endLook=e=>{if(e.pointerId===lookId)lookId=null};renderer.domElement.addEventListener('pointerup',endLook);renderer.domElement.addEventListener('pointercancel',endLook);

const clock=new THREE.Clock(),forward=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),move=new THREE.Vector3();
function tick(){requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.05);if(Math.abs(joyX)>.08||Math.abs(joyY)>.08){camera.getWorldDirection(forward);forward.y=0;forward.normalize();right.crossVectors(forward,up).normalize();move.set(0,0,0).addScaledVector(forward,-joyY).addScaledVector(right,joyX);if(move.lengthSq()>1)move.normalize();move.multiplyScalar((viewMode==='wheelchair'?1.45:1.95)*dt);camera.position.add(move);camera.position.x=THREE.MathUtils.clamp(camera.position.x,-14,14);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-19,19);camera.position.y=viewMode==='wheelchair'?1.20:1.62}renderer.render(scene,camera)}
tick();

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.35))});
$('#loading').classList.add('hidden');
