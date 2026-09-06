import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/PointerLockControls.js';
import { SITE, HOUSE, POOL, ROOMS, TELEPORTS } from './house-config.js';

// ---------------------------------------------------------------------------
// Renderer / scene
// ---------------------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9d9e5);
scene.fog = new THREE.Fog(0xc9d9e5, 38, 95);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.04, 180);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
const crosshair = document.getElementById('crosshair');
controls.addEventListener('lock', () => crosshair.style.display = 'block');
controls.addEventListener('unlock', () => crosshair.style.display = 'none');
document.getElementById('enter').onclick = () => controls.lock();

// ---------------------------------------------------------------------------
// Lights
// ---------------------------------------------------------------------------
const hemi = new THREE.HemisphereLight(0xffffff, 0x5b6570, 1.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff5df, 3.3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -28;
sun.shadow.camera.right = 28;
sun.shadow.camera.top = 28;
sun.shadow.camera.bottom = -28;
sun.shadow.bias = -0.00025;
scene.add(sun);

const practicalLights = [];
function pointLight(x, y, z, intensity = 1.2, distance = 5.5, color = 0xffdfb3) {
  const light = new THREE.PointLight(color, intensity, distance, 2);
  light.position.set(x, y, z);
  light.castShadow = false;
  scene.add(light);
  practicalLights.push(light);
  return light;
}

// ---------------------------------------------------------------------------
// Procedural premium materials
// ---------------------------------------------------------------------------
function canvasTexture(size, painter) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  painter(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

const marbleTex = canvasTexture(768, (ctx, s) => {
  ctx.fillStyle = '#f3f1eb';
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 22; i++) {
    ctx.strokeStyle = i % 5 === 0 ? 'rgba(178,142,94,.26)' : 'rgba(108,116,126,.17)';
    ctx.lineWidth = 1 + Math.random() * 2.4;
    ctx.beginPath();
    let y = Math.random() * s;
    ctx.moveTo(-30, y);
    for (let x = 0; x <= s + 30; x += 48) {
      y += (Math.random() - .5) * 56;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
});
marbleTex.repeat.set(2.8, 2.8);

const oakTex = canvasTexture(768, (ctx, s) => {
  ctx.fillStyle = '#b78a5d';
  ctx.fillRect(0, 0, s, s);
  ctx.lineWidth = 3;
  for (let y = -80; y < s + 80; y += 60) {
    for (let x = -120; x < s + 120; x += 125) {
      const flip = ((x / 125 + y / 60) | 0) % 2 === 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(flip ? Math.PI / 4 : -Math.PI / 4);
      ctx.fillStyle = flip ? '#bd8f61' : '#aa784d';
      ctx.fillRect(-55, -9, 110, 18);
      ctx.strokeStyle = 'rgba(73,47,30,.32)';
      ctx.strokeRect(-55, -9, 110, 18);
      ctx.restore();
    }
  }
});
oakTex.repeat.set(3.2, 3.2);

const grassTex = canvasTexture(512, (ctx, s) => {
  ctx.fillStyle = '#75865f'; ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 3500; i++) {
    const g = 90 + Math.random() * 45;
    ctx.fillStyle = `rgba(${45 + Math.random()*25},${g},${45 + Math.random()*20},.25)`;
    ctx.fillRect(Math.random()*s, Math.random()*s, 1, 2 + Math.random()*3);
  }
});
grassTex.repeat.set(9, 12);

const mats = {
  wall: new THREE.MeshStandardMaterial({ color:0xf4f0e7, roughness:.72 }),
  wallWarm: new THREE.MeshStandardMaterial({ color:0xe6dfd3, roughness:.78 }),
  marble: new THREE.MeshPhysicalMaterial({ map:marbleTex, roughness:.27, metalness:.02, clearcoat:.12, clearcoatRoughness:.2 }),
  oak: new THREE.MeshStandardMaterial({ map:oakTex, roughness:.55 }),
  darkOak: new THREE.MeshStandardMaterial({ color:0x55443a, roughness:.62 }),
  glass: new THREE.MeshPhysicalMaterial({ color:0xcbe7f2, transmission:.72, transparent:true, opacity:.38, roughness:.07, metalness:.04, ior:1.45 }),
  smokedGlass: new THREE.MeshPhysicalMaterial({ color:0x55717f, transmission:.55, transparent:true, opacity:.43, roughness:.09, metalness:.06 }),
  bronze: new THREE.MeshStandardMaterial({ color:0x8f765c, metalness:.72, roughness:.26 }),
  black: new THREE.MeshStandardMaterial({ color:0x1d2023, roughness:.38, metalness:.22 }),
  whiteJoinery: new THREE.MeshStandardMaterial({ color:0xf2efe8, roughness:.32 }),
  stone: new THREE.MeshStandardMaterial({ color:0xc8c1b6, roughness:.72 }),
  concrete: new THREE.MeshStandardMaterial({ color:0xb8b3aa, roughness:.86 }),
  grass: new THREE.MeshStandardMaterial({ map:grassTex, roughness:1 }),
  water: new THREE.MeshPhysicalMaterial({ color:0x3aa2c2, transparent:true, opacity:.74, roughness:.08, transmission:.24, clearcoat:.9, clearcoatRoughness:.1 }),
  fabric: new THREE.MeshStandardMaterial({ color:0xc9c1b7, roughness:.95 }),
  fabricDark: new THREE.MeshStandardMaterial({ color:0x6f6a64, roughness:.96 }),
  bed: new THREE.MeshStandardMaterial({ color:0xe9e1d6, roughness:.92 }),
  green: new THREE.MeshStandardMaterial({ color:0x526f43, roughness:.9 }),
  soil: new THREE.MeshStandardMaterial({ color:0x594838, roughness:1 }),
};

// ---------------------------------------------------------------------------
// Geometry helpers and collision registry
// ---------------------------------------------------------------------------
const obstacles = [];
function addObstacle(x1, z1, x2, z2, thickness = .20) { obstacles.push({x1,z1,x2,z2,thickness}); }
function box(x, y, z, w, h, d, mat, cast = true, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
}
function cylinder(x,y,z,r,h,mat,segments=32,parent=scene) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function wallX(x1, x2, z, h=3.0, t=HOUSE.wallThickness, mat=mats.wall, collide=true) {
  const m=box((x1+x2)/2,h/2,z,Math.abs(x2-x1),h,t,mat);
  if(collide) addObstacle(x1,z,x2,z,t); return m;
}
function wallZ(x, z1, z2, h=3.0, t=HOUSE.wallThickness, mat=mats.wall, collide=true) {
  const m=box(x,h/2,(z1+z2)/2,t,h,Math.abs(z2-z1),mat);
  if(collide) addObstacle(x,z1,x,z2,t); return m;
}
function frameWindow(x,y,z,w,h,rot=0,mat=mats.glass){
  const g=new THREE.Group();
  const glass=box(0,0,0,w,h,.05,mat,false,g); glass.position.y=h/2;
  const f=.055;
  for(const xx of [-w/2,w/2]){const b=box(xx,h/2,0,f,h+.06,.08,mats.black,true,g); b.position.x=xx;}
  for(const yy of [0,h]){const b=box(0,yy,0,w+.05,f,.08,mats.black,true,g); b.position.y=yy;}
  if(w>2.2){ const mullions=Math.floor(w/1.65); for(let i=1;i<=mullions;i++){const xx=-w/2+(w*i/(mullions+1)); box(xx,h/2,0,.035,h,.07,mats.black,true,g);} }
  g.position.set(x,y,z); g.rotation.y=rot; scene.add(g); return g;
}
function doorway(x,z,w=1.05,h=2.3,rot=0){
  const g=new THREE.Group();
  box(-w/2,h/2,0,.055,h,.12,mats.bronze,true,g);
  box(w/2,h/2,0,.055,h,.12,mats.bronze,true,g);
  box(0,h,0,w+.06,.055,.12,mats.bronze,true,g);
  g.position.set(x,0,z); g.rotation.y=rot; scene.add(g); return g;
}
function rug(x,z,w,d,color=0xd9d2c8){ return box(x,.075,z,w,.025,d,new THREE.MeshStandardMaterial({color,roughness:1}),false); }
function ceilingPanel(x,z,w,d,y,mat=mats.wall){ return box(x,y,z,w,.07,d,mat,false); }

// ---------------------------------------------------------------------------
// Site / hard landscaping
// ---------------------------------------------------------------------------
box(0,-.20,0,SITE.width,.32,SITE.depth,mats.grass,false);
// road, pavement and driveway
box(0,-.10,19.0,SITE.width,.12,2.0,new THREE.MeshStandardMaterial({color:0x55585b,roughness:1}),false);
box(0,-.04,17.65,SITE.width,.06,.7,new THREE.MeshStandardMaterial({color:0xbdb8af,roughness:.9}),false);
box(7.1,-.02,13.5,7.0,.07,7.6,new THREE.MeshStandardMaterial({color:0xbbb2a4,roughness:.82}),false);
for(let z=10.0; z<17; z+=.9) box(7.1,.02,z,6.7,.015,.035,mats.stone,false);
// accessible path from front gate to entry
box(.6,.015,11.5,2.0,.05,7.5,new THREE.MeshStandardMaterial({color:0xd4cec3,roughness:.68}),false);

// boundary hedge
for(let x=-14.4;x<=14.4;x+=1.0){
  if(Math.abs(x-7.1)>.1) box(x,.75,16.9,.9,1.5,.65,mats.green,false);
  box(x,.75,-19.3,.9,1.5,.65,mats.green,false);
}
for(let z=-18.5;z<=16.0;z+=1.0){ box(-14.4,.75,z,.65,1.5,.9,mats.green,false); box(14.4,.75,z,.65,1.5,.9,mats.green,false); }

// planting beds
box(-10.8,.02,10.6,3.4,.08,4.2,mats.soil,false);
box(-10.8,.02,-10.5,3.6,.08,7.0,mats.soil,false);
box(11.2,.02,-7.3,2.4,.08,9.5,mats.soil,false);

function tree(x,z,scale=1){
  const g=new THREE.Group();
  cylinder(0,1.05*scale,0,.18*scale,2.1*scale,new THREE.MeshStandardMaterial({color:0x6b5138,roughness:1}),16,g);
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.0*scale,2),mats.green); crown.position.y=2.7*scale; crown.castShadow=true; g.add(crown);
  g.position.set(x,0,z); scene.add(g);
}
[[-11.4,12.3,1.05],[-11.0,-8.6,1.15],[-10.5,-13.0,1], [11.2,-4.5,.9],[11.0,-10.2,1.0],[12.0,8.5,.85]].forEach(v=>tree(...v));

