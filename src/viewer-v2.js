import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/PointerLockControls.js';
import { SITE, HOUSE, POOL, ROOMS, TELEPORTS } from './house-config.js';

// -----------------------------------------------------------------------------
// Anamarija EuroMax finished-concept viewer v2
// Visual design model only — not a construction drawing.
// -----------------------------------------------------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9dbe7);
scene.fog = new THREE.Fog(0xc9dbe7, 45, 120);

const camera = new THREE.PerspectiveCamera(67, innerWidth / innerHeight, 0.04, 220);
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
const crosshair = document.getElementById('crosshair');
controls.addEventListener('lock', () => crosshair.style.display = 'block');
controls.addEventListener('unlock', () => crosshair.style.display = 'none');
document.getElementById('enter').onclick = () => controls.lock();

// -----------------------------------------------------------------------------
// Materials
// -----------------------------------------------------------------------------
function texCanvas(size, paint) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d'); paint(ctx, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

const marbleTex = texCanvas(1024, (ctx,s) => {
  ctx.fillStyle='#f6f4ef'; ctx.fillRect(0,0,s,s);
  for(let i=0;i<28;i++){
    ctx.strokeStyle = i%6===0 ? 'rgba(187,145,82,.30)' : 'rgba(106,114,126,.18)';
    ctx.lineWidth = .8 + Math.random()*2.6;
    ctx.beginPath(); let y=Math.random()*s; ctx.moveTo(-50,y);
    for(let x=-50;x<s+80;x+=46){ y += (Math.random()-.5)*46; ctx.lineTo(x,y); }
    ctx.stroke();
  }
});
marbleTex.repeat.set(3.6,3.6);

const oakTex = texCanvas(1024, (ctx,s) => {
  ctx.fillStyle='#b88758'; ctx.fillRect(0,0,s,s);
  for(let y=-100;y<s+100;y+=62){
    for(let x=-150;x<s+150;x+=128){
      const flip = (((x/128)+(y/62))|0)%2===0;
      ctx.save(); ctx.translate(x,y); ctx.rotate(flip?Math.PI/4:-Math.PI/4);
      ctx.fillStyle = flip ? '#bc8d5f' : '#a97549';
      ctx.fillRect(-58,-9,116,18);
      ctx.strokeStyle='rgba(76,48,28,.32)'; ctx.strokeRect(-58,-9,116,18);
      ctx.restore();
    }
  }
});
oakTex.repeat.set(3.7,3.7);

const grassTex = texCanvas(512,(ctx,s)=>{
  ctx.fillStyle='#70835a'; ctx.fillRect(0,0,s,s);
  for(let i=0;i<4200;i++){
    const g=80+Math.random()*55;
    ctx.fillStyle=`rgba(${40+Math.random()*22},${g},${38+Math.random()*18},.28)`;
    ctx.fillRect(Math.random()*s,Math.random()*s,1,2+Math.random()*3);
  }
});
grassTex.repeat.set(10,13);

const M = {
  wall:new THREE.MeshStandardMaterial({color:0xf4f0e8,roughness:.74}),
  warm:new THREE.MeshStandardMaterial({color:0xe6ded2,roughness:.79}),
  marble:new THREE.MeshPhysicalMaterial({map:marbleTex,roughness:.25,clearcoat:.15,clearcoatRoughness:.18}),
  oak:new THREE.MeshStandardMaterial({map:oakTex,roughness:.56}),
  darkOak:new THREE.MeshStandardMaterial({color:0x4e4037,roughness:.6}),
  glass:new THREE.MeshPhysicalMaterial({color:0xd9eef5,transmission:.78,transparent:true,opacity:.34,roughness:.05,ior:1.45}),
  bronze:new THREE.MeshStandardMaterial({color:0x967b5f,metalness:.72,roughness:.24}),
  black:new THREE.MeshStandardMaterial({color:0x181b1e,roughness:.34,metalness:.2}),
  white:new THREE.MeshStandardMaterial({color:0xf3f0e9,roughness:.3}),
  stone:new THREE.MeshStandardMaterial({color:0xc9c1b5,roughness:.68}),
  grass:new THREE.MeshStandardMaterial({map:grassTex,roughness:1}),
  water:new THREE.MeshPhysicalMaterial({color:0x35a3c7,transparent:true,opacity:.75,roughness:.07,transmission:.25,clearcoat:1,clearcoatRoughness:.08}),
  fabric:new THREE.MeshStandardMaterial({color:0xcfc5b8,roughness:.98}),
  fabricDark:new THREE.MeshStandardMaterial({color:0x6f6962,roughness:.98}),
  green:new THREE.MeshStandardMaterial({color:0x4d6b3f,roughness:.9}),
  soil:new THREE.MeshStandardMaterial({color:0x594637,roughness:1}),
  cover:new THREE.MeshStandardMaterial({color:0xbfc5c8,roughness:.32,metalness:.38}),
  warmLight:new THREE.MeshBasicMaterial({color:0xffd59f}),
};

