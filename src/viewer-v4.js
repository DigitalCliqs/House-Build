import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { SITE, HOUSE, POOL, ROOMS, TELEPORTS } from './house-config.js';

// High-fidelity browser renderer for the Anamarija EuroMax finished concept.
// Visual design model only — not a construction drawing.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcbd9e4);
scene.fog = new THREE.FogExp2(0xcbd9e4, 0.008);

const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.035, 220);
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.useLegacyLights = false;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
const crosshair = document.getElementById('crosshair');
controls.addEventListener('lock',()=>crosshair.style.display='block');
controls.addEventListener('unlock',()=>crosshair.style.display='none');
document.getElementById('enter').onclick=()=>controls.lock();

// -----------------------------------------------------------------------------
// Texture/material factory
// -----------------------------------------------------------------------------
function canvasTex(size, draw, repeat=[1,1]){
  const c=document.createElement('canvas'); c.width=c.height=size;
  const ctx=c.getContext('2d'); draw(ctx,size);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(...repeat);
  t.anisotropy=renderer.capabilities.getMaxAnisotropy(); return t;
}
const marble=canvasTex(1024,(c,s)=>{
  c.fillStyle='#f5f3ee'; c.fillRect(0,0,s,s);
  for(let i=0;i<34;i++){
    c.beginPath(); let y=Math.random()*s; c.moveTo(-30,y);
    c.strokeStyle=i%7===0?'rgba(184,144,91,.30)':'rgba(116,122,131,.17)';
    c.lineWidth=.8+Math.random()*2.3;
    for(let x=-20;x<s+40;x+=38){ y+=(Math.random()-.5)*42; c.lineTo(x,y); }
    c.stroke();
  }
  c.strokeStyle='rgba(110,110,110,.10)'; c.lineWidth=2;
  for(let x=0;x<s;x+=256){c.beginPath();c.moveTo(x,0);c.lineTo(x,s);c.stroke();}
  for(let y=0;y<s;y+=256){c.beginPath();c.moveTo(0,y);c.lineTo(s,y);c.stroke();}
},[3.2,3.2]);
const oak=canvasTex(1024,(c,s)=>{
  c.fillStyle='#b88555'; c.fillRect(0,0,s,s);
  for(let y=-80;y<s+100;y+=52){
    for(let x=-120;x<s+140;x+=116){
      const f=((x/116+y/52)|0)%2===0; c.save(); c.translate(x,y); c.rotate(f?Math.PI/4:-Math.PI/4);
      c.fillStyle=f?'#bf9164':'#a97549'; c.fillRect(-54,-8,108,16);
      c.strokeStyle='rgba(73,47,28,.30)'; c.strokeRect(-54,-8,108,16); c.restore();
    }
  }
},[3.9,3.9]);
const grass=canvasTex(512,(c,s)=>{
  c.fillStyle='#71845c'; c.fillRect(0,0,s,s);
  for(let i=0;i<5000;i++){ const g=82+Math.random()*48;c.fillStyle=`rgba(${44+Math.random()*22},${g},${40+Math.random()*18},.32)`;c.fillRect(Math.random()*s,Math.random()*s,1,2+Math.random()*3);}
},[10,14]);
const stone=canvasTex(512,(c,s)=>{
  c.fillStyle='#cec5b8'; c.fillRect(0,0,s,s); c.strokeStyle='rgba(100,92,82,.16)'; c.lineWidth=2;
  for(let x=0;x<s;x+=128){c.beginPath();c.moveTo(x,0);c.lineTo(x,s);c.stroke();}
  for(let y=0;y<s;y+=128){c.beginPath();c.moveTo(0,y);c.lineTo(s,y);c.stroke();}
},[5,5]);