function shrub(x,z,r=.35){ const s=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),mats.green); s.position.set(x,r*.85,z); s.castShadow=true; scene.add(s); }
for(let i=0;i<28;i++) shrub(-11.8+Math.random()*2.2,9+Math.random()*5,.24+Math.random()*.25);
for(let i=0;i<34;i++) shrub(10.5+Math.random()*1.4,-12+Math.random()*10,.22+Math.random()*.28);

// ---------------------------------------------------------------------------
// House floors
// ---------------------------------------------------------------------------
const houseZ=HOUSE.z;
box(0,.02,houseZ,HOUSE.width,.10,HOUSE.depth,mats.marble,false);
for(const r of ROOMS){
  const m=r.finish==='wood'?mats.oak:mats.marble;
  box(r.x,.085,r.z+houseZ,r.w,.025,r.d,m,false);
}
// terrace flush with living floor
box(4.7,.035,-5.95,11.6,.075,4.1,new THREE.MeshStandardMaterial({color:0xd7d0c5,roughness:.6}),false);

// ---------------------------------------------------------------------------
// External envelope with tall openings
// ---------------------------------------------------------------------------
const north=houseZ+HOUSE.depth/2, south=houseZ-HOUSE.depth/2, west=-HOUSE.width/2, east=HOUSE.width/2;
// north facade: front entry and architectural glazing
wallX(west,-.2,north,3.05);
wallX(1.15,east,north,3.05);
doorway(.48,north,1.35,2.55,0);
frameWindow(5.5,.18,north+.01,4.9,2.55,0,mats.smokedGlass);
// south facade: bedrooms at left, huge living glass at right
wallX(west,-7.9,south,2.8);
wallX(-5.0,-2.7,south,2.8);
wallX(-.1,1.9,south,3.05);
wallX(8.3,east,south,3.05);
frameWindow(-6.45,.15,south-.02,2.7,2.35,Math.PI,mats.glass);
frameWindow(-1.42,.15,south-.02,2.45,2.35,Math.PI,mats.glass);
frameWindow(5.10,.08,south-.03,6.2,2.82,Math.PI,mats.glass);
// west mostly private
wallZ(west,south,north,2.8);
frameWindow(west-.015,.55,2.3,1.7,1.4,Math.PI/2,mats.glass);
frameWindow(west-.015,.55,5.9,1.7,1.4,Math.PI/2,mats.glass);
// east panoramic glass toward garden/pool
wallZ(east,south,-.5,3.05);
wallZ(east,5.4,north,3.05);
frameWindow(east+.02,.10,2.45,5.8,2.78,-Math.PI/2,mats.glass);

