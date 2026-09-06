// High-fidelity asset slots for the Anamarija EuroMax walkthrough.
// Put the downloaded GLB files at the local paths below. All recommended
// Poly Haven assets are CC0. Local files keep the walkthrough fast and avoid
// relying on a third-party API at runtime.

export const ASSET_MANIFEST = [
  {
    id: 'living-cabinet',
    label: 'Modern wooden cabinet',
    path: './assets/models/modern_wooden_cabinet.glb',
    source: 'https://polyhaven.com/a/modern_wooden_cabinet',
    license: 'CC0',
    position: [8.15, 0, -1.0],
    rotation: [0, -Math.PI / 2, 0],
    scale: 1.0,
  },
  {
    id: 'plant-living',
    label: 'Potted plant 01',
    path: './assets/models/potted_plant_01.glb',
    source: 'https://polyhaven.com/a/potted_plant_01',
    license: 'CC0',
    position: [7.7, 0, -3.0],
    rotation: [0, 0, 0],
    scale: 0.75,
  },
  {
    id: 'plant-terrace',
    label: 'Potted plant 01',
    path: './assets/models/potted_plant_01.glb',
    source: 'https://polyhaven.com/a/potted_plant_01',
    license: 'CC0',
    position: [1.75, 0, -6.9],
    rotation: [0, 0.8, 0],
    scale: 0.9,
  },
  {
    id: 'groundcover-pool',
    label: 'Crystalline iceplant',
    path: './assets/models/crystalline_iceplant.glb',
    source: 'https://polyhaven.com/a/crystalline_iceplant',
    license: 'CC0',
    position: [10.8, 0, -11.6],
    rotation: [0, 0, 0],
    scale: 1.25,
  },
];

export const ASSET_CREDIT = 'Optional high-detail assets: Poly Haven (CC0).';