const MAT={
  wall:new THREE.MeshStandardMaterial({color:0xf4f0e8,roughness:.72}),
  warmWall:new THREE.MeshStandardMaterial({color:0xe8dfd3,roughness:.76}),
  marble:new THREE.MeshPhysicalMaterial({map:marble,roughness:.20,clearcoat:.18,clearcoatRoughness:.16}),
  oak:new THREE.MeshStandardMaterial({map:oak,roughness:.52}),
  darkOak:new THREE.MeshStandardMaterial({color:0x4b3b32,roughness:.55}),
  walnut:new THREE.MeshStandardMaterial({color:0x6e5140,roughness:.52}),
  white:new THREE.MeshPhysicalMaterial({color:0xf4f1ea,roughness:.28,clearcoat:.10}),
  black:new THREE.MeshStandardMaterial({color:0x171a1d,roughness:.30,metalness:.24}),
  bronze:new THREE.MeshStandardMaterial({color:0x9c7d60,roughness:.23,metalness:.76}),
  brushed:new THREE.MeshStandardMaterial({color:0xb7aa9a,roughness:.28,metalness:.62}),
  glass:new THREE.MeshPhysicalMaterial({color:0xd9edf3,transmission:.82,transparent:true,opacity:.34,roughness:.045,ior:1.45,thickness:.015}),
  smoked:new THREE.MeshPhysicalMaterial({color:0x778c97,transmission:.64,transparent:true,opacity:.38,roughness:.06,ior:1.45}),
  mirror:new THREE.MeshPhysicalMaterial({color:0xdde5e8,metalness:.92,roughness:.05}),
  stone:new THREE.MeshStandardMaterial({map:stone,roughness:.64}),
  grass:new THREE.MeshStandardMaterial({map:grass,roughness:1}),
  soil:new THREE.MeshStandardMaterial({color:0x59483a,roughness:1}),
  green:new THREE.MeshStandardMaterial({color:0x4f6e43,roughness:.9}),
  green2:new THREE.MeshStandardMaterial({color:0x6f8955,roughness:.9}),
  fabric:new THREE.MeshStandardMaterial({color:0xd0c6ba,roughness:.98}),
  fabricDark:new THREE.MeshStandardMaterial({color:0x746e67,roughness:.98}),
  linen:new THREE.MeshStandardMaterial({color:0xeee7dd,roughness:1}),
  water:new THREE.MeshPhysicalMaterial({color:0x2d9fc5,transparent:true,opacity:.76,roughness:.08,transmission:.28,clearcoat:1,clearcoatRoughness:.06}),
  cover:new THREE.MeshStandardMaterial({color:0xc3c8cb,roughness:.30,metalness:.45}),
  asphalt:new THREE.MeshStandardMaterial({color:0x4c5054,roughness:1}),
  light:new THREE.MeshBasicMaterial({color:0xffd5a2}),
};

