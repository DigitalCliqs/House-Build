// Editable architectural shell for the next-generation Anamarija walkthrough.
// Geometry mirrors the current design-visualisation coordinates. This is not a construction drawing.

import { HOUSE, POOL, ROOMS, SITE } from './house-config.js';

export function createAnamarijaArchitectureShell({ THREE, scene } = {}) {
  if (!THREE || !scene) throw new Error('THREE and scene are required');

  const root = new THREE.Group();
  root.name = 'anamarija-architecture-shell';
  scene.add(root);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.78, metalness: 0.0 });
  const marbleMat = new THREE.MeshPhysicalMaterial({ color: 0xe9e6df, roughness: 0.28, metalness: 0.0, clearcoat: 0.12, clearcoatRoughness: 0.22 });
  const oakMat = new THREE.MeshStandardMaterial({ color: 0xa9794f, roughness: 0.58, metalness: 0.0 });
  const terraceMat = new THREE.MeshStandardMaterial({ color: 0xcfc9bf, roughness: 0.62, metalness: 0.0 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xcfe1e7, transmission: 0.82, transparent: true, opacity: 0.34, roughness: 0.06, ior: 1.45 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x25282a, roughness: 0.34, metalness: 0.35 });
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x64b7c9, transmission: 0.18, transparent: true, opacity: 0.78, roughness: 0.08, clearcoat: 0.9, clearcoatRoughness: 0.08 });
  const landscapeMat = new THREE.MeshStandardMaterial({ color: 0x6f815e, roughness: 1.0, metalness: 0.0 });

  const ownedMaterials = [wallMat, marbleMat, oakMat, terraceMat, glassMat, frameMat, waterMat, landscapeMat];

  function box(name, x, y, z, w, h, d, material, cast = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  }

  function wallX(name, x1, x2, z, h = 3.0, t = HOUSE.wallThickness) {
    return box(name, (x1 + x2) / 2, h / 2, z, Math.abs(x2 - x1), h, t, wallMat);
  }

  function wallZ(name, x, z1, z2, h = 3.0, t = HOUSE.wallThickness) {
    return box(name, x, h / 2, (z1 + z2) / 2, t, h, Math.abs(z2 - z1), wallMat);
  }

  function glazingX(name, x1, x2, z, height = 2.65) {
    const width = Math.abs(x2 - x1);
    const cx = (x1 + x2) / 2;
    box(`${name}:glass`, cx, height / 2 + 0.08, z, width, height, 0.035, glassMat, false);
    box(`${name}:frame-left`, x1, height / 2 + 0.08, z, 0.055, height + 0.05, 0.075, frameMat);
    box(`${name}:frame-right`, x2, height / 2 + 0.08, z, 0.055, height + 0.05, 0.075, frameMat);
    box(`${name}:frame-top`, cx, height + 0.08, z, width, 0.055, 0.075, frameMat);
  }

  // Site ground and house slab.
  box('site-ground', 0, -0.19, 0, SITE.width, 0.30, SITE.depth, landscapeMat, false);
  box('house-slab', 0, 0.02, HOUSE.z, HOUSE.width, 0.10, HOUSE.depth, marbleMat, false);

  // Room finish zones remain separate so future material edits can target rooms without rebuilding walls.
  for (const room of ROOMS) {
    box(`floor:${room.id}`, room.x, 0.085, room.z + HOUSE.z, room.w, 0.025, room.d, room.finish === 'wood' ? oakMat : marbleMat, false);
  }

  box('terrace', 4.7, 0.035, -5.95, 11.6, 0.075, 4.1, terraceMat, false);

  const north = HOUSE.z + HOUSE.depth / 2;
  const south = HOUSE.z - HOUSE.depth / 2;
  const west = -HOUSE.width / 2;
  const east = HOUSE.width / 2;

  // External envelope with front entrance and south glazing openings.
  wallX('wall:north-west', west, -0.20, north, 3.05);
  wallX('wall:north-east', 1.15, east, north, 3.05);
  wallZ('wall:west', west, south, north, 3.05);
  wallZ('wall:east', east, south, north, 3.05);

  wallX('wall:south-1', west, -7.90, south, 2.80);
  wallX('wall:south-2', -5.00, -2.70, south, 2.80);
  wallX('wall:south-3', -0.10, 1.90, south, 3.05);
  wallX('wall:south-4', 8.30, east, south, 3.05);
  glazingX('glazing:bedroom', -7.90, -5.00, south - 0.015, 2.35);
  glazingX('glazing:ensuite', -2.70, -0.10, south - 0.015, 2.35);

  // Large living glazing with provisional 2.20 m terrace portal kept clear.
  glazingX('glazing:living-left', 1.90, 3.90, south - 0.015, 2.72);
  glazingX('glazing:living-right', 6.10, 8.30, south - 0.015, 2.72);

  // Internal partitions. Door/circulation openings are represented by breaks.
  wallZ('wall:private-a1', -5.95, -2.00, 1.25, 2.80);
  wallZ('wall:private-a2', -5.95, 2.45, 6.90, 2.80);
  wallZ('wall:private-b1', -1.60, -2.00, 1.20, 2.80);
  wallZ('wall:private-b2', -1.60, 2.30, 6.90, 2.80);
  wallZ('wall:private-c1', 2.45, 3.10, 6.90, 3.00);
  wallZ('wall:private-c2', 2.45, -1.90, 0.90, 3.00);

  wallX('wall:mid-1', west, -6.55, 2.25, 2.80);
  wallX('wall:mid-2', -5.15, -3.80, 2.25, 2.80);
  wallX('wall:mid-3', -2.65, -1.60, 2.25, 2.80);
  wallX('wall:mid-4', -1.60, -0.05, 2.25, 3.00);
  wallX('wall:mid-5', 1.25, 2.45, 2.25, 3.00);

  wallX('wall:south-zone-1', west, -6.00, -2.45, 2.80);
  wallX('wall:south-zone-2', -4.80, -2.65, -2.45, 2.80);
  wallX('wall:south-zone-3', -1.60, -0.40, -2.45, 2.80);
  wallX('wall:south-zone-4', 0.80, 2.45, -2.45, 2.80);

  // Pool volume is visual only; collision is provided by architecture-collision-v1.
  box('pool-shell', POOL.x, -0.13, POOL.z, POOL.width + 0.35, 0.25, POOL.depth + 0.35, terraceMat, false);
  box('pool-water', POOL.x, 0.015, POOL.z, POOL.width, 0.035, POOL.depth, waterMat, false);

  root.updateMatrixWorld(true);

  return {
    root,
    dispose() {
      root.traverse(node => node.geometry?.dispose?.());
      for (const material of ownedMaterials) material.dispose();
      scene.remove(root);
    },
  };
}
