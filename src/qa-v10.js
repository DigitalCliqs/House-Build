import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xc9d5df);
scene.fog=new THREE.Fog(0xc9d5df,42,95);

const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.05,180);
camera.position.set(24,13,25);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.target.set(0,1.8,0);
controls.maxPolarAngle=Math.PI*.48;
controls.minDistance=3;
controls.maxDistance=60;

const M={
  plaster:new THREE.MeshStandardMaterial({color:0xf4f1eb,roughness:.78}),
  plasterWarm:new THREE.MeshStandardMaterial({color:0xe8e1d7,roughness:.8}),
  stone:new THREE.MeshStandardMaterial({color:0x6d6a64,roughness:.95}),
  roof:new THREE.MeshStandardMaterial({color:0x33383d,roughness:.58,metalness:.12,side:THREE.DoubleSide}),
  graphite:new THREE.MeshStandardMaterial({color:0x20252a,roughness:.32,metalness:.46}),
  glass:new THREE.MeshPhysicalMaterial({color:0xd7edf4,roughness:.03,transmission:.83,transparent:true,opacity:.42,ior:1.45,thickness:.02}),
  bronze:new THREE.MeshStandardMaterial({color:0x9a7757,roughness:.25,metalness:.74}),
  marble:new THREE.MeshPhysicalMaterial({color:0xf2efe8,roughness:.16,clearcoat:.3,clearcoatRoughness:.15}),
  oak:new THREE.MeshStandardMaterial({color:0x9b7048,roughness:.48}),
  darkOak:new THREE.MeshStandardMaterial({color:0x4b382c,roughness:.52}),
  lawn:new THREE.MeshStandardMaterial({color:0x6f8c58,roughness:1}),
  paving:new THREE.MeshStandardMaterial({color:0xcfc8be,roughness:.76}),
  water:new THREE.MeshPhysicalMaterial({color:0x45aeca,roughness:.06,transmission:.22,transparent:true,opacity:.88,clearcoat:1}),
  fabric:new THREE.MeshStandardMaterial({color:0xc9c0b4,roughness:.94}),
  white:new THREE.MeshStandardMaterial({color:0xf6f4ef,roughness:.34}),
  black:new THREE.MeshStandardMaterial({color:0x171a1d,roughness:.35}),
  hedge:new THREE.MeshStandardMaterial({color:0x49643c,roughness:1}),
};

function box(x,y,z,w,h,d,mat=M.plaster,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m;}
function cyl(x,y,z,r,h,mat=M.graphite,seg=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
function glassPanel(x,y,z,w,h,rot=0){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.BoxGeometry(w,h,.045),M.glass);p.position.y=h/2;g.add(p);const f=.055;for(const xx of [-w/2,w/2]){const a=new THREE.Mesh(new THREE.BoxGeometry(f,h+.08,.09),M.graphite);a.position.set(xx,h/2,0);g.add(a)}for(const yy of [0,h]){const a=new THREE.Mesh(new THREE.BoxGeometry(w+.08,f,.09),M.graphite);a.position.set(0,yy,0);g.add(a)}g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);return g;}