// -----------------------------------------------------------------------------
// Helpers / collision / interactive registry
// -----------------------------------------------------------------------------
const obstacles=[], doors=[], blinds=[], practicalLights=[];
function box(x,y,z,w,h,d,mat=MAT.wall,cast=true,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;}
function cyl(x,y,z,r,h,mat=MAT.wall,seg=32,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(x,y,z,r,mat=MAT.green,parent=scene){const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function seg(x1,z1,x2,z2,t=.2){obstacles.push({x1,z1,x2,z2,t});}
function wallX(x1,x2,z,h=3.0,t=HOUSE.wallThickness,mat=MAT.wall,collide=true){const m=box((x1+x2)/2,h/2,z,Math.abs(x2-x1),h,t,mat);if(collide)seg(x1,z,x2,z,t);return m;}
function wallZ(x,z1,z2,h=3.0,t=HOUSE.wallThickness,mat=MAT.wall,collide=true){const m=box(x,h/2,(z1+z2)/2,t,h,Math.abs(z2-z1),mat);if(collide)seg(x,z1,x,z2,t);return m;}
function pointSegDist(px,pz,a,b,c,d){const vx=c-a,vz=d-b,wx=px-a,wz=pz-b,l2=vx*vx+vz*vz;if(!l2)return Math.hypot(px-a,pz-b);const q=Math.max(0,Math.min(1,(wx*vx+wz*vz)/l2));return Math.hypot(px-(a+q*vx),pz-(b+q*vz));}
function collision(x,z,r){if(x<-SITE.width/2+r||x>SITE.width/2-r||z<-SITE.depth/2+r||z>SITE.depth/2-r)return true;return obstacles.some(o=>pointSegDist(x,z,o.x1,o.z1,o.x2,o.z2)<r+o.t/2);}
function pointLight(x,y,z,intensity=65,distance=5,color=0xffd5a4){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);scene.add(l);practicalLights.push({light:l,base:intensity});return l;}
function glowStrip(x,y,z,w,d=.035,rot=0){const g=new THREE.Group();box(0,0,0,w,.018,d,MAT.light,false,g);const l=new THREE.PointLight(0xffd19c,28,3.8,2);l.position.set(0,-.06,0);g.add(l);practicalLights.push({light:l,base:28});g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);}
function windowFrame(x,y,z,w,h,rot=0,smoked=false){const g=new THREE.Group();box(0,h/2,0,w,h,.04,smoked?MAT.smoked:MAT.glass,false,g);const f=.045;box(-w/2,h/2,0,f,h+.08,.075,MAT.black,true,g);box(w/2,h/2,0,f,h+.08,.075,MAT.black,true,g);box(0,.02,0,w+.06,f,.075,MAT.black,true,g);box(0,h,0,w+.06,f,.075,MAT.black,true,g);if(w>2.5){const n=Math.ceil(w/1.6);for(let i=1;i<n;i++)box(-w/2+(w*i/n),h/2,0,.028,h,.065,MAT.black,true,g);}g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);return g;}
function blind(x,y,z,w,h,rot=0){const g=new THREE.Group(),slats=[];for(let yy=.03;yy<h;yy+=.085){const s=box(0,yy,0,w,.025,.027,MAT.bronze,false,g);s.userData.base=yy;slats.push(s);}g.position.set(x,y,z);g.rotation.y=rot;g.userData={slats,target:0};scene.add(g);blinds.push(g);}
function door(x,z,w=1.08,h=2.3,rot=0,label='Door',mat=MAT.white){const pivot=new THREE.Group();box(w/2,h/2,0,w,h,.05,mat,true,pivot);box(w-.13,h*.48,.035,.03,.035,.11,MAT.bronze,false,pivot);pivot.position.set(x-w/2*Math.cos(rot),0,z+w/2*Math.sin(rot));pivot.rotation.y=rot;pivot.userData={label,closed:rot,target:0,open:false};scene.add(pivot);doors.push(pivot);return pivot;}
function rug(x,z,w,d,color=0xd8cfc4){return box(x,.075,z,w,.022,d,new THREE.MeshStandardMaterial({color,roughness:1}),false);}
function roundTable(x,z,r=.65,h=.72,mat=MAT.darkOak){cyl(x,h,z,r,.06,mat,48);cyl(x,h/2,z,.10,h,mat,24);}

// -----------------------------------------------------------------------------
// Natural light / sky
// -----------------------------------------------------------------------------
const hemi=new THREE.HemisphereLight(0xeaf5ff,0x5d6670,1.1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d4,4.0);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.bias=-.0002;scene.add(sun);

// -----------------------------------------------------------------------------
// Site / front approach / landscaping
// -----------------------------------------------------------------------------
box(0,-.16,0,SITE.width,.28,SITE.depth,MAT.grass,false);
box(0,-.07,19.0,SITE.width,.11,2.0,MAT.asphalt,false);
box(0,-.01,17.65,SITE.width,.07,.7,new THREE.MeshStandardMaterial({color:0xc3bdb4,roughness:.9}),false);
box(7.0,.01,13.55,7.3,.075,7.6,MAT.stone,false);
box(.55,.025,11.35,2.05,.07,7.9,MAT.stone,false);
// gate piers + number wall
box(-.8,.9,16.55,.32,1.8,.42,MAT.warmWall,true);box(2.05,.9,16.55,.32,1.8,.42,MAT.warmWall,true);box(.63,1.28,16.7,2.65,.13,.22,MAT.black,true);
// driveway car placeholder
const car=new THREE.Group();box(0,.38,0,1.9,.42,4.5,new THREE.MeshStandardMaterial({color:0x34373a,roughness:.28,metalness:.45}),true,car);box(0,.72,-.25,1.68,.55,2.3,MAT.smoked,true,car);for(const sx of [-.78,.78])for(const sz of [-1.5,1.5]){const w=cyl(sx,.25,sz,.29,.18,MAT.black,24,car);w.rotation.z=Math.PI/2;}car.position.set(7.1,0,13.7);scene.add(car);

