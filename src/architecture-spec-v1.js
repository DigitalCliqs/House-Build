// Canonical architectural specification for the current Anamarija EuroMax design model.
// All dimensions are metres. This is a design/digital-twin source of truth, not a certified construction drawing.
// The shell, collision system, minimap and future QA tools should derive from this module.

import { HOUSE, POOL, ROOMS, SITE } from './house-config.js';

export const ARCHITECTURE_SPEC = {
  metadata: {
    projectId: 'anamarija-euromax',
    version: '1.0.0',
    status: 'working-design',
    units: 'm',
    note: 'Approximate 200 m² working design pending final dimensioned architect/Domprojekt drawings.',
  },

  site: { ...SITE },
  house: { ...HOUSE },
  pool: { ...POOL },
  rooms: ROOMS.map(room => ({ ...room })),

  accessibility: {
    corridorTarget: 1.50,
    internalDoorClearTarget: 0.90,
    accessibleDoorClearTarget: 1.00,
    entranceDoorClearTarget: 1.10,
    turningDiameterTarget: 1.50,
    kitchenRouteTarget: 1.20,
    walkingEyeHeight: 1.65,
    wheelchairEyeHeight: 1.20,
  },

  materials: {
    mainFloor: 'calacatta_porcelain',
    bedroomFloor: 'warm_oak',
    wall: 'warm_white_plaster',
    glazingFrame: 'dark_bronze_aluminium',
    terrace: 'large_format_stone',
  },

  // Geometry primitives. Wall openings are represented by deliberate breaks between segments.
  walls: [
    { id:'north-west', axis:'x', a:-10.50, b:-0.20, fixed:2.00 + 11.80/2, height:3.05, thickness:0.20, zone:'external' },
    { id:'north-east', axis:'x', a:1.15, b:10.50, fixed:2.00 + 11.80/2, height:3.05, thickness:0.20, zone:'external' },
    { id:'west', axis:'z', fixed:-10.50, a:2.00 - 11.80/2, b:2.00 + 11.80/2, height:3.05, thickness:0.20, zone:'external' },
    { id:'east', axis:'z', fixed:10.50, a:2.00 - 11.80/2, b:2.00 + 11.80/2, height:3.05, thickness:0.20, zone:'external' },

    { id:'south-1', axis:'x', a:-10.50, b:-7.90, fixed:2.00 - 11.80/2, height:2.80, thickness:0.20, zone:'external' },
    { id:'south-2', axis:'x', a:-5.00, b:-2.70, fixed:2.00 - 11.80/2, height:2.80, thickness:0.20, zone:'external' },
    { id:'south-3', axis:'x', a:-0.10, b:1.90, fixed:2.00 - 11.80/2, height:3.05, thickness:0.20, zone:'external' },
    { id:'south-4', axis:'x', a:8.30, b:10.50, fixed:2.00 - 11.80/2, height:3.05, thickness:0.20, zone:'external' },

    { id:'private-a1', axis:'z', fixed:-5.95, a:-2.00, b:1.25, height:2.80, thickness:0.20, zone:'internal' },
    { id:'private-a2', axis:'z', fixed:-5.95, a:2.45, b:6.90, height:2.80, thickness:0.20, zone:'internal' },
    { id:'private-b1', axis:'z', fixed:-1.60, a:-2.00, b:1.20, height:2.80, thickness:0.20, zone:'internal' },
    { id:'private-b2', axis:'z', fixed:-1.60, a:2.30, b:6.90, height:2.80, thickness:0.20, zone:'internal' },
    { id:'private-c1', axis:'z', fixed:2.45, a:3.10, b:6.90, height:3.00, thickness:0.20, zone:'internal' },
    { id:'private-c2', axis:'z', fixed:2.45, a:-1.90, b:0.90, height:3.00, thickness:0.20, zone:'internal' },

    { id:'mid-1', axis:'x', a:-10.50, b:-6.55, fixed:2.25, height:2.80, thickness:0.20, zone:'internal' },
    { id:'mid-2', axis:'x', a:-5.15, b:-3.80, fixed:2.25, height:2.80, thickness:0.20, zone:'internal' },
    { id:'mid-3', axis:'x', a:-2.65, b:-1.60, fixed:2.25, height:2.80, thickness:0.20, zone:'internal' },
    { id:'mid-4', axis:'x', a:-1.60, b:-0.05, fixed:2.25, height:3.00, thickness:0.20, zone:'internal' },
    { id:'mid-5', axis:'x', a:1.25, b:2.45, fixed:2.25, height:3.00, thickness:0.20, zone:'internal' },

    { id:'south-zone-1', axis:'x', a:-10.50, b:-6.00, fixed:-2.45, height:2.80, thickness:0.20, zone:'internal' },
    { id:'south-zone-2', axis:'x', a:-4.80, b:-2.65, fixed:-2.45, height:2.80, thickness:0.20, zone:'internal' },
    { id:'south-zone-3', axis:'x', a:-1.60, b:-0.40, fixed:-2.45, height:2.80, thickness:0.20, zone:'internal' },
    { id:'south-zone-4', axis:'x', a:0.80, b:2.45, fixed:-2.45, height:2.80, thickness:0.20, zone:'internal' },
  ],

  glazing: [
    { id:'bedroom', axis:'x', a:-7.90, b:-5.00, fixed:2.00 - 11.80/2 - 0.015, height:2.35, collision:true },
    { id:'ensuite', axis:'x', a:-2.70, b:-0.10, fixed:2.00 - 11.80/2 - 0.015, height:2.35, collision:true },
    { id:'living-left', axis:'x', a:1.90, b:3.90, fixed:2.00 - 11.80/2 - 0.015, height:2.72, collision:true },
    { id:'living-right', axis:'x', a:6.10, b:8.30, fixed:2.00 - 11.80/2 - 0.015, height:2.72, collision:true },
  ],

  openings: [
    { id:'front-entrance', kind:'door', axis:'x', a:-0.20, b:1.15, fixed:2.00 + 11.80/2, clearWidth:1.35, height:2.55, provisional:false },
    { id:'terrace-portal', kind:'slider', axis:'x', a:3.90, b:6.10, fixed:2.00 - 11.80/2, clearWidth:2.20, height:2.72, provisional:true },
  ],

  terrace: {
    x: 4.70,
    z: -5.95,
    width: 11.60,
    depth: 4.10,
    level: 0.035,
    finish: 'large_format_stone',
  },
};

export function getArchitectureWall(id) {
  return ARCHITECTURE_SPEC.walls.find(wall => wall.id === id) || null;
}