// fascia / flat roof bands
box(0,3.06,north,HOUSE.width+.2,.22,.28,mats.wallWarm,true);
box(0,3.06,south,HOUSE.width+.2,.22,.28,mats.wallWarm,true);
box(west,3.06,houseZ,.28,.22,HOUSE.depth+.2,mats.wallWarm,true);
box(east,3.06,houseZ,.28,.22,HOUSE.depth+.2,mats.wallWarm,true);

// ---------------------------------------------------------------------------
// Internal walls. Openings are intentionally represented by wall breaks.
// ---------------------------------------------------------------------------
// bedroom/private wing separators
wallZ(-5.95,-2.0,1.25,2.8); wallZ(-5.95,2.45,6.9,2.8);
wallZ(-1.60,-2.0,1.20,2.8); wallZ(-1.60,2.30,6.9,2.8);
wallZ(2.45,3.1,6.9,3.0); wallZ(2.45,-1.9,.9,3.0);
wallX(west,-6.55,2.25,2.8); wallX(-5.15,-3.80,2.25,2.8); wallX(-2.65,-1.60,2.25,2.8);
wallX(-1.60,-.05,2.25,3.0); wallX(1.25,2.45,2.25,3.0);
// master / ensuite / guest WC zone at south
wallX(west,-6.0,-2.45,2.8); wallX(-4.8,-2.65,-2.45,2.8); wallX(-1.6,-.4,-2.45,2.8); wallX(.8,2.45,-2.45,2.8);
wallZ(-2.7,south,-4.9,2.8); wallZ(-2.7,-3.7,-2.45,2.8);
wallZ(-.25,south,-5.0,2.8); wallZ(-.25,-3.9,-2.45,2.8);
// hall storage wall
wallZ(2.45,-2.45,-.7,3.0); wallZ(2.45,.75,2.25,3.0);

