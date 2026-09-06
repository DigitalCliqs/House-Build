import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// v6 photoreal refinement layer. It extends v5 without replacing the core
// walkthrough, accessibility controls, automated doors/blinds/pool or tour UI.
let scene = null;
let renderer = null;
const originalSceneAdd = THREE.Scene.prototype.add;
const originalRendererRender = THREE.WebGLRenderer.prototype.render;

THREE.Scene.prototype.add = function (...objects) {
  if (!scene) scene = this;
  return originalSceneAdd.apply(this, objects);
};
THREE.WebGLRenderer.prototype.render = function (s, c) {
  if (!renderer) renderer = this;
  return originalRendererRender.call(this, s, c);
};

await import('./viewer-bootstrap-v5.js');
THREE.Scene.prototype.add = originalSceneAdd;
THREE.WebGLRenderer.prototype.render = originalRendererRender;

if (!scene || !renderer) throw new Error('v6 could not capture the active Three.js scene/renderer.');

// -----------------------------------------------------------------------------
// Image-based style reflections without external HDR binaries.
// RoomEnvironment is generated locally by Three.js and fed through PMREM.
// This dramatically improves marble, metal, glass and lacquered joinery.
// -----------------------------------------------------------------------------
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new RoomEnvironment();
const envRT = pmrem.fromScene(envScene, 0.04);
scene.environment = envRT.texture;
scene.environmentIntensity = 0.72;
envScene.dispose();
pmrem.dispose();

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// -----------------------------------------------------------------------------
// Architectural material palette for exterior detailing.
// -----------------------------------------------------------------------------
const MAT = {
  anthracite: new THREE.MeshStandardMaterial({ color:0x303438, roughness:.68, metalness:.10 }),
  graphite: new THREE.MeshStandardMaterial({ color:0x24282c, roughness:.38, metalness:.46 }),
  fascia: new THREE.MeshStandardMaterial({ color:0xece8e1, roughness:.56 }),
  stone: new THREE.MeshStandardMaterial({ color:0x72716b, roughness:.92 }),
  plaster: new THREE.MeshStandardMaterial({ color:0xf3f0e9, roughness:.82 }),
  bronze: new THREE.MeshStandardMaterial({ color:0x947558, roughness:.23, metalness:.76 }),
  warmGlow: new THREE.MeshBasicMaterial({ color:0xffcb89 }),
  paving: new THREE.MeshStandardMaterial({ color:0xcac2b6, roughness:.72 }),
};

function box(x,y,z,w,h,d,mat=MAT.plaster,cast=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m;
}
function cyl(x,y,z,r,h,mat=MAT.graphite,segments=24){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}

// -----------------------------------------------------------------------------
// Roof realism: tile-course shadow lines, ridges, hips, valleys and downpipes.
// The v5 roof establishes the overall Anamarija massing; this layer adds depth.
// -----------------------------------------------------------------------------
function tileCourses(cx,cz,w,d,eaveY,ridgeY,count=14){
  for(let i=1;i<count;i++){
    const t=i/count;
    const zFront=cz-d/2+t*d/2;
    const zBack=cz+d/2-t*d/2;
    const y=eaveY+(ridgeY-eaveY)*t;
    const courseW=w*(1-.25*t);
    box(cx,y+.012,zFront,courseW,.025,.038,MAT.graphite,false);
    box(cx,y+.012,zBack,courseW,.025,.038,MAT.graphite,false);
  }
  // ridge cap
  box(cx,ridgeY+.025,cz,w*.32,.08,.16,MAT.graphite,true);
}

tileCourses(-4.25,2.55,12.9,10.9,3.06,4.35,13);
tileCourses(5.1,1.65,9.4,10.2,4.18,5.45,13);
tileCourses(1.05,6.7,4.6,3.6,3.28,4.05,8);

// Visible hip/ridge trims as slim cylinders rotated between endpoints.
function beamBetween(a,b,r=.045,mat=MAT.graphite){
  const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b);
  const mid=va.clone().add(vb).multiplyScalar(.5);
  const len=va.distanceTo(vb);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12),mat);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.clone().sub(va).normalize());
  mesh.castShadow=true;scene.add(mesh);return mesh;
}
function hipTrims(cx,cz,w,d,eave,ridge,ridgeFrac=.32){
  const rh=w*ridgeFrac/2;
  const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
  beamBetween([x0,eave,z0],[cx-rh,ridge,cz]);
  beamBetween([x0,eave,z1],[cx-rh,ridge,cz]);
  beamBetween([x1,eave,z0],[cx+rh,ridge,cz]);
  beamBetween([x1,eave,z1],[cx+rh,ridge,cz]);
}
hipTrims(-4.25,2.55,12.9,10.9,3.06,4.35,.34);
hipTrims(5.1,1.65,9.4,10.2,4.18,5.45,.30);
hipTrims(1.05,6.7,4.6,3.6,3.28,4.05,.25);

// Downpipes placed at visually plausible outer corners.
for(const [x,z,y] of [[-10.55,-2.9,1.48],[-10.55,8.0,1.48],[10.0,-3.45,2.0],[9.8,6.75,2.0],[-1.25,8.45,1.58]]){
  cyl(x,y,z,.045,y*2,MAT.graphite,16);
}