// privacy hedges
for(let x=-14.2;x<=14.2;x+=.8){if(Math.abs(x-7.0)>3.8)box(x,.82,16.85,.72,1.62,.62,MAT.green,false);box(x,.82,-19.05,.72,1.62,.62,MAT.green,false);}
for(let z=-18.3;z<16.2;z+=.8){box(-14.35,.82,z,.62,1.62,.72,MAT.green,false);box(14.35,.82,z,.62,1.62,.72,MAT.green,false);}
function tree(x,z,s=1){const g=new THREE.Group();cyl(0,1.15*s,0,.15*s,2.3*s,new THREE.MeshStandardMaterial({color:0x6a5038,roughness:1}),14,g);sphere(0,2.65*s,0,.9*s,MAT.green,g);sphere(.45*s,2.8*s,.1*s,.62*s,MAT.green2,g);sphere(-.35*s,2.95*s,-.1*s,.58*s,MAT.green,g);g.position.set(x,0,z);scene.add(g);}
[[-11.4,12.2,1.05],[-10.9,-8.6,1.2],[-10.3,-13,1.0],[11.3,-5,.95],[11.1,-11,1.05],[11.8,9,.9]].forEach(v=>tree(...v));
// planting beds and shrubs
for(const [x,z,w,d] of [[-10.9,10.5,3.2,4.5],[-10.8,-11,3.4,7],[11.2,-8,2.6,9.5]])box(x,.01,z,w,.08,d,MAT.soil,false);
for(let i=0;i<58;i++){const zones=i<20?[-10.9,10.6,2.4,3.6]:i<39?[-10.7,-11,2.5,5.5]:[11.2,-8,1.7,7.6];sphere(zones[0]+(Math.random()-.5)*zones[2],.2,zones[1]+(Math.random()-.5)*zones[3],.18+Math.random()*.16,Math.random()>.45?MAT.green:MAT.green2);}

// -----------------------------------------------------------------------------
// House floor, envelope, ceiling hierarchy
// -----------------------------------------------------------------------------
const hz=HOUSE.z,north=hz+HOUSE.depth/2,south=hz-HOUSE.depth/2,west=-HOUSE.width/2,east=HOUSE.width/2;
box(0,.02,hz,HOUSE.width,.10,HOUSE.depth,MAT.marble,false);
for(const r of ROOMS)box(r.x,.087,r.z+hz,r.w,.025,r.d,r.finish==='wood'?MAT.oak:MAT.marble,false);
box(4.75,.035,-5.95,11.9,.075,4.25,MAT.stone,false);

// exterior envelope with openings matching the concept
wallX(west,-.25,north,3.08);wallX(1.18,east,north,3.08);wallZ(west,south,north,2.86);wallZ(east,south,north,3.08);
wallX(west,-7.9,south,2.82);wallX(-5.0,-2.7,south,2.82);wallX(-.05,1.72,south,3.08);wallX(8.4,east,south,3.08);
windowFrame(-6.45,.14,south-.03,2.72,2.38,Math.PI);windowFrame(-1.38,.14,south-.03,2.62,2.38,Math.PI);
windowFrame(5.05,.12,south-.04,6.60,2.76,Math.PI);windowFrame(5.48,.14,north+.03,4.86,2.58,0,true);
blind(5.05,.13,south-.09,6.60,2.75,Math.PI);blind(5.48,.14,north+.08,4.86,2.58,0);
// entrance portal and door
box(.48,2.74,north+.08,2.0,.34,.38,MAT.warmWall,true);box(-.62,1.48,north+.16,.18,2.96,.48,MAT.warmWall,true);box(1.58,1.48,north+.16,.18,2.96,.48,MAT.warmWall,true);door(.48,north-.13,1.34,2.58,0,'Front door',MAT.darkOak);
// private wing partitions
wallZ(-5.35,-3.2,1.0,2.82);wallZ(-5.35,2.12,6.0,2.82);wallZ(-1.55,-3.2,1.0,2.82);wallZ(-1.55,2.12,6.0,2.82);wallZ(2.55,-3.2,1.0,3.02);wallZ(2.55,2.12,6.0,3.02);
wallX(west,-7.75,1.0,2.82);wallX(-6.6,-4.05,1.0,2.82);wallX(-2.9,-.12,1.0,2.82);wallX(1.2,2.55,1.0,3.02);
door(-5.35,.50,1.06,2.32,Math.PI/2,'Bedroom 1');door(-1.55,.50,1.06,2.32,Math.PI/2,'Bedroom 2');door(-5.35,2.55,1.12,2.32,Math.PI/2,'Accessible bedroom');door(-1.55,2.55,1.06,2.32,Math.PI/2,'Accessible bathroom');door(2.55,2.55,1.06,2.32,Math.PI/2,'Office');
// ceiling planes and raised living feature
box(-4.3,2.84,2.6,12.2,.08,8.2,MAT.wall,false);box(5.25,3.09,3.7,7.7,.08,4.55,MAT.wall,false);box(5.25,4.10,-.25,8.25,.08,4.0,MAT.wall,false);
// coffer perimeter + reveal lighting
for(const z of [-2.05,1.52])box(5.25,3.86,z,8.0,.13,.18,MAT.warmWall,false);glowStrip(5.25,3.78,-1.93,7.35);glowStrip(5.25,3.78,1.40,7.35);
// entry cove
box(.45,3.00,4.9,3.5,.08,1.25,MAT.warmWall,false);glowStrip(.45,2.91,4.36,3.1);