// -----------------------------------------------------------------------------
// Helpers / collision
// -----------------------------------------------------------------------------
const obstacles=[];
const interactives=[];
const practicalLights=[];
const blinds=[];

function box(x,y,z,w,h,d,mat,cast=true,parent=scene){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z); mesh.castShadow=cast; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cyl(x,y,z,r,h,mat,seg=32,parent=scene){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function addSeg(x1,z1,x2,z2,t=.2){obstacles.push({x1,z1,x2,z2,t});}
function wallX(x1,x2,z,h=3,t=HOUSE.wallThickness,mat=M.wall,collide=true){
  const m=box((x1+x2)/2,h/2,z,Math.abs(x2-x1),h,t,mat);
  if(collide)addSeg(x1,z,x2,z,t); return m;
}
function wallZ(x,z1,z2,h=3,t=HOUSE.wallThickness,mat=M.wall,collide=true){
  const m=box(x,h/2,(z1+z2)/2,t,h,Math.abs(z2-z1),mat);
  if(collide)addSeg(x,z1,x,z2,t); return m;
}
function pointSegDist(px,pz,a,b,c,d){
  const vx=c-a,vz=d-b, wx=px-a,wz=pz-b; const l2=vx*vx+vz*vz;
  if(!l2)return Math.hypot(px-a,pz-b);
  const t=Math.max(0,Math.min(1,(wx*vx+wz*vz)/l2));
  return Math.hypot(px-(a+t*vx),pz-(b+t*vz));
}
function collision(x,z,r){
  if(x<-SITE.width/2+r||x>SITE.width/2-r||z<-SITE.depth/2+r||z>SITE.depth/2-r)return true;
  return obstacles.some(o=>pointSegDist(x,z,o.x1,o.z1,o.x2,o.z2)<r+o.t/2);
}
function pointLight(x,y,z,intensity=1.1,distance=5.2,color=0xffd7a8){
  const l=new THREE.PointLight(color,intensity,distance,2); l.position.set(x,y,z); scene.add(l); practicalLights.push(l); return l;
}
function stripLight(x,y,z,w,d=.035,rot=0){
  const g=new THREE.Group();
  box(0,0,0,w,.025,d,M.warmLight,false,g);
  const l=new THREE.RectAreaLight(0xffd3a2,2.0,w,.12); l.position.set(0,-.03,0); l.rotation.x=-Math.PI/2; g.add(l);
  g.position.set(x,y,z); g.rotation.y=rot; scene.add(g); practicalLights.push(l); return g;
}
function frameWindow(x,y,z,w,h,rot=0){
  const g=new THREE.Group();
  const glass=box(0,h/2,0,w,h,.045,M.glass,false,g);
  const f=.05;
  box(-w/2,h/2,0,f,h+.08,.08,M.black,true,g); box(w/2,h/2,0,f,h+.08,.08,M.black,true,g);
  box(0,0,0,w+.05,f,.08,M.black,true,g); box(0,h,0,w+.05,f,.08,M.black,true,g);
  if(w>2.2){for(let xx=-w/2+w/3;xx<w/2;xx+=w/3)box(xx,h/2,0,.035,h,.07,M.black,true,g);}
  g.position.set(x,y,z); g.rotation.y=rot; scene.add(g); return g;
}
function makeBlind(x,y,z,w,h,rot=0){
  const g=new THREE.Group(); const slats=[];
  for(let yy=0;yy<h;yy+=.09){const s=box(0,yy,0,w,.035,.035,M.bronze,false,g); s.userData.baseY=yy; slats.push(s);}
  g.position.set(x,y,z); g.rotation.y=rot; g.userData={slats,open:true,h}; scene.add(g); blinds.push(g); return g;
}
function animateBlind(g,open){ g.userData.open=open; g.userData.target=open?0:1; }
function makeDoor(x,z,w=1.1,h=2.3,rot=0,label='Door'){
  const pivot=new THREE.Group();
  const slab=box(w/2,h/2,0,w,h,.055,M.white,true,pivot);
  box(w-.12,h*.5,.035,.035,.035,.10,M.bronze,false,pivot);
  pivot.position.set(x-w/2*Math.cos(rot),0,z+w/2*Math.sin(rot)); pivot.rotation.y=rot; scene.add(pivot);
  pivot.userData={kind:'door',label,open:false,target:0,closedRot:rot}; interactives.push(pivot); return pivot;
}

// -----------------------------------------------------------------------------
// Lighting
// -----------------------------------------------------------------------------
const hemi=new THREE.HemisphereLight(0xffffff,0x5c6570,1.25); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff3dd,3.3); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-35; sun.shadow.camera.right=35; sun.shadow.camera.top=35; sun.shadow.camera.bottom=-35; scene.add(sun);