function roofPlane(points){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex(points.length===4?[0,1,2,0,2,3]:[0,1,2]);g.computeVertexNormals();const m=new THREE.Mesh(g,M.roof);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function hippedRoof(cx,cz,w,d,eave,ridge,ridgeFrac=.34){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,rh=w*ridgeFrac/2,rx0=cx-rh,rx1=cx+rh;
 roofPlane([[x0,eave,z1],[x1,eave,z1],[rx1,ridge,cz],[rx0,ridge,cz]]);
 roofPlane([[x1,eave,z0],[x0,eave,z0],[rx0,ridge,cz],[rx1,ridge,cz]]);
 roofPlane([[x0,eave,z0],[x0,eave,z1],[rx0,ridge,cz]]);
 roofPlane([[x1,eave,z1],[x1,eave,z0],[rx1,ridge,cz]]);
 for(const z of [z0,z1]) box(cx,eave-.08,z,w+.25,.12,.09,M.graphite,true);
 for(const x of [x0,x1]) box(x,eave-.08,cz,.09,.12,d+.25,M.graphite,true);
 box(cx,ridge+.04,cz,w*ridgeFrac,.09,.16,M.graphite,true);
}

// Site / approach
box(0,-.18,0,30,.35,40,M.lawn,false);
box(0,.025,-7.9,19,.12,8.3,M.paving,false);
box(0,.035,8.4,14,.11,7.0,M.paving,false);
box(0,.04,17.2,7,.11,4.8,new THREE.MeshStandardMaterial({color:0x5a5d60,roughness:1}),false);
for(let x=-14;x<=14;x+=1.8){box(x,.8,-19.1,1.55,1.6,.55,M.hedge,false);box(x,.8,19.1,1.55,1.6,.55,M.hedge,false)}
for(let z=-17;z<=17;z+=1.8){box(-14.3,.8,z,.55,1.6,1.55,M.hedge,false);box(14.3,.8,z,.55,1.6,1.55,M.hedge,false)}

// Building massing: private wing + raised living wing + dining/entry connector.
box(-4.3,1.42,2.35,12.9,2.84,10.8,M.plaster);
box(5.0,1.56,1.25,9.5,3.12,9.6,M.plaster);
box(.9,1.5,6.25,4.5,3.0,3.4,M.plasterWarm);

// Façade articulation / stone features
box(-10.55,1.25,3.3,.24,2.5,3.3,M.stone);
box(.45,1.2,7.88,2.8,2.4,.20,M.stone);
box(9.78,1.36,-.6,.18,2.72,3.4,M.stone);

// Glazing: living south, kitchen north, bedrooms south, dining bay.
glassPanel(5.0,.15,-3.57,6.8,2.62,Math.PI);
glassPanel(8.87,.14,1.55,4.6,2.55,-Math.PI/2);
glassPanel(5.2,.14,6.05,4.8,2.45,0);
glassPanel(-7.15,.12,-3.02,3.3,2.28,Math.PI);
glassPanel(-3.25,.12,-3.02,2.5,2.28,Math.PI);
glassPanel(2.25,.12,7.83,2.5,2.45,0);

// Entry portal and front door.
box(-.9,1.45,8.0,.28,2.9,1.8,M.graphite);
box(.15,1.38,8.02,1.35,2.76,.12,M.darkOak);
box(.55,1.25,7.94,.055,.92,.10,M.bronze,false);

// Complete articulated roofs.
hippedRoof(-4.25,2.45,13.25,11.1,3.05,4.35,.36);
hippedRoof(5.0,1.25,9.9,10.0,3.55,5.18,.30);
hippedRoof(.95,6.25,4.9,3.8,3.22,4.0,.24);

// Pergola / terrace.
for(const x of [1.0,8.8]) for(const z of [-5.3,-8.2]) box(x,1.35,z,.13,2.7,.13,M.graphite);
for(let x=1.0;x<=8.8;x+=.36) box(x,2.68,-6.75,.11,.08,3.1,M.graphite,false);
box(4.9,.12,-6.85,8.4,.18,3.8,M.paving,false);

// Pool and coping.
box(4.8,-.10,-11.0,8.5,.24,4.5,M.paving,false);
box(4.8,.00,-11.0,8.0,.08,4.0,M.water,false);
box(4.8,.11,-8.95,8.6,.12,.34,M.paving,false);box(4.8,.11,-13.05,8.6,.12,.34,M.paving,false);box(.65,.11,-11,.34,.12,4.4,M.paving,false);box(8.95,.11,-11,.34,.12,4.4,M.paving,false);

// Exterior furniture and landscaping detail.
box(5.5,.48,-6.2,3.4,.48,1.0,M.fabric);box(7.0,.48,-7.0,1.0,.48,1.8,M.fabric);box(4.7,.32,-7.1,1.6,.12,.8,M.darkOak);
for(const [x,z,s] of [[-11,-8,1.0],[-10,-10,.8],[10,-7,.9],[11,-11,1.1],[-11,10,.85],[11,10,.9]]){cyl(x,s*.9,z,.16,1.8*s,M.darkOak,18);const crown=new THREE.Mesh(new THREE.SphereGeometry(.72*s,22,14),M.hedge);crown.position.set(x,2.05*s,z);crown.castShadow=true;scene.add(crown)}

// Interior visible through glazing: living, dining, kitchen.
box(5.0,.18,-1.2,8.2,.08,3.2,M.marble,false);
box(5.0,.58,-1.2,3.2,.80,1.05,M.fabric);box(6.3,.58,-.35,1.05,.80,1.8,M.fabric);box(4.9,.48,-2.0,1.55,.10,.85,M.darkOak);
box(8.35,1.2,-.3,.25,1.95,3.15,M.darkOak);box(8.18,1.35,-.3,.05,1.08,1.75,M.black,false);
box(5.05,.48,3.4,3.25,.95,1.1,M.white);box(4.85,.96,3.4,2.75,.06,.84,M.marble,false);
box(6.9,1.2,5.5,4.2,2.35,.68,M.white);box(7.0,1.45,5.12,2.1,.08,.06,M.black,false);
box(6.2,.76,.85,2.4,.10,1.15,M.darkOak);for(const [x,z] of [[5.2,.3],[7.2,.3],[5.2,1.4],[7.2,1.4]]) cyl(x,.47,z,.22,.82,M.darkOak,24);

// Lighting.
const hemi=new THREE.HemisphereLight(0xeaf5ff,0x687052,1.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff2d9,4.3);sun.position.set(-18,28,16);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-28;sun.shadow.camera.right=28;sun.shadow.camera.top=28;sun.shadow.camera.bottom=-28;sun.shadow.bias=-.00015;scene.add(sun);

const views={
  'Exterior':[24,13,25,0,1.8,0],
  'Terrace / pool':[15,6,-18,4.8,1.3,-3.2],
  'Living glazing':[12,4,-9,5.3,1.5,-.6],
  'Entrance':[7,5,16,.1,1.4,7.2],
  'Garden wide':[-22,10,-23,0,1.5,0],
};
window.__QA_VIEWS__=views;
window.goQAView=(name)=>{const v=views[name]||views.Exterior;camera.position.set(v[0],v[1],v[2]);controls.target.set(v[3],v[4],v[5]);controls.update();};
window.goQAView('Exterior');

function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
