import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/PointerLockControls.js';
import { HOUSE, ROOMS, WALLS, DOORS } from './house-config.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd7ea);
scene.fog = new THREE.Fog(0xbfd7ea, 35, 90);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.05, 150);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
const crosshair = document.getElementById('crosshair');
controls.addEventListener('lock',()=>crosshair.style.display='block');
controls.addEventListener('unlock',()=>crosshair.style.display='none');
document.getElementById('enter').onclick = () => controls.lock();

const hemi = new THREE.HemisphereLight(0xffffff,0x68717b,1.6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff,3.2); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const mats = {
  wall: new THREE.MeshStandardMaterial({ color:0xf3f1eb, roughness:.75 }),
  marble: new THREE.MeshStandardMaterial({ color:0xe9e7e0, roughness:.28, metalness:.03 }),
  wood: new THREE.MeshStandardMaterial({ color:0x9c6a43, roughness:.58 }),
  glass: new THREE.MeshPhysicalMaterial({ color:0x8ebed8, transmission:.55, transparent:true, opacity:.42, roughness:.08, metalness:.05 }),
  dark: new THREE.MeshStandardMaterial({ color:0x25272a, roughness:.45 }),
  water: new THREE.MeshPhysicalMaterial({ color:0x3d9bc3, transparent:true, opacity:.72, roughness:.12, transmission:.18 }),
};

function box(x,y,z,w,h,d,mat,cast=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; scene.add(m); return m;
}

box(0,-0.08,0,35,.14,30,new THREE.MeshStandardMaterial({color:0x8b9a7a,roughness:1}),false);
box(0,0,0,HOUSE.width,.10,HOUSE.depth,mats.marble,false);
box(5.5,0,-7.0,9,.08,4.0,new THREE.MeshStandardMaterial({color:0xcfc8bb,roughness:.8}),false);

for (const r of ROOMS){
  const m = r.finish==='wood'?mats.wood:mats.marble;
  box(r.x,0.055,r.z,r.w,.025,r.d,m,false);
}

const t=HOUSE.wallThickness, H=3.0;
box(0,H/2,5,HOUSE.width,H,t,mats.wall);
box(-10,H/2,0,t,H,HOUSE.depth,mats.wall);
box(-3.5,H/2,-5,13,H,t,mats.wall);
box(6.5,1.45,-5,7,2.9,.06,mats.glass,false);
box(10,1.45,0,.06,2.9,HOUSE.depth,mats.glass,false);

const wallObstacles=[];
function segmentWall([x1,z1,x2,z2,h]){
  const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),ang=Math.atan2(dz,dx);
  const m=box((x1+x2)/2,h/2,(z1+z2)/2,len,h,t,mats.wall);
  m.rotation.y=-ang; wallObstacles.push({x1,z1,x2,z2,thickness:t});
}
WALLS.forEach(segmentWall);

for(const d of DOORS){
  const g=new THREE.Group();
  const side=.07;
  const a=box(0,0,0,side,d.h,.12,mats.dark); scene.remove(a); a.position.set(-d.w/2,d.h/2,0); g.add(a);
  const b=a.clone(); b.position.x=d.w/2; g.add(b);
  const c=box(0,0,0,d.w,.08,.12,mats.dark); scene.remove(c); c.position.set(0,d.h,0); g.add(c);
  g.position.set(d.x,0,d.z); g.rotation.y=d.rot; scene.add(g);
}

box(6.2,.45,-.3,3.0,.9,1.0,new THREE.MeshStandardMaterial({color:0xf5f3ed,roughness:.35}));
box(7.2,.38,2.6,2.6,.76,1.1,new THREE.MeshStandardMaterial({color:0x655f59,roughness:.6}));
box(6.5,.28,-3.2,3.4,.56,1.2,new THREE.MeshStandardMaterial({color:0xd8d1c7,roughness:.72}));

box(5.5,-.22,-11.0,HOUSE.pool.width,.4,HOUSE.pool.depth,new THREE.MeshStandardMaterial({color:0xe6e6e2,roughness:.9}),false);
box(5.5,-.02,-11.0,HOUSE.pool.width-.35,.08,HOUSE.pool.depth-.35,mats.water,false);