// -----------------------------------------------------------------------------
// Site and landscaping
// -----------------------------------------------------------------------------
box(0,-.18,0,SITE.width,.30,SITE.depth,M.grass,false);
box(0,-.07,19.0,SITE.width,.10,2.0,new THREE.MeshStandardMaterial({color:0x505458,roughness:1}),false);
box(0,-.02,17.65,SITE.width,.06,.72,new THREE.MeshStandardMaterial({color:0xbeb8ae,roughness:.9}),false);
box(7.0,.01,13.5,7.2,.07,7.5,new THREE.MeshStandardMaterial({color:0xbfb5a8,roughness:.78}),false);
box(.55,.02,11.3,2.0,.06,7.8,new THREE.MeshStandardMaterial({color:0xd6cfc4,roughness:.66}),false);

for(let x=-14.2;x<=14.2;x+=.95){ if(Math.abs(x-7)>3.8) box(x,.78,16.8,.85,1.55,.65,M.green,false); box(x,.78,-19.1,.85,1.55,.65,M.green,false); }
for(let z=-18.3;z<16.2;z+=.95){ box(-14.3,.78,z,.65,1.55,.85,M.green,false); box(14.3,.78,z,.65,1.55,.85,M.green,false); }

function tree(x,z,s=1){const g=new THREE.Group(); cyl(0,1.1*s,0,.16*s,2.2*s,new THREE.MeshStandardMaterial({color:0x67503a,roughness:1}),14,g); const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.0*s,2),M.green); c.position.y=2.75*s;c.castShadow=true;g.add(c);g.position.set(x,0,z);scene.add(g);}
[[-11.2,12.2,1.1],[-10.8,-8.5,1.15],[-10.4,-13.2,1.0],[11.2,-5,.95],[11.1,-10.8,1.05],[11.7,9,.9]].forEach(v=>tree(...v));
for(let i=0;i<55;i++){const x=-12+Math.random()*23,z=-15+Math.random()*29;if(Math.abs(x)<9.5&&z>-4&&z<8)continue;const r=.18+Math.random()*.23;const s=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),M.green);s.position.set(x,r*.9,z);scene.add(s);}

// -----------------------------------------------------------------------------
// House floors / envelope
// -----------------------------------------------------------------------------
const hz=HOUSE.z;
box(0,.02,hz,HOUSE.width,.10,HOUSE.depth,M.marble,false);
for(const r of ROOMS) box(r.x,.086,r.z+hz,r.w,.025,r.d,r.finish==='wood'?M.oak:M.marble,false);
box(4.7,.035,-5.95,11.8,.075,4.2,M.stone,false);

const north=hz+HOUSE.depth/2, south=hz-HOUSE.depth/2, west=-HOUSE.width/2, east=HOUSE.width/2;
wallX(west,-.25,north,3.05); wallX(1.18,east,north,3.05);
wallZ(west,south,north,2.85); wallZ(east,south,north,3.05);
wallX(west,-7.9,south,2.8); wallX(-5.0,-2.7,south,2.8); wallX(-.05,1.75,south,3.05); wallX(8.35,east,south,3.05);
frameWindow(-6.45,.15,south-.03,2.7,2.35,Math.PI);
frameWindow(-1.38,.15,south-.03,2.6,2.35,Math.PI);
frameWindow(5.05,.12,south-.04,6.55,2.72,Math.PI);
frameWindow(5.45,.14,north+.03,4.8,2.55,0);
makeBlind(5.05,.14,south-.09,6.55,2.72,Math.PI);
makeBlind(5.45,.14,north+.08,4.8,2.55,0);