// doorway trims
[
 [-5.95,1.82,1.1,0],[-1.60,1.75,1.0,0],[2.45,1.48,1.1,Math.PI/2],
 [-5.85,2.25,1.15,0],[-3.20,2.25,1.05,0],[.55,2.25,1.0,0],
 [-5.4,-2.45,1.1,0],[-2.15,-2.45,1.0,0],[.25,-2.45,1.0,0]
].forEach(([x,z,w,rot])=>doorway(x,z,w,2.3,rot));

// ---------------------------------------------------------------------------
// Ceilings: private wing 2.8 m, principal zone taller, living partly vaulted
// ---------------------------------------------------------------------------
ceilingPanel(-6.0,houseZ,9.0,HOUSE.depth,2.82);
ceilingPanel(-.4,4.45,2.9,4.3,3.02);
ceilingPanel(5.5,4.6,9.4,4.3,3.07);
// living vaulted ceiling planes
function vaultedPanel(x,z,w,d,y,angle){ const m=box(x,y,z,w,.08,d,mats.wall,false); m.rotation.z=angle; return m; }
vaultedPanel(3.75,-.55,3.8,4.0,3.60,-.22);
vaultedPanel(6.65,-.55,3.8,4.0,3.60,.22);

// ---------------------------------------------------------------------------
// Built-in joinery / central storage
// ---------------------------------------------------------------------------
for(let i=0;i<4;i++){
  box(-.75+i*.78,1.25,.0+houseZ,.73,2.5,.58,mats.whiteJoinery,true);
  box(-.75+i*.78,1.27,.31+houseZ,.012,2.36,.02,mats.bronze,false);
}

// ---------------------------------------------------------------------------
// Kitchen: tall wall, stone island, low accessible prep section
// ---------------------------------------------------------------------------
for(let i=0;i<6;i++) box(3.15+i*.78,1.15,6.95,.74,2.25,.62,mats.whiteJoinery,true);
box(5.3,.47,4.4,3.7,.88,1.18,mats.whiteJoinery,true);
box(5.3,.92,4.4,3.82,.08,1.28,new THREE.MeshStandardMaterial({color:0xd5d0c7,roughness:.18,metalness:.02}),true);
// accessible lowered preparation wing
box(7.28,.39,4.40,1.25,.72,.82,mats.whiteJoinery,true);
box(7.28,.77,4.40,1.34,.06,.90,mats.stone,true);
// stools
for(const x of [4.25,5.35,6.45]){ cylinder(x,.35,3.66,.20,.70,mats.bronze,24); box(x,.73,3.66,.43,.09,.43,mats.darkOak,true); }
// pendant lights
for(const x of [4.25,5.35,6.45]){ box(x,2.65,4.2,.03,.5,.03,mats.black,false); cylinder(x,2.35,4.2,.20,.18,mats.bronze,32); pointLight(x,2.18,4.2,.7,3.2); }

