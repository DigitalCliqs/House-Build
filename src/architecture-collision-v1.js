// Static collision registration for the current Anamarija EuroMax design model.
// Coordinates are taken from the existing visualization geometry and house-config.
// This is a navigation model, not a certified construction drawing.

import { HOUSE, POOL } from './house-config.js';

function ordered(a, b) {
  return a <= b ? [a, b] : [b, a];
}

function addWallX(collisionSystem, id, x1, x2, z, height = 3.0, thickness = HOUSE.wallThickness) {
  const [minX, maxX] = ordered(x1, x2);
  return collisionSystem.setProxyBox(
    `arch:${id}`,
    [minX, 0, z - thickness / 2],
    [maxX, height, z + thickness / 2],
    { kind: 'architecture' },
  );
}

function addWallZ(collisionSystem, id, x, z1, z2, height = 3.0, thickness = HOUSE.wallThickness) {
  const [minZ, maxZ] = ordered(z1, z2);
  return collisionSystem.setProxyBox(
    `arch:${id}`,
    [x - thickness / 2, 0, minZ],
    [x + thickness / 2, height, maxZ],
    { kind: 'architecture' },
  );
}

function addPoolEdge(collisionSystem, id, min, max) {
  return collisionSystem.setProxyBox(`site:${id}`, min, max, { kind: 'hazard' });
}

export function registerAnamarijaArchitectureCollisions(collisionSystem, options = {}) {
  if (!collisionSystem?.setProxyBox) throw new Error('collisionSystem with setProxyBox() is required');

  const hz = HOUSE.z;
  const north = hz + HOUSE.depth / 2;
  const south = hz - HOUSE.depth / 2;
  const west = -HOUSE.width / 2;
  const east = HOUSE.width / 2;

  // External envelope. The front entrance remains open between -0.20 and 1.15.
  addWallX(collisionSystem, 'north-west', west, -0.20, north, 3.05);
  addWallX(collisionSystem, 'north-east', 1.15, east, north, 3.05);
  addWallZ(collisionSystem, 'west', west, south, north, 3.05);
  addWallZ(collisionSystem, 'east', east, south, north, 3.05);

  // South facade wall sections matching the current visualization.
  addWallX(collisionSystem, 'south-1', west, -7.90, south, 2.80);
  addWallX(collisionSystem, 'south-2', -5.00, -2.70, south, 2.80);
  addWallX(collisionSystem, 'south-3', -0.10, 1.90, south, 3.05);
  addWallX(collisionSystem, 'south-4', 8.30, east, south, 3.05);

  // Bedroom window openings are glazed and therefore still physically blocking.
  addWallX(collisionSystem, 'south-glazing-bedroom', -7.90, -5.00, south, 2.55, 0.08);
  addWallX(collisionSystem, 'south-glazing-ensuite', -2.70, -0.10, south, 2.55, 0.08);

  // Living-room glazing includes a provisional 2.20 m clear terrace portal.
  // Keep this split until the final sliding-door drawing replaces the visualization geometry.
  const terracePortal = options.terracePortal ?? [3.90, 6.10];
  addWallX(collisionSystem, 'south-living-glass-left', 1.90, terracePortal[0], south, 2.72, 0.08);
  addWallX(collisionSystem, 'south-living-glass-right', terracePortal[1], 8.30, south, 2.72, 0.08);

  // Internal partitions from the current model. Breaks intentionally remain as door/open circulation zones.
  addWallZ(collisionSystem, 'private-a1', -5.95, -2.00, 1.25, 2.80);
  addWallZ(collisionSystem, 'private-a2', -5.95, 2.45, 6.90, 2.80);
  addWallZ(collisionSystem, 'private-b1', -1.60, -2.00, 1.20, 2.80);
  addWallZ(collisionSystem, 'private-b2', -1.60, 2.30, 6.90, 2.80);
  addWallZ(collisionSystem, 'private-c1', 2.45, 3.10, 6.90, 3.00);
  addWallZ(collisionSystem, 'private-c2', 2.45, -1.90, 0.90, 3.00);

  addWallX(collisionSystem, 'mid-1', west, -6.55, 2.25, 2.80);
  addWallX(collisionSystem, 'mid-2', -5.15, -3.80, 2.25, 2.80);
  addWallX(collisionSystem, 'mid-3', -2.65, -1.60, 2.25, 2.80);
  addWallX(collisionSystem, 'mid-4', -1.60, -0.05, 2.25, 3.00);
  addWallX(collisionSystem, 'mid-5', 1.25, 2.45, 2.25, 3.00);

  addWallX(collisionSystem, 'south-zone-1', west, -6.00, -2.45, 2.80);
  addWallX(collisionSystem, 'south-zone-2', -4.80, -2.65, -2.45, 2.80);
  addWallX(collisionSystem, 'south-zone-3', -1.60, -0.40, -2.45, 2.80);
  addWallX(collisionSystem, 'south-zone-4', 0.80, 2.45, -2.45, 2.80);

  // Pool safety perimeter. It prevents both walking and wheelchair modes from entering the water volume.
  const poolHalfW = POOL.width / 2;
  const poolHalfD = POOL.depth / 2;
  const lip = options.poolBarrierThickness ?? 0.12;
  const barrierHeight = options.poolBarrierHeight ?? 0.45;
  addPoolEdge(collisionSystem, 'pool-north', [POOL.x - poolHalfW, 0, POOL.z + poolHalfD - lip / 2], [POOL.x + poolHalfW, barrierHeight, POOL.z + poolHalfD + lip / 2]);
  addPoolEdge(collisionSystem, 'pool-south', [POOL.x - poolHalfW, 0, POOL.z - poolHalfD - lip / 2], [POOL.x + poolHalfW, barrierHeight, POOL.z - poolHalfD + lip / 2]);
  addPoolEdge(collisionSystem, 'pool-west', [POOL.x - poolHalfW - lip / 2, 0, POOL.z - poolHalfD], [POOL.x - poolHalfW + lip / 2, barrierHeight, POOL.z + poolHalfD]);
  addPoolEdge(collisionSystem, 'pool-east', [POOL.x + poolHalfW - lip / 2, 0, POOL.z - poolHalfD], [POOL.x + poolHalfW + lip / 2, barrierHeight, POOL.z + poolHalfD]);

  return {
    north,
    south,
    west,
    east,
    terracePortal: [...terracePortal],
    proxyIds: collisionSystem.listProxies().map(proxy => proxy.id).filter(id => id.startsWith('arch:') || id.startsWith('site:pool-')),
  };
}