// front portal / entry door
box(.48,2.65,north+.08,1.8,.28,.35,M.warm,true);
makeDoor(.47,north-.13,1.32,2.55,0,'Front door');

// interior partitions with generous openings
wallZ(-5.35,-3.15,1.0,2.8); wallZ(-5.35,2.1,6.0,2.8);
wallZ(-1.55,-3.1,1.0,2.8); wallZ(-1.55,2.1,6.0,2.8);
wallZ(2.55,-3.1,1.0,3.0); wallZ(2.55,2.1,6.0,3.0);
wallX(west,-7.8,1.0,2.8); wallX(-6.6,-4.0,1.0,2.8); wallX(-2.9,-.15,1.0,2.8); wallX(1.2,2.55,1.0,3.0);

makeDoor(-5.35,.5,1.06,2.3,Math.PI/2,'Bedroom 1');
makeDoor(-1.55,.5,1.06,2.3,Math.PI/2,'Bedroom 2');
makeDoor(-5.35,2.55,1.12,2.3,Math.PI/2,'Accessible bedroom');
makeDoor(-1.55,2.55,1.06,2.3,Math.PI/2,'Accessible bathroom');
makeDoor(2.55,2.55,1.06,2.3,Math.PI/2,'Office');

// ceilings: private wing + raised living coffers
box(-4.3,2.82,2.6,12.2,.08,8.2,M.wall,false);
box(5.25,3.08,3.7,7.6,.08,4.5,M.wall,false);
box(5.25,4.08,-.3,8.2,.08,3.9,M.wall,false);
// high living perimeter detail
box(5.25,3.84,-.3,8.0,.12,.18,M.warm,false); box(5.25,3.84,-2.15,8.0,.12,.18,M.warm,false);
stripLight(5.25,3.76,-2.0,7.3,.04,0); stripLight(5.25,3.76,1.4,7.3,.04,0);

// -----------------------------------------------------------------------------
// Kitchen / living / bedrooms / bathrooms
// -----------------------------------------------------------------------------
const stoneTop=new THREE.MeshPhysicalMaterial({color:0xf1eee8,roughness:.2,clearcoat:.24});
// kitchen wall run
for(let i=0;i<5;i++) box(3.0+i*.82,.46,5.05,.78,.88,.62,M.white,true);
for(let i=0;i<5;i++) box(3.0+i*.82,1.75,5.12,.78,1.05,.48,M.white,true);
box(4.62,.92,5.03,4.15,.045,.66,stoneTop,true);
box(5.0,.47,3.25,3.25,.92,1.12,M.white,true); box(5.0,.95,3.25,3.34,.055,1.18,stoneTop,true);
for(let i=0;i<3;i++){const p=pointLight(4.2+i*.8,2.35,3.25,1.6,4.2); const shade=cyl(4.2+i*.8,2.42,3.25,.16,.20,M.bronze,24);}

// dining
box(6.65,.41,.55,2.5,.08,1.12,M.darkOak,true);
for(const sx of [-1,1]) for(const sz of [-1,1]) {const c=box(6.65+sx*.92,.43,.55+sz*.72,.48,.86,.48,M.fabricDark,true);}
pointLight(6.65,2.65,.55,1.7,5.4);

// living
box(5.0,.33,-2.45,3.2,.64,1.02,M.fabric,true); box(6.35,.33,-1.7,1.02,.64,2.0,M.fabric,true);
box(3.15,.22,-2.25,1.3,.10,.75,M.darkOak,true); rug(5.0,-2.25,5.1,2.7,0xe0d7ca);
box(8.45,1.0,-1.0,.20,1.72,3.2,M.warm,true); box(8.31,1.45,-1.0,.06,1.15,2.0,M.black,false);

// beds / wardrobes
function bed(x,z,w=1.8,d=2.05){box(x,.22,z,w,.40,d,M.fabric,true);box(x,.57,z-.94,w,.70,.16,M.warm,true);}
bed(-8.1,.15,1.8,2.05); bed(-3.8,.1,1.8,2.05); bed(-7.7,4.8,1.35,2.0); bed(-5.5,-4.25,1.9,2.05);
box(-9.65,1.1,4.3,.55,2.2,2.5,M.white,true); box(.5,1.1,.1,3.2,2.2,.58,M.white,true);

// accessible wet room
box(-3.45,.58,5.55,.72,.06,.48,stoneTop,true); cyl(-3.8,.42,5.6,.19,.43,M.white,28);
box(-2.5,.03,5.25,1.55,.025,1.55,M.marble,false); box(-2.0,1.05,5.55,.05,2.05,1.6,M.glass,false);
// grab rails
box(-4.2,.78,4.7,.7,.045,.045,M.bronze,false); box(-4.55,.85,4.7,.045,.65,.045,M.bronze,false);

