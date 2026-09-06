import * as THREE from 'https://unpkg.com/three@0.184.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.184.0/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.184.0/examples/jsm/loaders/GLTFLoader.js';
import { createAnamarijaArchitectureShell } from './architecture-shell-v1.js';
import { createAnamarijaNextgenEngine } from './nextgen-engine-v1.js';

const canvasHost = document.getElementById('app');
const statusEl = document.getElementById('status');
const enterBtn = document.getElementById('enter');
const modeBtn = document.getElementById('mode');
const assetEl = document.getElementById('asset-state');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfc9cf);
scene.fog = new THREE.Fog(0xbfc9cf, 42, 110);

const camera = new THREE.PerspectiveCamera(67, innerWidth / innerHeight, 0.04, 180);
camera.position.set(0.5, 1.65, 7.15);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
canvasHost.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
enterBtn.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => statusEl.textContent = 'WASD to move · mouse to look');
controls.addEventListener('unlock', () => statusEl.textContent = 'Tap Enter walkthrough to continue');

// Lighting is deliberately physical-ish but temporary until production HDRIs are populated.
const hemi = new THREE.HemisphereLight(0xffffff, 0x66706c, 1.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4de, 3.2);
sun.position.set(-9, 14, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -25;
sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25;
sun.shadow.camera.bottom = -25;
sun.shadow.bias = -0.00025;
scene.add(sun);

const shell = createAnamarijaArchitectureShell({ THREE, scene });

async function loadRuntimeRegistry() {
  const response = await fetch('./assets/asset-registry.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`asset registry HTTP ${response.status}`);
  const registry = await response.json();
  const paths = {};
  for (const [id, entry] of Object.entries(registry.models || {})) {
    if (entry?.path) paths[id] = entry.path;
  }
  const available = Object.values(registry.models || {}).filter(entry => entry?.status === 'available').length;
  const planned = Object.values(registry.models || {}).filter(entry => entry?.status === 'planned').length;
  assetEl.textContent = `${available} production models · ${planned} planned`;
  return { raw: registry, paths };
}

const registry = await loadRuntimeRegistry().catch(error => {
  assetEl.textContent = 'asset registry unavailable';
  console.error(error);
  return { raw: {}, paths: {} };
});

const engine = createAnamarijaNextgenEngine({
  THREE,
  GLTFLoader,
  scene,
  camera,
  renderer,
  controls,
  assetRegistry: registry.paths,
  strictAssets: true,
  strictMaterials: false,
  onAssetStatus: event => {
    if (event.state === 'error') console.warn('Asset load failed', event);
  },
});

let viewMode = 'walking';
modeBtn.addEventListener('click', () => {
  viewMode = viewMode === 'walking' ? 'wheelchair' : 'walking';
  engine.setViewHeight(viewMode);
  modeBtn.textContent = viewMode === 'walking' ? 'Walking view' : 'Wheelchair view';
});

const keys = new Set();
addEventListener('keydown', event => keys.add(event.code));
addEventListener('keyup', event => keys.delete(event.code));
addEventListener('blur', () => keys.clear());

const clock = new THREE.Clock();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const intended = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);

function updateMovement(delta) {
  if (!controls.isLocked) return;
  const speed = viewMode === 'wheelchair' ? 1.65 : 2.25;
  let f = 0;
  let r = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) f += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) f -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) r += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) r -= 1;
  if (!f && !r) return;

  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() < 1e-8) forward.set(0, 0, -1);
  forward.normalize();
  right.crossVectors(forward, worldUp).normalize();

  intended.set(0, 0, 0)
    .addScaledVector(forward, f)
    .addScaledVector(right, r);
  if (intended.lengthSq() > 1) intended.normalize();
  intended.multiplyScalar(speed * Math.min(delta, 0.05));
  engine.moveFirstPerson(intended, viewMode);
}

function animate() {
  requestAnimationFrame(animate);
  updateMovement(clock.getDelta());
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Do not connect to a localhost WebSocket from GitHub Pages. A production WSS URL
// can be supplied later via ?ws=wss://host/ws/scene once the FastAPI service is deployed.
const wsUrl = new URLSearchParams(location.search).get('ws');
if (wsUrl?.startsWith('wss://') || wsUrl?.startsWith('ws://localhost')) {
  engine.connect(wsUrl, state => console.log('live scene', state));
}

statusEl.textContent = 'Tap Enter walkthrough to start';