// -----------------------------------------------------------------------------
// Façade depth: window reveals, stone piers and shadow gaps.
// These are subtle rather than full extra walls, preserving the v4 geometry.
// -----------------------------------------------------------------------------
function reveal(x,y,z,w,h,rot=0){
  const g=new THREE.Group();
  const side=.10,depth=.18;
  const pieces=[
    [-(w/2+side/2),h/2,0,side,h+.2,depth],
    [ (w/2+side/2),h/2,0,side,h+.2,depth],
    [0,h+.05,0,w+.2,side,depth],
  ];
  for(const [px,py,pz,pw,ph,pd] of pieces){
    const m=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,pd),MAT.plaster);m.position.set(px,py,pz);m.castShadow=true;g.add(m);
  }
  g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);
}
reveal(5.05,.12,-3.94,6.55,2.72,Math.PI);
reveal(5.45,.14,7.93,4.8,2.55,0);
reveal(-6.45,.15,-3.93,2.7,2.35,Math.PI);

// Stone-clad feature blocks with thin horizontal joints for visual depth.
function stonePier(x,z,w,d,h){
  box(x,h/2,z,w,h,d,MAT.stone,true);
  for(let y=.22;y<h;y+=.22) box(x,y,z+(d/2+.006),w+.01,.012,.014,MAT.graphite,false);
}
stonePier(-9.95,3.0,.18,3.1,2.35);
stonePier(.45,7.88,2.7,.18,2.35);

// -----------------------------------------------------------------------------
// Exterior evening lighting: entry, stone features, terrace and pool perimeter.
// It is additive and independent of the existing mood controller.
// -----------------------------------------------------------------------------
const accentLights=[];
function wallSconce(x,y,z,rotY=0){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(.10,.22,.07),MAT.graphite);g.add(body);
  const glow=new THREE.Mesh(new THREE.BoxGeometry(.07,.14,.015),MAT.warmGlow);glow.position.z=.043;g.add(glow);
  const light=new THREE.PointLight(0xffc67f,22,2.4,2);light.position.set(0,0,.16);g.add(light);
  g.position.set(x,y,z);g.rotation.y=rotY;scene.add(g);accentLights.push(light);
}
wallSconce(-9.78,1.55,4.0,Math.PI/2);
wallSconce(.45,1.55,7.80,Math.PI);
wallSconce(9.83,1.65,3.4,-Math.PI/2);
wallSconce(9.83,1.65,-1.3,-Math.PI/2);

// Pool/deck pin lights.
for(let x=1.0;x<=8.7;x+=1.1){
  const glow=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.018,16),MAT.warmGlow);
  glow.rotation.x=Math.PI/2;glow.position.set(x,.11,-7.6);scene.add(glow);
}
for(let z=-8.2;z>=-12.2;z-=.9){
  const glow=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.018,16),MAT.warmGlow);
  glow.rotation.z=Math.PI/2;glow.position.set(9.7,.11,z);scene.add(glow);
}

// -----------------------------------------------------------------------------
// Glass and water finishing pass: enhance physically-based materials already
// in the v4 scene without relying on external texture files.
// -----------------------------------------------------------------------------
scene.traverse(obj=>{
  if(!obj.isMesh||!obj.material)return;
  const mats=Array.isArray(obj.material)?obj.material:[obj.material];
  for(const m of mats){
    if(m.isMeshPhysicalMaterial){
      if(m.transmission>0){
        m.envMapIntensity=1.15;
        m.thickness=Math.max(m.thickness||0,.018);
        m.attenuationDistance=8;
        m.attenuationColor=new THREE.Color(0xeaf5f7);
      }
      if(m.clearcoat>0){m.envMapIntensity=1.0;}
      m.needsUpdate=true;
    }
    if(m.isMeshStandardMaterial&&m.metalness>.4){m.envMapIntensity=1.2;m.needsUpdate=true;}
  }
});

// -----------------------------------------------------------------------------
// Slight cinematic post-feel through exposure adaptation tied to existing mood.
// We do not replace the v4 controller; we only nudge exposure after UI changes.
// -----------------------------------------------------------------------------
const mood=document.getElementById('mood');
function refineExposure(){
  if(!mood)return;
  renderer.toneMappingExposure=mood.value==='night'?1.16:mood.value==='evening'?1.10:1.04;
  accentLights.forEach(l=>l.intensity=mood.value==='day'?5:mood.value==='night'?30:22);
}
if(mood){mood.addEventListener('change',()=>setTimeout(refineExposure,0));refineExposure();}

const label=document.getElementById('sceneLabel');
if(label) label.textContent='Finished concept v6 · PBR reflections · detailed Anamarija roof/facade · accessible EuroMax villa';

const badge=document.createElement('div');
badge.style.cssText='position:fixed;left:18px;top:94px;z-index:7;padding:7px 10px;border-radius:9px;background:rgba(14,17,22,.52);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(10px);color:#fff;font:600 11px/1.35 Inter,system-ui,sans-serif;pointer-events:none';
badge.textContent='v6 PBR environment · roof tile courses · facade reveals · exterior accent lighting';
document.body.appendChild(badge);
