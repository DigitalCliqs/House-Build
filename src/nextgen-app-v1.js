import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createAnamarijaArchitectureShell } from './architecture-shell-v1.js';
import { createAnamarijaNextgenEngine } from './nextgen-engine-v1.js';

const canvasHost = document.getElementById('app');
const statusEl = document.getElementById('status');
const enterBtn = document.getElementById('enter');
const modeBtn = document.getElementById('mode');
const assetEl = document.getElementById('asset-state');
const mobileButtons = {
  up: document.getElementById('move-up'),
  down: document.getElementById('move-down'),
  left: document.getElementById('move-left'),
  right: document.getElementById('move-right'),
};

window.addEventListener('error', event => {
  statusEl.style.display = 'block';
  statusEl.textContent = `Startup error: ${event.message || 'unknown error'}`;
});
window.addEventListener('unhandledrejection', event => {
  statusEl.style.display = 'block';
  statusEl.textContent = `Startup error: ${event.reason?.message || event.reason || 'unknown error'}`;
});

const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
let mobileActive = false;
if (isTouch) {
  enterBtn.textContent = 'Enter';
  modeBtn.textContent = 'Walk';
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfc9cf);
scene.fog = new THREE.Fog(0xbfc9cf, 42, 110);

const camera = new THREE.PerspectiveCamera(67, innerWidth / innerHeight, 0.04, 180);
camera.position.set(0.5, 1.65, 7.15);
camera.rotation.order = 'YXZ';

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
enterBtn.addEventListener('click', async () => {
  if (isTouch) {
    mobileActive = !mobileActive;
    document.body.classList.toggle('mobile-active', mobileActive);
    enterBtn.textContent = mobileActive ? 'Exit' : 'Enter';
    statusEl.textContent = mobileActive ? '' : 'Tap Enter to start';
    return;
  }
  try {
    controls.lock();
  } catch (error) {
    statusEl.textContent = `Pointer lock unavailable: ${error?.message || error}`;
  }
});
controls.addEventListener('lock', () => statusEl.textContent = 'WASD to move · mouse to look');
controls.addEventListener('unlock', () => statusEl.textContent = 'Tap Enter walkthrough to continue');

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

createAnamarijaArchitectureShell({ THREE, scene });

async function loadRuntimeRegistry() {
  const response = await fetch('./assets/asset-registry.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`asset registry HTTP ${response.status}`);
  const registry = await response.json();
  const paths = {};
  for (const [id, entry] of Object.entries(registry.models || {})) {
    if (entry?.path) paths[id] = entry.path;
  }
  const ready = Object.values(registry.models || {}).filter(entry => ['available','available-slot'].includes(entry?.status)).length;
  const planned = Object.values(registry.models || {}).filter(entry => entry?.status === 'planned').length;
  assetEl.textContent = `${ready} registered slots · ${planned} planned`;
  return { raw: registry, paths };
}

const registry = await loadRuntimeRegistry().catch(error => {
  assetEl.textContent = 'asset registry unavailable';
  console.error(error);
  return { raw: {}, paths: {} };
});

const engine = createAnamarijaNextgenEngine({
  THREE, GLTFLoader, scene, camera, renderer, controls,
  assetRegistry: registry.paths,
  strictAssets: true,
  strictMaterials: false,
  onAssetStatus: event => { if (event.state === 'error') console.warn('Asset load failed', event); },
});

let viewMode = 'walking';
modeBtn.addEventListener('click', () => {
  viewMode = viewMode === 'walking' ? 'wheelchair' : 'walking';
  engine.setViewHeight(viewMode);
  if (isTouch) {
    modeBtn.textContent = viewMode === 'walking' ? 'Walk' : 'Chair';
  } else {
    modeBtn.textContent = viewMode === 'walking' ? 'Walking view' : 'Wheelchair view';
    statusEl.textContent = viewMode === 'walking' ? 'Walking view active' : 'Wheelchair view active';
  }
});

const keys = new Set();
addEventListener('keydown', event => keys.add(event.code));
addEventListener('keyup', event => keys.delete(event.code));
addEventListener('blur', () => keys.clear());

const touchMove = { up:false, down:false, left:false, right:false };
function bindHold(button, key) {
  if (!button) return;
  const start = event => { event.preventDefault(); touchMove[key] = true; };
  const stop = event => { event.preventDefault(); touchMove[key] = false; };
  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', stop);
  button.addEventListener('pointercancel', stop);
  button.addEventListener('pointerleave', stop);
}
bindHold(mobileButtons.up, 'up');
bindHold(mobileButtons.down, 'down');
bindHold(mobileButtons.left, 'left');
bindHold(mobileButtons.right, 'right');

let lookPointerId = null;
let lastLookX = 0;
let lastLookY = 0;
renderer.domElement.addEventListener('pointerdown', event => {
  if (!isTouch || !mobileActive) return;
  lookPointerId = event.pointerId;
  lastLookX = event.clientX;
  lastLookY = event.clientY;
  renderer.domElement.setPointerCapture?.(event.pointerId);
});
renderer.domElement.addEventListener('pointermove', event => {
  if (!isTouch || !mobileActive || event.pointerId !== lookPointerId) return;
  const dx = event.clientX - lastLookX;
  const dy = event.clientY - lastLookY;
  lastLookX = event.clientX;
  lastLookY = event.clientY;
  const sensitivity = 0.004;
  camera.rotation.y -= dx * sensitivity;
  camera.rotation.x -= dy * sensitivity;
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -Math.PI * 0.48, Math.PI * 0.48);
});
const endLook = event => {
  if (event.pointerId === lookPointerId) lookPointerId = null;
};
renderer.domElement.addEventListener('pointerup', endLook);
renderer.domElement.addEventListener('pointercancel', endLook);

const clock = new THREE.Clock();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const intended = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);

function updateMovement(delta) {
  const active = controls.isLocked || (isTouch && mobileActive);
  if (!active) return;
  const speed = viewMode === 'wheelchair' ? 1.65 : 2.25;
  let f = 0, r = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp') || touchMove.up) f += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown') || touchMove.down) f -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight') || touchMove.right) r += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft') || touchMove.left) r -= 1;
  if (!f && !r) return;
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() < 1e-8) forward.set(0, 0, -1);
  forward.normalize();
  right.crossVectors(forward, worldUp).normalize();
  intended.set(0, 0, 0).addScaledVector(forward, f).addScaledVector(right, r);
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

const wsUrl = new URLSearchParams(location.search).get('ws');
if (wsUrl?.startsWith('wss://') || wsUrl?.startsWith('ws://localhost')) {
  engine.connect(wsUrl, state => console.log('live scene', state));
}
statusEl.textContent = isTouch ? 'Tap Enter to start' : 'Tap Enter walkthrough to start';