// ---------------------------------------------------------------------------
// Dining
// ---------------------------------------------------------------------------
const diningZ=2.05;
box(7.0,.42,diningZ,2.55,.10,1.05,mats.darkOak,true);
for(const x of [6.0,6.65,7.35,8.0]){
  const zA=diningZ-.77,zB=diningZ+.77;
  box(x,.43,zA,.50,.78,.50,mats.fabricDark,true); box(x,.43,zB,.50,.78,.50,mats.fabricDark,true);
}
for(const x of [6.35,7.65]){ box(x,2.55,diningZ,.03,.55,.03,mats.black,false); cylinder(x,2.22,diningZ,.28,.18,mats.bronze,32); pointLight(x,2.05,diningZ,.75,4); }

// ---------------------------------------------------------------------------
// Living room: large sectional, stone TV wall, mood LED
// ---------------------------------------------------------------------------
rug(5.1,-.6,5.6,3.2,0xd6cfc5);
box(5.4,.38,-1.3,3.6,.70,.90,mats.fabric,true);
box(7.0,.38,-.05,.85,.70,2.4,mats.fabric,true);
box(4.3,.28,-.05,1.2,.48,.80,mats.fabric,true);
box(4.9,.32,.05,1.6,.09,.8,mats.darkOak,true);
// TV feature wall
box(9.45,1.35,-.55,.18,2.65,4.0,mats.stone,true);
box(9.32,1.55,-.55,.035,1.45,2.45,mats.black,false);
box(9.20,.33,-.55,.26,.38,2.65,mats.darkOak,true);
// linear mood lighting along ceiling edges
for(const z of [-2.25,1.02]){ const strip=box(5.4,3.12,z,6.2,.035,.035,new THREE.MeshBasicMaterial({color:0xffd5a0}),false); strip.userData.isMoodStrip=true; }
pointLight(4.4,2.8,-1.9,1.0,5.2); pointLight(6.8,2.8,-1.9,1.0,5.2);

// ---------------------------------------------------------------------------
// Bedrooms / office
// ---------------------------------------------------------------------------
function bed(x,z,w=1.6,d=2.05,rot=0){
  const g=new THREE.Group();
  box(0,.25,0,w,.38,d,mats.bed,true,g); box(0,.62,d/2-.10,w,.78,.13,mats.fabricDark,true,g);
  box(-w*.23,.51,-.62,.62,.15,.48,mats.wall,false,g); box(w*.23,.51,-.62,.62,.15,.48,mats.wall,false,g);
  g.position.set(x,0,z); g.rotation.y=rot; scene.add(g); return g;
}
bed(-8.05,.15+houseZ,1.55,2.0,0); bed(-3.75,.15+houseZ,1.55,2.0,0);
bed(-7.55,4.65+houseZ,1.20,2.0,0); // extra circulation in accessible room
bed(-5.35,-4.45+houseZ,1.8,2.1,0);
// bedside tables and lighting
[[-8.95,.2],[-7.15,.2],[-4.65,.2],[-2.85,.2],[-6.55,-4.3],[-4.15,-4.3]].forEach(([x,z])=>{box(x,.28,z+houseZ,.52,.52,.44,mats.whiteJoinery,true); pointLight(x,1.55,z+houseZ,.45,2.5);});
// accessible wardrobe and desk
box(-9.65,1.15,5.35+houseZ,.60,2.25,2.6,mats.whiteJoinery,true);
box(-6.0,.38,5.55+houseZ,1.5,.07,.72,mats.darkOak,true);
box(-6.0,.38,6.05+houseZ,.62,.72,.62,mats.fabricDark,true);
// office
box(.45,.39,4.95+houseZ,1.65,.08,.75,mats.darkOak,true);
box(.45,.47,5.58+houseZ,.62,.82,.62,mats.fabricDark,true);
box(1.95,1.20,4.55+houseZ,.48,2.25,2.4,mats.whiteJoinery,true);