// office
box(.5,.42,4.55,2.0,.08,.72,M.darkOak,true); box(.55,1.22,4.78,.95,.60,.05,M.black,false);

// decorative wall lighting
for(const p of [[-.3,2.45,2.2],[2.1,2.5,2.1],[7.9,2.7,-2.5],[-6.8,2.35,5.7]]) pointLight(...p,1.0,3.6,0xffcf96);

// -----------------------------------------------------------------------------
// Terrace / pergola / pool / cover
// -----------------------------------------------------------------------------
for(const x of [1.2,8.25]){box(x,1.45,-6.3,.14,2.9,.14,M.black,true);box(x,2.82,-6.3,.14,.14,4.6,M.black,true);}
for(let z=-8.25;z<-4.2;z+=.38) box(4.7,2.83,z,7.0,.055,.12,M.black,true);
stripLight(4.7,2.76,-6.25,6.4,.045,0);
box(4.9,.28,-6.6,2.5,.52,.9,M.fabricDark,true); box(3.4,.2,-6.7,1.1,.08,.65,M.darkOak,true);

box(POOL.x,-.22,POOL.z,POOL.deckWidth,.40,POOL.deckDepth,M.stone,false);
box(POOL.x,-.03,POOL.z,POOL.width+.45,.16,POOL.depth+.45,new THREE.MeshStandardMaterial({color:0xe8e4dc,roughness:.65}),false);
box(POOL.x,.04,POOL.z,POOL.width, .06, POOL.depth, M.water,false);
// steps
for(let i=0;i<3;i++) box(POOL.x-3.4+i*.18,.03,POOL.z+1.25-i*.22,.65,.05,1.05,M.stone,false);

const poolCover=new THREE.Group();
for(let x=-POOL.width/2+.08;x<POOL.width/2;x+=.16) box(x,.10,0,.145,.045,POOL.depth-.12,M.cover,false,poolCover);
poolCover.position.set(POOL.x,.10,POOL.z); scene.add(poolCover); poolCover.userData={amount:0,target:0};

// outdoor shower / pool lift provision marker
box(9.55,1.0,-9.0,.08,2.0,.08,M.bronze,true); box(9.55,1.95,-9.0,.55,.06,.06,M.bronze,true);
cyl(9.82,1.92,-9.0,.11,.04,M.bronze,24);

// -----------------------------------------------------------------------------
// Accessibility overlay
// -----------------------------------------------------------------------------
const turnMat=new THREE.MeshBasicMaterial({color:0x31b5e7,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false});
const turningCircle=new THREE.Mesh(new THREE.CircleGeometry(.75,64),turnMat); turningCircle.rotation.x=-Math.PI/2; turningCircle.position.y=.11; turningCircle.visible=false; scene.add(turningCircle);

// -----------------------------------------------------------------------------
// UI / interaction
// -----------------------------------------------------------------------------
let profile='walk';
const profileSel=document.getElementById('profile');
profileSel.onchange=()=>{profile=profileSel.value;camera.position.y=profile==='wheelchair'?1.15:1.65;};
document.getElementById('turn').onchange=e=>turningCircle.visible=e.target.value==='on';

const tele=document.getElementById('teleport');
Object.keys(TELEPORTS).forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;tele.appendChild(o);});
function go(name){const p=TELEPORTS[name];if(!p)return;camera.position.set(p[0],profile==='wheelchair'?1.15:p[1],p[2]);camera.rotation.set(0,p[3]||0,0);}
tele.onchange=()=>go(tele.value); document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>go(b.dataset.go));