function label(text,x,z,y=0.08){
  const c=document.createElement('canvas'); c.width=512; c.height=128; const ctx=c.getContext('2d');
  ctx.fillStyle='rgba(15,18,22,.72)'; ctx.fillRect(0,0,512,128); ctx.fillStyle='#fff'; ctx.font='42px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,256,64);
  const tex=new THREE.CanvasTexture(c); const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false})); spr.scale.set(2.4,.6,1); spr.position.set(x,y,z); scene.add(spr);
}
ROOMS.forEach(r=>label(r.name,r.x,r.z));

const turnMat=new THREE.MeshBasicMaterial({color:0x23a6d5,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false});
const turningCircle=new THREE.Mesh(new THREE.CircleGeometry(.75,64),turnMat); turningCircle.rotation.x=-Math.PI/2; turningCircle.position.y=.09; turningCircle.visible=false; scene.add(turningCircle);

let profile='walk';
const profileSel=document.getElementById('profile');
profileSel.onchange=()=>{profile=profileSel.value; camera.position.y=profile==='wheelchair'?1.15:1.65;};
document.getElementById('turn').onchange=e=>turningCircle.visible=e.target.value==='on';

camera.position.set(-0.2,1.65,-4.4); camera.lookAt(0,1.55,0);

function pointSegDist(px,pz,x1,z1,x2,z2){
  const vx=x2-x1,vz=z2-z1, wx=px-x1,wz=pz-z1; const c1=vx*wx+vz*wz; if(c1<=0)return Math.hypot(px-x1,pz-z1);
  const c2=vx*vx+vz*vz; if(c2<=c1)return Math.hypot(px-x2,pz-z2); const b=c1/c2; return Math.hypot(px-(x1+b*vx),pz-(z1+b*vz));
}
function collides(x,z){
  const radius=profile==='wheelchair'?0.42:0.28;
  if(x<-10+radius||x>10-radius||z<-5+radius||z>5-radius) return true;
  return wallObstacles.some(w=>pointSegDist(x,z,w.x1,w.z1,w.x2,w.z2)<radius+w.thickness/2);
}

const pressed=new Set();
addEventListener('keydown',e=>pressed.add(e.code)); addEventListener('keyup',e=>pressed.delete(e.code));
let last=performance.now();
function updateMovement(){
  if(!controls.isLocked) return;
  const now=performance.now(), dt=Math.min(.05,(now-last)/1000); last=now;
  const sprint=pressed.has('ShiftLeft')||pressed.has('ShiftRight'); const speed=(profile==='wheelchair'?1.5:2.5)*(sprint?1.6:1);
  let f=0,s=0; if(pressed.has('KeyW'))f+=1; if(pressed.has('KeyS'))f-=1; if(pressed.has('KeyD'))s+=1; if(pressed.has('KeyA'))s-=1;
  if(!f&&!s) return;
  const old=camera.position.clone(); const forward=new THREE.Vector3(); camera.getWorldDirection(forward); forward.y=0; forward.normalize(); const right=new THREE.Vector3().crossVectors(forward,camera.up).normalize();
  const v=new THREE.Vector3().addScaledVector(forward,f).addScaledVector(right,s).normalize().multiplyScalar(speed*dt); camera.position.add(v); camera.position.y=profile==='wheelchair'?1.15:1.65;
  if(collides(camera.position.x,camera.position.z)) camera.position.copy(old);
}

function setTime(hour){
  const a=(hour/24)*Math.PI*2-Math.PI/2; const elev=Math.sin(a); sun.position.set(Math.cos(a)*24,Math.max(1,elev*28),Math.sin(a)*20);
  const daylight=THREE.MathUtils.clamp((elev+.12)*2.4,.08,1); sun.intensity=.25+3.1*daylight; hemi.intensity=.35+1.4*daylight;
  const sky=new THREE.Color().lerpColors(new THREE.Color(0x090d19),new THREE.Color(0xbfd7ea),daylight); scene.background=sky; scene.fog.color.copy(sky);
}
const time=document.getElementById('time'); time.oninput=()=>setTime(Number(time.value)); setTime(14);

function animate(){ requestAnimationFrame(animate); updateMovement(); turningCircle.position.set(camera.position.x,.09,camera.position.z); renderer.render(scene,camera); }
animate();

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
