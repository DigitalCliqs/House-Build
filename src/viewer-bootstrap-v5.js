import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ASSET_MANIFEST, ASSET_CREDIT } from './asset-manifest-v5.js';
import { HOUSE } from './house-config.js';

// v5 bootstrap: capture the scene created by viewer-v4, then add the
// architectural roof and optional local CC0 GLB assets without duplicating
// the full first-person engine.
let capturedScene = null;
const originalAdd = THREE.Scene.prototype.add;
THREE.Scene.prototype.add = function (...objects) {
  if (!capturedScene) capturedScene = this;
  return originalAdd.apply(this, objects);
};

await import('./viewer-v4.js');
THREE.Scene.prototype.add = originalAdd;

const scene = capturedScene;
if (!scene) throw new Error('v5 could not capture the Three.js scene.');

// -----------------------------------------------------------------------------
// Articulated multi-hip roof inspired by the original Anamarija language.
// This is still design-development geometry, not a structural roof drawing.
// -----------------------------------------------------------------------------
const roofMat = new THREE.MeshStandardMaterial({
  color: 0x3f4347,
  roughness: 0.72,
  metalness: 0.08,
  side: THREE.DoubleSide,
});
const fasciaMat = new THREE.MeshStandardMaterial({ color: 0xebe7df, roughness: 0.62 });
const gutterMat = new THREE.MeshStandardMaterial({ color: 0x24282b, roughness: 0.4, metalness: 0.35 });

function roofPlane(points, material = roofMat) {
  const geometry = new THREE.BufferGeometry();
  const verts = new Float32Array(points.flat());
  geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geometry.setIndex(points.length === 3 ? [0,1,2] : [0,1,2,0,2,3]);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function hippedRoof(cx, cz, width, depth, eaveY, ridgeY, ridgeFraction = 0.32) {
  const x0 = cx - width / 2, x1 = cx + width / 2;
  const z0 = cz - depth / 2, z1 = cz + depth / 2;
  const ridgeHalf = width * ridgeFraction / 2;
  const rx0 = cx - ridgeHalf, rx1 = cx + ridgeHalf;

  // north and south fields + triangular west/east hips
  roofPlane([[x0,eaveY,z1],[x1,eaveY,z1],[rx1,ridgeY,cz],[rx0,ridgeY,cz]]);
  roofPlane([[x1,eaveY,z0],[x0,eaveY,z0],[rx0,ridgeY,cz],[rx1,ridgeY,cz]]);
  roofPlane([[x0,eaveY,z0],[x0,eaveY,z1],[rx0,ridgeY,cz]]);
  roofPlane([[x1,eaveY,z1],[x1,eaveY,z0],[rx1,ridgeY,cz]]);

  const fasciaH = 0.13;
  const edges = [
    [cx, eaveY-.03, z0, width+.34, fasciaH, .09],
    [cx, eaveY-.03, z1, width+.34, fasciaH, .09],
    [x0, eaveY-.03, cz, .09, fasciaH, depth+.34],
    [x1, eaveY-.03, cz, .09, fasciaH, depth+.34],
  ];
  for (const [x,y,z,w,h,d] of edges) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), fasciaMat);
    m.position.set(x,y,z); m.castShadow = true; scene.add(m);
  }
  for (const z of [z0-.08,z1+.08]) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(width+.38,.075,.075),gutterMat);
    g.position.set(cx,eaveY-.12,z);scene.add(g);
  }
}

// Main private wing + raised living volume + entry/dining articulation.
const hz = HOUSE.z;
hippedRoof(-4.25, hz+0.55, 12.9, 10.9, 3.06, 4.35, 0.34);
hippedRoof(5.1, hz-0.35, 9.4, 10.2, 4.18, 5.45, 0.30);
hippedRoof(1.05, hz+4.7, 4.6, 3.6, 3.28, 4.05, 0.25);

// Stone feature cladding to better echo Domprojekt's white + grey exterior.
const stoneMat = new THREE.MeshStandardMaterial({ color:0x77766f, roughness:.9 });
function featureWall(x,y,z,w,h,d){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),stoneMat);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
}
featureWall(-9.95,1.15,hz+1.0,.12,2.3,3.1);
featureWall(.45,1.15,hz+5.82,2.6,2.3,.12);

// -----------------------------------------------------------------------------
// Optional real CC0 GLB asset integration.
// The scene remains usable if files are absent; successful loads replace only
// decorative/detail objects and do not affect navigation or accessibility.
// -----------------------------------------------------------------------------
const loader = new GLTFLoader();
const status = { loaded: 0, missing: 0 };

function loadAsset(def) {
  loader.load(def.path, gltf => {
    const root = gltf.scene;
    root.position.set(...def.position);
    root.rotation.set(...def.rotation);
    root.scale.setScalar(def.scale ?? 1);
    root.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material?.map) o.material.map.anisotropy = 8;
      }
    });
    root.userData.assetId = def.id;
    scene.add(root);
    status.loaded++;
    updateAssetStatus();
  }, undefined, () => {
    status.missing++;
    updateAssetStatus();
  });
}

let statusEl = document.getElementById('assetStatus');
if (!statusEl) {
  statusEl = document.createElement('div');
  statusEl.id = 'assetStatus';
  statusEl.style.cssText = 'position:fixed;left:18px;top:62px;z-index:7;padding:7px 10px;border-radius:9px;background:rgba(14,17,22,.58);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(10px);color:white;font:600 11px/1.35 Inter,system-ui,sans-serif;pointer-events:none';
  document.body.appendChild(statusEl);
}
function updateAssetStatus(){
  statusEl.textContent = `v5 roof active · detail assets ${status.loaded}/${ASSET_MANIFEST.length} loaded · ${ASSET_CREDIT}`;
}
updateAssetStatus();
ASSET_MANIFEST.forEach(loadAsset);

const label = document.getElementById('sceneLabel');
if (label) label.textContent = 'Finished concept v5 · articulated multi-hip roof · EuroMax accessible villa + landscaped yard';