// -----------------------------------------------------------------------------
// Detailed interiors
// -----------------------------------------------------------------------------
const topMat=new THREE.MeshPhysicalMaterial({color:0xf4f1eb,roughness:.18,clearcoat:.26});
// Kitchen: tall bank, wall run, integrated appliances, island + accessible zone
for(let i=0;i<5;i++)box(3.0+i*.82,.48,5.02,.78,.92,.62,MAT.white,true);
for(let i=0;i<5;i++)box(3.0+i*.82,1.72,5.10,.78,1.02,.46,MAT.white,true);
box(4.62,.96,5.02,4.18,.05,.68,topMat,true);
box(2.52,1.18,5.08,.78,2.35,.64,MAT.white,true);box(2.50,1.22,4.74,.55,1.30,.03,MAT.black,false);
box(5.00,.48,3.28,3.34,.94,1.16,MAT.white,true);box(5.00,.98,3.28,3.42,.06,1.22,topMat,true);
// undercut accessible section on island
box(6.05,.44,3.28,.82,.82,.96,MAT.white,true);box(3.84,.44,3.28,.76,.82,.96,MAT.white,true);
// sink + hob details
box(5.65,1.02,3.28,.62,.015,.42,MAT.black,false);cyl(4.35,1.18,3.20,.025,.42,MAT.bronze,18);box(4.45,1.36,3.20,.28,.025,.025,MAT.bronze,false);
for(let i=0;i<3;i++){cyl(4.18+i*.82,2.50,3.28,.17,.20,MAT.bronze,28);pointLight(4.18+i*.82,2.35,3.28,72,4.0);}
// Dining: sculptural table and six chairs
roundTable(6.68,.55,.84,.74,MAT.darkOak);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const g=new THREE.Group();box(0,.43,0,.46,.12,.50,MAT.fabricDark,true,g);box(0,.82,.18,.46,.66,.10,MAT.fabricDark,true,g);g.position.set(6.68+Math.cos(a)*1.35,0,.55+Math.sin(a)*1.05);g.rotation.y=-a+Math.PI/2;scene.add(g);}pointLight(6.68,2.75,.55,95,5.6);
// Living: sectional, coffee table, media wall, side lamps, slatted feature
rug(5.05,-2.18,5.25,2.75,0xe0d8cd);box(4.85,.35,-2.48,3.35,.68,1.02,MAT.fabric,true);box(6.35,.35,-1.72,1.02,.68,2.08,MAT.fabric,true);box(3.38,.22,-2.22,1.45,.10,.82,MAT.darkOak,true);
box(8.47,1.26,-1.03,.18,2.45,3.52,MAT.warmWall,true);for(let z=-2.42;z<.4;z+=.16)box(8.34,1.30,z,.055,2.22,.075,MAT.walnut,true);box(8.23,1.47,-1.03,.045,1.22,2.05,MAT.black,false);glowStrip(8.28,2.43,-1.03,2.9,.04,Math.PI/2);
// artwork and console
box(2.42,.56,-.35,1.4,.74,.42,MAT.darkOak,true);box(2.35,1.64,-.58,1.15,.88,.025,new THREE.MeshStandardMaterial({color:0xb79b7e,roughness:.8}),false);
// central built-in hall storage
box(.45,1.18,.08,3.18,2.36,.60,MAT.white,true);for(let x=-.9;x<1.85;x+=.55)box(x,1.18,-.235,.018,2.20,.025,MAT.bronze,false);

