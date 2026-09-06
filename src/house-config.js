// Anamarija EuroMax visual digital-twin configuration.
// Units are metres. This is a design visualisation model, not a construction drawing.

export const PROJECT = {
  baseModel: 'Domprojekt Anamarija',
  conceptName: 'Anamarija EuroMax',
  targetInternalAreaM2: 200,
  designTarget: 'premium-accessible-enlargement',
  governingBrief: 'DESIGN_TARGET_V40.md',
};

export const SITE = {
  width: 30,
  depth: 40,
  roadSide: 'north',
  hedgeHeight: 1.9,
};

export const HOUSE = {
  width: 21.0,
  depth: 11.8,
  x: 0,
  z: 2.0,
  wallThickness: 0.20,
  privateCeiling: 2.80,
  mainCeiling: 3.05,
  vaultedPeak: 4.10,
  doorHeight: 2.30,
  standardDoor: 1.00,
  accessibleDoor: 1.10,
  entranceDoor: 1.30,
  terraceDepth: 4.2,
};

export const POOL = {
  x: 4.8,
  z: -10.2,
  width: 8.0,
  depth: 4.0,
  deckWidth: 11.5,
  deckDepth: 7.0,
};

export const FINISHES = {
  mainFloor: 'calacatta',
  bedroomFloor: 'oak-herringbone',
  walls: 'warm-white',
  joinery: 'warm-oak-and-warm-white',
  metal: 'dark-bronze-aluminium',
};

// Room floor zones. x/z are centre points. The plan remains editable as the
// final architectural drawing is developed.
export const ROOMS = [
  { id:'bed1', name:'Bedroom 1', x:-8.05, z:0.10, w:4.10, d:4.45, finish:'wood', ceiling:2.8 },
  { id:'bed2', name:'Bedroom 2', x:-3.75, z:0.10, w:4.10, d:4.45, finish:'wood', ceiling:2.8 },
  { id:'accessible', name:'Accessible bedroom', x:-7.55, z:4.55, w:5.10, d:4.10, finish:'wood', ceiling:2.8 },
  { id:'bath', name:'Accessible bathroom', x:-3.20, z:4.55, w:3.10, d:4.10, finish:'marble', ceiling:2.8 },
  { id:'office', name:'Office', x:0.55, z:4.55, w:3.75, d:4.10, finish:'wood', ceiling:2.8 },
  { id:'storage', name:'Built-in storage / hall', x:0.50, z:0.00, w:3.55, d:4.30, finish:'marble', ceiling:3.0 },
  { id:'kitchen', name:'Kitchen', x:5.00, z:4.25, w:5.10, d:4.55, finish:'marble', ceiling:3.05 },
  { id:'dining', name:'Dining', x:7.20, z:0.15, w:4.80, d:3.30, finish:'marble', ceiling:3.4 },
  { id:'living', name:'Living', x:5.10, z:-2.30, w:8.50, d:4.00, finish:'marble', ceiling:4.1 },
  { id:'master', name:'Main bedroom', x:-5.40, z:-4.35, w:5.20, d:3.60, finish:'wood', ceiling:2.8 },
  { id:'ensuite', name:'Ensuite', x:-1.35, z:-4.35, w:2.50, d:3.60, finish:'marble', ceiling:2.8 },
  { id:'wc', name:'Guest WC', x:1.05, z:-4.30, w:1.55, d:2.00, finish:'marble', ceiling:2.8 },
];

// V45 positions hero-route cameras as architectural compositions rather than
// neutral room-centre teleports. Values remain presentation-only.
export const TELEPORTS = {
  Entrance: [0.50, 1.65, 7.15, 0],
  Hallway: [0.45, 1.65, 3.90, -0.42],
  'Living Room': [1.85, 1.65, -0.15, -0.92],
  Kitchen: [2.55, 1.65, 1.65, -2.10],
  'Dining Area': [4.15, 1.65, -0.70, -2.07],
  'Master Bedroom': [-5.50, 1.65, -4.00, 0],
  Ensuite: [-1.35, 1.65, -4.15, 0],
  'Child Bedroom': [-7.40, 1.65, 4.00, 0],
  'Guest Bedroom': [-8.00, 1.65, 0.10, 0],
  'Main Bathroom': [-3.15, 1.65, 4.20, 0],
  Office: [0.40, 1.65, 4.30, 0],
  Utility: [0.50, 1.65, 0.60, Math.PI],
  'Terrace & Pool': [4.80, 1.65, -5.75, 0],
  Garden: [4.80, 1.65, -14.20, Math.PI],
};

export const HERO_ROUTE = [
  'Entrance',
  'Hallway',
  'Living Room',
  'Kitchen',
  'Dining Area',
  'Terrace & Pool',
];
