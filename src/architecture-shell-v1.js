// Editable architectural shell for the next-generation Anamarija walkthrough.
// Geometry is generated from architecture-spec-v1 so visual walls and collision geometry stay aligned.

import { ARCHITECTURE_SPEC } from './architecture-spec-v1.js';

export function createAnamarijaArchitectureShell({ THREE, scene } = {}) {
  if (!THREE || !scene) throw new Error('THREE and scene are required');

  const { house: HOUSE, pool: POOL, rooms: ROOMS, site: SITE } = ARCHITECTURE_SPEC;
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

  function buildWall(wall) {
    if (wall.axis === 'x') {
      return box(`wall:${wall.id}`, (wall.a + wall.b) / 2, wall.height / 2, wall.fixed, Math.abs(wall.b - wall.a), wall.height, wall.thickness, wallMat);
    }
    return box(`wall:${wall.id}`, wall.fixed, wall.height / 2, (wall.a + wall.b) / 2, wall.thickness, wall.height, Math.abs(wall.b - wall.a), wallMat);
  }

  function buildGlazing(glazing) {
    if (glazing.axis !== 'x') return;
    const width = Math.abs(glazing.b - glazing.a);
    const cx = (glazing.a + glazing.b) / 2;
    const y = glazing.height / 2 + 0.08;
    box(`glazing:${glazing.id}:glass`, cx, y, glazing.fixed, width, glazing.height, 0.035, glassMat, false);
    box(`glazing:${glazing.id}:frame-left`, glazing.a, y, glazing.fixed, 0.055, glazing.height + 0.05, 0.075, frameMat);
    box(`glazing:${glazing.id}:frame-right`, glazing.b, y, glazing.fixed, 0.055, glazing.height + 0.05, 0.075, frameMat);
    box(`glazing:${glazing.id}:frame-top`, cx, glazing.height + 0.08, glazing.fixed, width, 0.055, 0.075, frameMat);
  }

  box('site-ground', 0, -0.19, 0, SITE.width, 0.30, SITE.depth, landscapeMat, false);
  box('house-slab', 0, 0.02, HOUSE.z, HOUSE.width, 0.10, HOUSE.depth, marbleMat, false);

  for (const room of ROOMS) {
    box(`floor:${room.id}`, room.x, 0.085, room.z + HOUSE.z, room.w, 0.025, room.d, room.finish === 'wood' ? oakMat : marbleMat, false);
  }

  const terrace = ARCHITECTURE_SPEC.terrace;
  box('terrace', terrace.x, terrace.level, terrace.z, terrace.width, 0.075, terrace.depth, terraceMat, false);

  for (const wall of ARCHITECTURE_SPEC.walls) buildWall(wall);
  for (const glazing of ARCHITECTURE_SPEC.glazing) buildGlazing(glazing);

  box('pool-shell', POOL.x, -0.13, POOL.z, POOL.width + 0.35, 0.25, POOL.depth + 0.35, terraceMat, false);
  box('pool-water', POOL.x, 0.015, POOL.z, POOL.width, 0.035, POOL.depth, waterMat, false);

  root.updateMatrixWorld(true);

  return {
    root,
    spec: ARCHITECTURE_SPEC,
    dispose() {
      root.traverse(node => node.geometry?.dispose?.());
      for (const material of ownedMaterials) material.dispose();
      scene.remove(root);
    },
  };
}