function bed(x,z,w=1.8,d=2.05){box(x,.25,z,w,.42,d,MAT.linen,true);box(x,.60,z-d*.46,w,.76,.16,MAT.warmWall,true);box(x-.45,.48,z-.32,.58,.13,.38,MAT.linen,true);box(x+.45,.48,z-.32,.58,.13,.38,MAT.linen,true);box(x,.43,z+.35,w*.84,.10,.72,MAT.fabric,false);}
bed(-8.05,.15,1.82,2.08);bed(-3.78,.10,1.82,2.08);bed(-7.65,4.72,1.45,2.04);bed(-5.50,-4.26,1.92,2.10);
// bedroom side tables/wardrobes
for(const x of [-8.05,-3.78,-5.50]){box(x-1.2,.28,x===-5.5?-4.1:.15,.46,.52,.42,MAT.darkOak,true);}
box(-9.72,1.14,4.30,.56,2.28,2.55,MAT.white,true);box(-7.62,1.16,5.82,3.35,2.30,.52,MAT.white,true);
// office
box(.48,.43,4.55,2.10,.08,.76,MAT.darkOak,true);box(.50,1.28,4.82,1.05,.62,.045,MAT.black,false);box(.5,.47,3.70,.58,.88,.58,MAT.fabricDark,true);box(1.56,1.40,5.55,.42,2.2,.38,MAT.walnut,true);

// Accessible wet room: wall tile, vanity, basin, WC, rails, shower, bench, mirror
box(-3.20,1.40,5.92,3.0,2.72,.07,MAT.marble,false);box(-3.78,.66,5.52,.82,.08,.50,topMat,true);cyl(-3.78,.72,5.50,.20,.10,MAT.white,30);box(-3.78,1.58,5.88,.82,.82,.025,MAT.mirror,false);
cyl(-4.36,.38,4.70,.24,.40,MAT.white,28);box(-4.36,.48,4.82,.42,.14,.58,MAT.white,true);box(-4.77,.78,4.70,.72,.045,.045,MAT.bronze,false);box(-4.96,.86,4.70,.045,.72,.045,MAT.bronze,false);
box(-2.32,.04,5.08,1.48,.03,1.56,MAT.marble,false);box(-1.86,1.07,5.38,.045,2.06,1.65,MAT.glass,false);box(-2.60,.45,5.70,.70,.08,.36,MAT.warmWall,true);cyl(-2.10,1.88,5.70,.09,.04,MAT.bronze,20);box(-2.10,1.50,5.70,.025,.78,.025,MAT.bronze,false);
// Ensuite + guest WC details
box(-1.40,.66,-4.95,.72,.08,.48,topMat,true);cyl(-1.40,.72,-4.95,.18,.10,MAT.white,28);box(-1.40,1.52,-5.25,.74,.72,.025,MAT.mirror,false);cyl(-.45,.38,-4.1,.22,.40,MAT.white,28);
// recessed downlights throughout
for(let x=-8;x<=8;x+=2.0)for(let z=-4;z<=5;z+=2.0){if(x>2.5&&z<1.7)continue;pointLight(x,2.66+(x>2.5?0.3:0),z,34,3.2,0xffe1bb);}

