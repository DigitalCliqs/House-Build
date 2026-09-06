// Premium architectural detailing for the entrance -> hallway -> living/kitchen/dining -> terrace sequence.
// This is intentionally lightweight/mobile-safe and supplements the canonical shell without pretending
// the final production GLB furniture library is already populated.

import { ARCHITECTURE_SPEC } from './architecture-spec-v1.js';

export function createPremiumOpenPlanZone({ THREE, scene } = {}) {
  if (!THREE || !scene) throw new Error('THREE and scene are required');

  const root = new THREE.Group();
  root.name = 'premium-open-plan-zone';
  scene.add(root);

  const warmWhite = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.66, metalness: 0.0 });
  const oak = new THREE.MeshStandardMaterial({ color: 0xa87950, roughness: 0.46, metalness: 0.0 });
  const darkOak = new THREE.MeshStandardMaterial({ color: 0x5a4334, roughness: 0.48, metalness: 0.0 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0x8f765c, roughness: 0.28, metalness: 0.78 });
  const stone = new THREE.MeshPhysicalMaterial({ color: 0xf2eee8, roughness: 0.24, metalness: 0.0, clearcoat: 0.2, clearcoatRoughness: 0.18 });
  const softBlack = new THREE.MeshStandardMaterial({ color: 0x1f2224, roughness: 0.32, metalness: 0.28 });
  const emissive = new THREE.MeshStandardMaterial({ color: 0xffe2b7, emissive: 0xffc982, emissiveIntensity: 2.0, roughness: 0.4 });
  const ownedMaterials = [warmWhite, oak, darkOak, bronze, stone, softBlack, emissive];

  function box(name, x, y, z, w, h, d, material, cast = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  }

  // Entrance portal and warm-oak feature wall.
  box('premium:entrance-portal-left', -0.28, 1.35, 7.80, 0.13, 2.70, 0.20, bronze);
  box('premium:entrance-portal-right', 1.23, 1.35, 7.80, 0.13, 2.70, 0.20, bronze);
  box('premium:entrance-portal-head', 0.475, 2.68, 7.80, 1.64, 0.14, 0.20, bronze);
  box('premium:entry-console', 0.15, 0.47, 5.75, 1.70, 0.82, 0.42, darkOak);
  box('premium:entry-console-top', 0.15, 0.90, 5.75, 1.78, 0.05, 0.46, stone);

  // Hallway ceiling tray and linear light detailing.
  box('premium:hall-ceiling', 0.35, 2.91, 4.55, 2.55, 0.14, 4.30, warmWhite, false);
  box('premium:hall-cove-left', -0.90, 2.82, 4.55, 0.035, 0.035, 4.05, emissive, false);
  box('premium:hall-cove-right', 1.60, 2.82, 4.55, 0.035, 0.035, 4.05, emissive, false);

  // Open-plan ceiling raft over living/dining to create the premium cove-light appearance.
  box('premium:living-ceiling-raft', 5.15, 3.00, -0.05, 8.25, 0.12, 5.25, warmWhite, false);
  const coveY = 2.92;
  box('premium:cove-north', 5.15, coveY, 2.48, 7.70, 0.03, 0.03, emissive, false);
  box('premium:cove-south', 5.15, coveY, -2.58, 7.70, 0.03, 0.03, emissive, false);
  box('premium:cove-west', 1.30, coveY, -0.05, 0.03, 0.03, 5.00, emissive, false);
  box('premium:cove-east', 9.00, coveY, -0.05, 0.03, 0.03, 5.00, emissive, false);

  // Living media wall + vertical oak slats, matching the warm premium reference language.
  box('premium:media-wall', 9.95, 1.42, -1.45, 0.22, 2.75, 3.10, darkOak);
  for (let i = 0; i < 14; i++) {
    box(`premium:media-slat-${i}`, 9.80, 1.45, -2.80 + i * 0.205, 0.08, 2.75, 0.055, oak);
  }
  box('premium:media-screen', 9.65, 1.55, -1.25, 0.035, 1.35, 2.20, softBlack, false);
  box('premium:media-low-unit', 9.58, 0.36, -1.25, 0.42, 0.55, 2.55, warmWhite);

  // Kitchen full-height cabinetry wall.
  box('premium:kitchen-tall-units', 8.75, 1.47, 4.95, 3.10, 2.84, 0.62, oak);
  for (let i = 1; i < 5; i++) {
    box(`premium:kitchen-tall-joint-${i}`, 7.20 + i * 0.62, 1.47, 4.62, 0.018, 2.70, 0.02, bronze, false);
  }
  box('premium:kitchen-appliance-bank', 9.34, 1.45, 4.60, 0.78, 1.68, 0.05, softBlack, false);

  // Architectural island placeholder: fixed joinery geometry only, later replaced by the production GLB.
  box('premium:island-base', 5.00, 0.47, 3.25, 3.25, 0.90, 1.15, warmWhite);
  box('premium:island-top', 5.00, 0.94, 3.25, 3.36, 0.06, 1.27, stone);
  box('premium:island-waterfall-left', 3.35, 0.48, 3.25, 0.06, 0.92, 1.27, stone);
  box('premium:island-waterfall-right', 6.65, 0.48, 3.25, 0.06, 0.92, 1.27, stone);

  // Dining pendant rings, using low-poly torus meshes for a refined focal point.
  const ringMat = bronze;
  [0, 0.24].forEach((offset, index) => {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(index ? 0.46 : 0.62, 0.018, 10, 48), ringMat);
    torus.name = `premium:dining-ring-${index}`;
    torus.rotation.x = Math.PI / 2;
    torus.position.set(6.85, 2.38 - offset, 0.55);
    torus.castShadow = true;
    root.add(torus);
  });

  // Flush terrace soffit and warm linear light at the indoor/outdoor threshold.
  const t = ARCHITECTURE_SPEC.terrace;
  box('premium:terrace-soffit', t.x, 2.75, t.z, t.width, 0.11, t.depth, warmWhite, false);
  box('premium:terrace-linear-light', t.x, 2.68, t.z + t.depth / 2 - 0.25, t.width - 0.8, 0.025, 0.025, emissive, false);

  // A small number of practical lights keeps mobile cost predictable.
  const warm = 0xffd4a1;
  const lightPositions = [
    [0.45, 2.55, 5.20, 16],
    [5.00, 2.75, 3.20, 18],
    [6.85, 2.55, 0.55, 20],
    [5.10, 2.70, -1.85, 16],
    [4.70, 2.55, -5.80, 14],
  ];
  const lights = lightPositions.map(([x, y, z, intensity]) => {
    const light = new THREE.PointLight(warm, intensity, 4.8, 2);
    light.position.set(x, y, z);
    light.castShadow = false;
    root.add(light);
    return light;
  });

  root.updateMatrixWorld(true);

  return {
    root,
    lights,
    dispose() {
      root.traverse(node => node.geometry?.dispose?.());
      for (const material of ownedMaterials) material.dispose();
      scene.remove(root);
    },
  };
}