const time=document.getElementById('time'), timeValue=document.getElementById('timeValue'), mood=document.getElementById('mood');
function setTime(hour){
  const ang=(hour/24)*Math.PI*2-Math.PI/2; const elev=Math.sin(ang); const daylight=THREE.MathUtils.clamp((elev+.13)*2.45,.06,1);
  sun.position.set(Math.cos(ang)*32,Math.max(1,elev*34),Math.sin(ang)*28); sun.intensity=.18+3.1*daylight; hemi.intensity=.32+1.2*daylight;
  const sky=new THREE.Color().lerpColors(new THREE.Color(0x080d18),new THREE.Color(0xc9dbe7),daylight); scene.background=sky; scene.fog.color.copy(sky);
  const autoPractical=hour>=17.4||hour<=7; practicalLights.forEach(l=>l.intensity=(mood.value==='day'?0:(mood.value==='night'?1.7:(mood.value==='evening'?1.35:(autoPractical?1.15:0)))));
  renderer.toneMappingExposure=mood.value==='night'?1.22:(mood.value==='evening'?1.16:1.1);
  const hh=Math.floor(hour),mm=Math.round((hour-hh)*60); timeValue.textContent=`${String(hh).padStart(2,'0')}:${String(mm===60?0:mm).padStart(2,'0')}`;
}
time.oninput=()=>setTime(Number(time.value)); mood.onchange=()=>setTime(Number(time.value)); setTime(Number(time.value));

const poolSel=document.getElementById('poolCover');
poolSel.onchange=()=>poolCover.userData.target=poolSel.value==='closed'?1:0;

const blindsSel=document.getElementById('blinds');
if(blindsSel) blindsSel.onchange=()=>blinds.forEach(b=>animateBlind(b,blindsSel.value==='open'));

const doorsSel=document.getElementById('doors');
if(doorsSel) doorsSel.onchange=()=>interactives.filter(i=>i.userData.kind==='door').forEach(d=>{d.userData.target=doorsSel.value==='open'?1:0;});

// Click/centre-ray interaction while unlocked: nearest door toggles.
const raycaster=new THREE.Raycaster();
renderer.domElement.addEventListener('dblclick',()=>{
  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  const candidates=[]; interactives.forEach(g=>g.traverse(o=>{if(o.isMesh)candidates.push(o);}));
  const hit=raycaster.intersectObjects(candidates,false)[0]; if(!hit||hit.distance>3)return;
  let p=hit.object.parent; while(p&&!p.userData.kind)p=p.parent; if(p?.userData.kind==='door')p.userData.target=p.userData.open?0:1;
});

// -----------------------------------------------------------------------------
// Movement
// -----------------------------------------------------------------------------
camera.position.set(.5,1.65,8.9); camera.lookAt(.5,1.55,6.4);
const pressed=new Set(); addEventListener('keydown',e=>pressed.add(e.code)); addEventListener('keyup',e=>pressed.delete(e.code));
let last=performance.now();
function updateMovement(dt){
  if(!controls.isLocked)return;
  let f=0,s=0;if(pressed.has('KeyW'))f+=1;if(pressed.has('KeyS'))f-=1;if(pressed.has('KeyD'))s+=1;if(pressed.has('KeyA'))s-=1;if(!f&&!s)return;
  const sprint=pressed.has('ShiftLeft')||pressed.has('ShiftRight'); const speed=(profile==='wheelchair'?1.45:2.55)*(sprint?1.55:1);
  const old=camera.position.clone(),fw=new THREE.Vector3(),rt=new THREE.Vector3(); camera.getWorldDirection(fw);fw.y=0;fw.normalize();rt.crossVectors(fw,camera.up).normalize();
  const v=new THREE.Vector3().addScaledVector(fw,f).addScaledVector(rt,s).normalize().multiplyScalar(speed*dt);camera.position.add(v);camera.position.y=profile==='wheelchair'?1.15:1.65;
  const radius=profile==='wheelchair'?.42:.28;if(collision(camera.position.x,camera.position.z,radius))camera.position.copy(old);
}
function animateFeatures(dt){
  interactives.forEach(d=>{if(d.userData.kind!=='door')return;const t=d.userData.target||0;const desired=d.userData.closedRot-(Math.PI/2)*t;d.rotation.y=THREE.MathUtils.lerp(d.rotation.y,desired,1-Math.pow(.001,dt));d.userData.open=t>.5;});
  blinds.forEach(g=>{const t=g.userData.target||0;g.userData.slats.forEach((s,i)=>{const factor=1-t*.92;s.scale.y=factor;s.position.y=s.userData.baseY*factor;});});
  const c=poolCover.userData, desired=c.target||0;c.amount=THREE.MathUtils.lerp(c.amount||0,desired,1-Math.pow(.003,dt));poolCover.scale.x=Math.max(.02,c.amount);poolCover.position.x=POOL.x-POOL.width/2+(POOL.width*c.amount)/2;
}

function animate(){requestAnimationFrame(animate);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;updateMovement(dt);animateFeatures(dt);turningCircle.position.set(camera.position.x,.11,camera.position.z);renderer.render(scene,camera);} animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
