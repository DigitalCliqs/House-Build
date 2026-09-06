// Concept geometry only. Units are metres.
export const HOUSE = {
  width: 20,
  depth: 10,
  wallThickness: 0.18,
  privateCeiling: 2.8,
  livingCeiling: 3.0,
  terraceDepth: 4,
  pool: { width: 8, depth: 4 },
};

// Rectangles used mainly for floor finishes and labels.
// x/z are centre points in the 20 x 10 m concept footprint.
export const ROOMS = [
  { name: 'Bedroom 1', x:-7.6, z:-2.7, w:4.2, d:4.4, finish:'wood' },
  { name: 'Bedroom 2', x:-3.5, z:-2.7, w:3.8, d:4.4, finish:'wood' },
  { name: 'Accessible bedroom', x:-7.1, z:2.4, w:5.2, d:4.2, finish:'wood' },
  { name: 'Accessible bathroom', x:-2.8, z:2.5, w:3.0, d:4.0, finish:'marble' },
  { name: 'Office', x:1.0, z:2.5, w:3.8, d:4.0, finish:'wood' },
  { name: 'Hall / storage', x:0.4, z:-2.7, w:3.6, d:4.4, finish:'marble' },
  { name: 'Kitchen / dining / living', x:6.2, z:0.0, w:7.6, d:9.2, finish:'marble', high:true },
];

// Interior wall segments [x1,z1,x2,z2,height].
export const WALLS = [
  [-5.4,-5,-5.4,-0.5,2.8],
  [-1.6,-5,-1.6,-0.5,2.8],
  [2.2,-5,2.2,-0.5,3.0],
  [-4.5,-0.5,-4.5,5,2.8],
  [-1.3,-0.5,-1.3,5,2.8],
  [3.0,-0.5,3.0,5,3.0],
  [-10,-0.5,3.0,-0.5,2.8],
];

// Concept door openings. They are visual markers in this milestone.
export const DOORS = [
  { x:-5.4,z:-2.5,rot:Math.PI/2,w:1.0,h:2.3 },
  { x:-1.6,z:-2.5,rot:Math.PI/2,w:1.0,h:2.3 },
  { x:-4.5,z:2.2,rot:Math.PI/2,w:1.1,h:2.3 },
  { x:-1.3,z:2.3,rot:Math.PI/2,w:1.0,h:2.3 },
  { x:3.0,z:2.4,rot:Math.PI/2,w:1.0,h:2.3 },
  { x:0.4,z:-0.5,rot:0,w:1.2,h:2.3 },
];