// ---------------------------------------------------------------------------
// Bathrooms: full-height marble feel, roll-in shower, grab rail, wall basin
// ---------------------------------------------------------------------------
function vanity(x,z,w=1.2,rot=0){
  const g=new THREE.Group(); box(0,.48,0,w,.55,.52,mats.whiteJoinery,true,g); box(0,.79,0,w+.08,.07,.58,mats.stone,true,g); box(0,1.55,.27,w*.82,1.15,.035,mats.smokedGlass,false,g); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
}
function toilet(x,z,rot=0){
  const g=new THREE.Group(); box(0,.35,0,.38,.32,.58,mats.whiteJoinery,true,g); cylinder(0,.54,-.08,.24,.10,mats.whiteJoinery,32,g); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
}
// accessible bathroom
vanity(-3.0,6.05+houseZ,.95,Math.PI);
toilet(-4.0,4.3+houseZ,Math.PI/2);
box(-2.25,.02,4.15+houseZ,1.35,.025,1.75,new THREE.MeshStandardMaterial({color:0xe3e0d9,roughness:.26}),false);
frameWindow(-1.88,.02,3.42+houseZ,1.30,2.05,Math.PI/2,mats.glass); // shower screen
box(-4.25,.88,4.30+houseZ,.05,.05,1.15,mats.bronze,false);
// ensuite
vanity(-1.35,-5.15+houseZ,.9,0); toilet(-.65,-3.95+houseZ,Math.PI/2);
box(-2.15,.02,-4.45+houseZ,.9,.025,1.45,mats.marble,false);
frameWindow(-1.70,.02,-4.45+houseZ,.9,2.0,Math.PI/2,mats.glass);
// guest WC
vanity(.85,-4.75+houseZ,.55,0); toilet(1.35,-3.95+houseZ,0);

// ---------------------------------------------------------------------------
// Recessed ceiling lighting throughout
// ---------------------------------------------------------------------------
function downlight(x,z,y=2.74){
  const trim=cylinder(x,y,z,.045,.03,mats.black,24); trim.rotation.x=Math.PI/2;
  pointLight(x,y-.08,z,.34,3.3,0xffe4bd);
}
for(const [x,z] of [
 [-8,1.2],[-8,4.6],[-4,1.2],[-4,4.6],[-7.3,6.2],[-4,6.1],[-.3,6.1],[1.5,5.1],
 [3.2,5.7],[5.5,5.7],[7.8,5.7],[3.3,1.0],[5.5,1.0],[7.8,1.0],
 [-6,-3.6],[-4.3,-3.6],[-1.4,-3.7],[.9,-3.7]
]) downlight(x,z+houseZ, z<0?2.68:2.74);

// ---------------------------------------------------------------------------
// Terrace / outdoor living / pergola
// ---------------------------------------------------------------------------
// pergola frame
for(const x of [1.0,8.9]) for(const z of [-4.4,-7.45]) cylinder(x,1.35,z,.065,2.7,mats.bronze,16);
box(4.95,2.72,-4.4,8.05,.10,.10,mats.bronze,true); box(4.95,2.72,-7.45,8.05,.10,.10,mats.bronze,true);
for(let x=1.2;x<8.9;x+=.45) box(x,2.73,-5.93,.055,.08,3.1,mats.bronze,false);
// outdoor lounge
rug(4.8,-6.0,5.2,2.5,0xc4b9aa);
box(3.55,.34,-6.25,2.6,.62,.78,mats.fabricDark,true); box(5.85,.34,-6.25,1.75,.62,.78,mats.fabricDark,true);
box(4.75,.26,-5.3,1.35,.08,.72,mats.darkOak,true);
pointLight(2.0,2.42,-5.6,.65,4.5); pointLight(7.8,2.42,-5.6,.65,4.5);