// -----------------------------------------------------------------------------
// Terrace / pergola / pool / outdoor furniture
// -----------------------------------------------------------------------------
for(const x of [1.2,8.3]){box(x,1.47,-6.3,.14,2.94,.14,MAT.black,true);box(x,2.88,-6.3,.14,.14,4.55,MAT.black,true);}for(let z=-8.25;z<-4.15;z+=.34)box(4.75,2.89,z,7.15,.05,.10,MAT.black,true);glowStrip(4.75,2.80,-6.25,6.55);
box(4.95,.29,-6.62,2.65,.54,.92,MAT.fabricDark,true);box(3.38,.22,-6.64,1.12,.08,.66,MAT.darkOak,true);roundTable(7.1,-6.6,.52,.58,MAT.darkOak);
// pool basin, coping, water, steps
box(POOL.x,-.22,POOL.z,POOL.deckWidth,.40,POOL.deckDepth,MAT.stone,false);box(POOL.x,-.03,POOL.z,POOL.width+.50,.16,POOL.depth+.50,new THREE.MeshStandardMaterial({color:0xe9e5dd,roughness:.62}),false);const water=box(POOL.x,.04,POOL.z,POOL.width,.06,POOL.depth,MAT.water,false);
for(let i=0;i<3;i++)box(POOL.x-3.40+i*.18,.03,POOL.z+1.25-i*.22,.68,.05,1.08,MAT.stone,false);
// slatted electric cover
const poolCover=new THREE.Group();for(let x=-POOL.width/2+.08;x<POOL.width/2;x+=.16)box(x,.10,0,.145,.045,POOL.depth-.12,MAT.cover,false,poolCover);poolCover.position.set(POOL.x,.10,POOL.z);poolCover.userData={amount:0,target:0};scene.add(poolCover);
// loungers and outdoor shower
for(const x of [1.0,2.0]){box(x,.20,-12.95,.72,.08,1.9,MAT.fabric,false);box(x,.48,-13.65,.72,.62,.08,MAT.fabric,false);}box(9.55,1.02,-9.0,.075,2.04,.075,MAT.bronze,true);box(9.55,1.98,-9.0,.55,.05,.05,MAT.bronze,false);cyl(9.82,1.96,-9.0,.11,.04,MAT.bronze,22);
// pool planting / ornamental grasses
for(let i=0;i<18;i++){const x=9.8+Math.random()*2.1,z=-12.8+Math.random()*5.4;cyl(x,.35,z,.035,.7,MAT.green2,8);}

// -----------------------------------------------------------------------------
// Accessibility visualisation
// -----------------------------------------------------------------------------
const turn=new THREE.Mesh(new THREE.CircleGeometry(.75,64),new THREE.MeshBasicMaterial({color:0x36b7e6,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));turn.rotation.x=-Math.PI/2;turn.position.y=.11;turn.visible=false;scene.add(turn);
const wheelchairBody=new THREE.Group();
const chairMat=new THREE.MeshBasicMaterial({color:0x32b4e4,transparent:true,opacity:.16,wireframe:true});box(0,.28,0,.72,.56,1.15,chairMat,false,wheelchairBody);wheelchairBody.visible=false;scene.add(wheelchairBody);

// -----------------------------------------------------------------------------
// UI and navigation
// -----------------------------------------------------------------------------
let profile='walk';
const profileSel=document.getElementById('profile');profileSel.onchange=()=>{profile=profileSel.value;const wheel=profile==='wheelchair';camera.position.y=wheel?1.15:1.65;wheelchairBody.visible=wheel;};
document.getElementById('turn').onchange=e=>turn.visible=e.target.value==='on';
const tele=document.getElementById('teleport');Object.keys(TELEPORTS).forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;tele.appendChild(o);});
function go(name){const p=TELEPORTS[name];if(!p)return;camera.position.set(p[0],profile==='wheelchair'?1.15:p[1],p[2]);camera.rotation.set(0,p[3]||0,0);}tele.onchange=()=>go(tele.value);document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>go(b.dataset.go));
const time=document.getElementById('time'),timeValue=document.getElementById('timeValue'),mood=document.getElementById('mood');
function setTime(hour){const a=(hour/24)*Math.PI*2-Math.PI/2,elev=Math.sin(a),day=THREE.MathUtils.clamp((elev+.12)*2.35,.04,1);sun.position.set(Math.cos(a)*34,Math.max(1,elev*35),Math.sin(a)*29);sun.intensity=.18+4.0*day;hemi.intensity=.24+1.0*day;const sky=new THREE.Color().lerpColors(new THREE.Color(0x080c17),new THREE.Color(0xcbd9e4),day);scene.background=sky;scene.fog.color.copy(sky);const on=hour>=17.2||hour<=7.2;practicalLights.forEach(p=>p.light.intensity=(mood.value==='day'?0:mood.value==='night'?p.base*1.25:mood.value==='evening'?p.base:(on?p.base*.85:0)));renderer.toneMappingExposure=mood.value==='night'?1.18:mood.value==='evening'?1.10:1.03;const hh=Math.floor(hour),mm=Math.round((hour-hh)*60)%60;timeValue.textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;}
time.oninput=()=>setTime(+time.value);mood.onchange=()=>setTime(+time.value);setTime(+time.value);
document.getElementById('doors').onchange=e=>doors.forEach(d=>d.userData.target=e.target.value==='open'?1:0);
document.getElementById('blinds').onchange=e=>blinds.forEach(b=>b.userData.target=e.target.value==='closed'?1:0);
document.getElementById('poolCover').onchange=e=>poolCover.userData.target=e.target.value==='closed'?1:0;

