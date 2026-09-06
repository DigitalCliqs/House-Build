// Static collision registration generated from the canonical Anamarija architecture specification.
// Visual shell and collision geometry now share the same source of truth.

import { ARCHITECTURE_SPEC } from './architecture-spec-v1.js';

function ordered(a, b) {
  return a <= b ? [a, b] : [b, a];
}

function registerWall(collisionSystem, wall) {
  const [a, b] = ordered(wall.a, wall.b);
  if (wall.axis === 'x') {
    return collisionSystem.setProxyBox(
      `arch:${wall.id}`,
      [a, 0, wall.fixed - wall.thickness / 2],
      [b, wall.height, wall.fixed + wall.thickness / 2],
      { kind: 'architecture' },
    );
  }
  return collisionSystem.setProxyBox(
    `arch:${wall.id}`,
    [wall.fixed - wall.thickness / 2, 0, a],
    [wall.fixed + wall.thickness / 2, wall.height, b],
    { kind: 'architecture' },
  );
}

function registerGlazing(collisionSystem, glazing) {
  if (glazing.collision === false || glazing.axis !== 'x') return null;
  const [a, b] = ordered(glazing.a, glazing.b);
  const thickness = glazing.collisionThickness ?? 0.08;
  return collisionSystem.setProxyBox(
    `arch:glazing-${glazing.id}`,
    [a, 0, glazing.fixed - thickness / 2],
    [b, glazing.height, glazing.fixed + thickness / 2],
    { kind: 'architecture' },
  );
}

function addPoolEdge(collisionSystem, id, min, max) {
  return collisionSystem.setProxyBox(`site:${id}`, min, max, { kind: 'hazard' });
}

export function registerAnamarijaArchitectureCollisions(collisionSystem, options = {}) {
  if (!collisionSystem?.setProxyBox) throw new Error('collisionSystem with setProxyBox() is required');

  for (const wall of ARCHITECTURE_SPEC.walls) registerWall(collisionSystem, wall);
  for (const glazing of ARCHITECTURE_SPEC.glazing) registerGlazing(collisionSystem, glazing);

  const POOL = ARCHITECTURE_SPEC.pool;
  const poolHalfW = POOL.width / 2;
  const poolHalfD = POOL.depth / 2;
  const lip = options.poolBarrierThickness ?? 0.12;
  const barrierHeight = options.poolBarrierHeight ?? 0.45;

  addPoolEdge(collisionSystem, 'pool-north', [POOL.x - poolHalfW, 0, POOL.z + poolHalfD - lip / 2], [POOL.x + poolHalfW, barrierHeight, POOL.z + poolHalfD + lip / 2]);
  addPoolEdge(collisionSystem, 'pool-south', [POOL.x - poolHalfW, 0, POOL.z - poolHalfD - lip / 2], [POOL.x + poolHalfW, barrierHeight, POOL.z - poolHalfD + lip / 2]);
  addPoolEdge(collisionSystem, 'pool-west', [POOL.x - poolHalfW - lip / 2, 0, POOL.z - poolHalfD], [POOL.x - poolHalfW + lip / 2, barrierHeight, POOL.z + poolHalfD]);
  addPoolEdge(collisionSystem, 'pool-east', [POOL.x + poolHalfW - lip / 2, 0, POOL.z - poolHalfD], [POOL.x + poolHalfW + lip / 2, barrierHeight, POOL.z + poolHalfD]);

  const house = ARCHITECTURE_SPEC.house;
  return {
    north: house.z + house.depth / 2,
    south: house.z - house.depth / 2,
    west: -house.width / 2,
    east: house.width / 2,
    openings: ARCHITECTURE_SPEC.openings.map(opening => ({ ...opening })),
    proxyIds: collisionSystem.listProxies().map(proxy => proxy.id).filter(id => id.startsWith('arch:') || id.startsWith('site:pool-')),
  };
}