// ---------------------------------------------------------------------------
// Pool, automatic slatted cover, deck and landscaping
// ---------------------------------------------------------------------------
box(POOL.x,-.10,POOL.z,POOL.deckWidth,.14,POOL.deckDepth,new THREE.MeshStandardMaterial({color:0xd9d2c6,roughness:.55}),false);
box(POOL.x,-.23,POOL.z,POOL.width+.35,.38,POOL.depth+.35,mats.concrete,false);
const poolWater=box(POOL.x,-.015,POOL.z,POOL.width,.06,POOL.depth,mats.water,false);
// pool coping
box(POOL.x,.02,POOL.z-POOL.depth/2-.13,POOL.width+.45,.10,.22,mats.stone,false);
box(POOL.x,.02,POOL.z+POOL.depth/2+.13,POOL.width+.45,.10,.22,mats.stone,false);
box(POOL.x-POOL.width/2-.13,.02,POOL.z,.22,.10,POOL.depth+.45,mats.stone,false);
box(POOL.x+POOL.width/2+.13,.02,POOL.z,.22,.10,POOL.depth+.45,mats.stone,false);
const poolCover=box(POOL.x,.06,POOL.z,POOL.width-.08,.045,POOL.depth-.08,new THREE.MeshStandardMaterial({color:0xb8c0c2,metalness:.5,roughness:.35}),false);
poolCover.visible=false;
for(let z=POOL.z-1.85;z<=POOL.z+1.85;z+=.12) box(POOL.x,.085,z,POOL.width-.14,.012,.018,new THREE.MeshBasicMaterial({color:0xd8dcdd}),false,poolCover);
// pool shower
cylinder(9.85,.95,-8.0,.045,1.9,mats.bronze,20); box(9.62,1.85,-8,.52,.045,.045,mats.bronze,false);
// sun loungers
for(const z of [-8.6,-10.15,-11.7]){ box(-.55,.22,z,.72,.18,1.8,mats.fabric,true); box(-.55,.58,z+.55,.72,.78,.09,mats.fabric,true).rotation.x=-.35; }
// ornamental grasses by pool edge
for(let z=-13;z<-7.5;z+=.55) shrub(10.65+Math.random()*.45,z,.18+Math.random()*.12);

// ---------------------------------------------------------------------------
// Front facade details / modern arrival
// ---------------------------------------------------------------------------
box(-2.4,1.2,7.78,3.4,2.35,.12,new THREE.MeshStandardMaterial({color:0xb6a48d,roughness:.65}),true);
for(let x=-3.8;x<-.9;x+=.38) box(x,1.25,7.88,.12,2.5,.16,mats.darkOak,true);
box(.5,2.9,7.9,3.0,.15,1.6,mats.wallWarm,true);
pointLight(-.3,2.4,7.85,.7,3.8); pointLight(1.3,2.4,7.85,.7,3.8);

// ---------------------------------------------------------------------------
// Accessibility visualisation
// ---------------------------------------------------------------------------
const turnMat = new THREE.MeshBasicMaterial({ color:0x28a5d5, transparent:true, opacity:.23, side:THREE.DoubleSide, depthWrite:false });
const turningCircle = new THREE.Mesh(new THREE.CircleGeometry(.75,64),turnMat);
turningCircle.rotation.x=-Math.PI/2; turningCircle.position.y=.11; turningCircle.visible=false; scene.add(turningCircle);

// ---------------------------------------------------------------------------
// Navigation, teleport and collisions
// ---------------------------------------------------------------------------
let profile='walk';
const profileSel=document.getElementById('profile');
profileSel.onchange=()=>{ profile=profileSel.value; camera.position.y=profile==='wheelchair'?1.14:1.65; };
document.getElementById('turn').onchange=e=>turningCircle.visible=e.target.value==='on';

const teleportSel=document.getElementById('teleport');
for(const name of Object.keys(TELEPORTS)){ const o=document.createElement('option'); o.value=o.textContent=name; teleportSel.appendChild(o); }
function teleport(name){
  const t=TELEPORTS[name]; if(!t) return;
  camera.position.set(t[0],profile==='wheelchair'?1.14:t[1],t[2]);
  const dir=new THREE.Vector3(Math.sin(t[3]),0,-Math.cos(t[3])); camera.lookAt(camera.position.clone().add(dir));
}
teleportSel.onchange=()=>teleport(teleportSel.value);
document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>{ teleportSel.value=b.dataset.go; teleport(b.dataset.go); });

camera.position.set(.5,1.65,9.7); camera.lookAt(.5,1.55,6.0);

function pointSegDist(px,pz,x1,z1,x2,z2){
  const vx=x2-x1,vz=z2-z1,wx=px-x1,wz=pz-z1,c1=vx*wx+vz*wz;
  if(c1<=0)return Math.hypot(px-x1,pz-z1); const c2=vx*vx+vz*vz;
  if(c2<=c1)return Math.hypot(px-x2,pz-z2); const b=c1/c2; return Math.hypot(px-(x1+b*vx),pz-(z1+b*vz));
}
function collides(x,z){
  const radius=profile==='wheelchair'?0.43:0.27;
  if(x<-SITE.width/2+radius||x>SITE.width/2-radius||z<-SITE.depth/2+radius||z>SITE.depth/2-radius) return true;
  // pool is a hard obstacle; keep walker on deck
  if(x>POOL.x-POOL.width/2-radius && x<POOL.x+POOL.width/2+radius && z>POOL.z-POOL.depth/2-radius && z<POOL.z+POOL.depth/2+radius) return true;
  return obstacles.some(w=>pointSegDist(x,z,w.x1,w.z1,w.x2,w.z2)<radius+w.thickness/2);
}