// centre-ray door toggle
const ray=new THREE.Raycaster();renderer.domElement.addEventListener('dblclick',()=>{ray.setFromCamera(new THREE.Vector2(0,0),camera);const meshes=[];doors.forEach(g=>g.traverse(o=>{if(o.isMesh)meshes.push(o);}));const hit=ray.intersectObjects(meshes,false)[0];if(!hit||hit.distance>3.2)return;let p=hit.object.parent;while(p&&!p.userData.closed)p=p.parent;if(p?.userData.closed!==undefined)p.userData.target=p.userData.open?0:1;});

// -----------------------------------------------------------------------------
// Movement / animation
// -----------------------------------------------------------------------------
camera.position.set(.5,1.65,8.9);camera.lookAt(.5,1.55,6.4);
const pressed=new Set();addEventListener('keydown',e=>pressed.add(e.code));addEventListener('keyup',e=>pressed.delete(e.code));let last=performance.now();
function movement(dt){if(!controls.isLocked)return;let f=0,s=0;if(pressed.has('KeyW')||pressed.has('ArrowUp'))f++;if(pressed.has('KeyS')||pressed.has('ArrowDown'))f--;if(pressed.has('KeyD')||pressed.has('ArrowRight'))s++;if(pressed.has('KeyA')||pressed.has('ArrowLeft'))s--;if(!f&&!s)return;const sprint=pressed.has('ShiftLeft')||pressed.has('ShiftRight'),speed=(profile==='wheelchair'?1.42:2.48)*(sprint?1.55:1);const old=camera.position.clone(),fw=new THREE.Vector3(),rt=new THREE.Vector3();camera.getWorldDirection(fw);fw.y=0;fw.normalize();rt.crossVectors(fw,camera.up).normalize();camera.position.add(new THREE.Vector3().addScaledVector(fw,f).addScaledVector(rt,s).normalize().multiplyScalar(speed*dt));camera.position.y=profile==='wheelchair'?1.15:1.65;const r=profile==='wheelchair'?.42:.28;if(collision(camera.position.x,camera.position.z,r))camera.position.copy(old);}
function animateFeatures(dt,t){doors.forEach(d=>{const desired=d.userData.closed-Math.PI/2*(d.userData.target||0);d.rotation.y=THREE.MathUtils.lerp(d.rotation.y,desired,1-Math.pow(.002,dt));d.userData.open=(d.userData.target||0)>.5;});blinds.forEach(g=>{const q=g.userData.target||0;g.userData.slats.forEach(s=>{const k=1-q*.93;s.scale.y=k;s.position.y=s.userData.base*k;});});const c=poolCover.userData;c.amount=THREE.MathUtils.lerp(c.amount||0,c.target||0,1-Math.pow(.003,dt));poolCover.scale.x=Math.max(.02,c.amount);poolCover.position.x=POOL.x-POOL.width/2+POOL.width*c.amount/2;water.position.y=.04+Math.sin(t*.0014)*.008;MAT.water.roughness=.07+.015*Math.sin(t*.001);}
function animate(){requestAnimationFrame(animate);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;movement(dt);animateFeatures(dt,now);turn.position.set(camera.position.x,.11,camera.position.z);wheelchairBody.position.set(camera.position.x,0,camera.position.z);renderer.render(scene,camera);}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