const pressed=new Set();
addEventListener('keydown',e=>pressed.add(e.code)); addEventListener('keyup',e=>pressed.delete(e.code));
let last=performance.now();
function updateMovement(){
  const now=performance.now(),dt=Math.min(.05,(now-last)/1000); last=now;
  if(!controls.isLocked) return;
  const sprint=pressed.has('ShiftLeft')||pressed.has('ShiftRight');
  const speed=(profile==='wheelchair'?1.65:2.6)*(sprint?1.55:1);
  let f=0,s=0; if(pressed.has('KeyW')||pressed.has('ArrowUp'))f+=1; if(pressed.has('KeyS')||pressed.has('ArrowDown'))f-=1; if(pressed.has('KeyD')||pressed.has('ArrowRight'))s+=1; if(pressed.has('KeyA')||pressed.has('ArrowLeft'))s-=1;
  if(!f&&!s) return;
  const old=camera.position.clone();
  const forward=new THREE.Vector3(); camera.getWorldDirection(forward); forward.y=0; forward.normalize();
  const right=new THREE.Vector3().crossVectors(forward,camera.up).normalize();
  const v=new THREE.Vector3().addScaledVector(forward,f).addScaledVector(right,s).normalize().multiplyScalar(speed*dt);
  camera.position.add(v); camera.position.y=profile==='wheelchair'?1.14:1.65;
  if(collides(camera.position.x,camera.position.z)) camera.position.copy(old);
}

// ---------------------------------------------------------------------------
// Time / mood system
// ---------------------------------------------------------------------------
const timeSlider=document.getElementById('time');
const timeValue=document.getElementById('timeValue');
const moodSel=document.getElementById('mood');
const poolCoverSel=document.getElementById('poolCover');
poolCoverSel.onchange=()=>{ poolCover.visible=poolCoverSel.value==='closed'; poolWater.visible=poolCoverSel.value!=='closed'; };
function formatHour(hour){ let h=Math.floor(hour)%24,m=Math.round((hour-h)*60); if(m===60){h=(h+1)%24;m=0;} return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
function setTime(hour){
  const solar=(hour-6)/12*Math.PI;
  const elev=Math.sin(solar);
  sun.position.set(Math.cos(solar)*28,Math.max(.4,elev*30),-12+Math.sin(solar*.82)*15);
  const daylight=THREE.MathUtils.clamp((elev+.08)*1.45,.03,1);
  sun.intensity=.18+3.15*daylight; hemi.intensity=.20+1.15*daylight;
  const skyDay=new THREE.Color(0xcadce8),skyDusk=new THREE.Color(0xc58e78),skyNight=new THREE.Color(0x070b13);
  let sky;
  if(daylight<.15) sky=skyNight.clone().lerp(skyDusk,daylight/.15);
  else sky=skyDusk.clone().lerp(skyDay,(daylight-.15)/.85);
  scene.background=sky; scene.fog.color.copy(sky);
  const autoPractical=THREE.MathUtils.clamp(1.2-daylight*1.6,.0,1.0);
  let p=autoPractical;
  if(moodSel.value==='day') p=.08;
  if(moodSel.value==='evening') p=.78;
  if(moodSel.value==='night') p=1.0;
  practicalLights.forEach(l=>l.intensity=(l.userData.baseIntensity||l.intensity||1)*p);
  scene.traverse(o=>{ if(o.userData?.isMoodStrip && o.material?.color) o.material.color.set(p>.35?0xffd19b:0x5f5244); });
  renderer.toneMappingExposure=.92+.25*daylight;
  timeValue.textContent=formatHour(hour);
}
practicalLights.forEach(l=>l.userData.baseIntensity=l.intensity);
timeSlider.oninput=()=>setTime(Number(timeSlider.value));
moodSel.onchange=()=>{ if(moodSel.value==='day'){timeSlider.value=13.5;} if(moodSel.value==='evening'){timeSlider.value=19;} if(moodSel.value==='night'){timeSlider.value=22;} setTime(Number(timeSlider.value)); };
setTime(Number(timeSlider.value));

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------
const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  updateMovement();
  turningCircle.position.set(camera.position.x,.11,camera.position.z);
  // subtle water shimmer
  const t=clock.getElapsedTime();
  poolWater.position.y=-.015+Math.sin(t*1.2)*.006;
  renderer.render(scene,camera);
}
animate();

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight);
});
