// Premium hero interior pass for the enlarged Anamarija digital twin.
// These are dimensionally controlled in-engine placeholders for the target design.
// They intentionally preserve wheelchair circulation while production GLB assets are sourced.

export function createHeroInterior({ THREE, scene } = {}) {
  if (!THREE || !scene) throw new Error('THREE and scene are required');
  const group = new THREE.Group();
  group.name = 'premium-hero-interior';

  const ivory = new THREE.MeshPhysicalMaterial({ color: 0xeee9df, roughness: .72, metalness: 0 });
  const oak = new THREE.MeshStandardMaterial({ color: 0x9a6d45, roughness: .55, metalness: 0 });
  const stone = new THREE.MeshPhysicalMaterial({ color: 0xe8e3da, roughness: .22, metalness: 0, clearcoat: .16, clearcoatRoughness: .22 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0x5a4638, roughness: .3, metalness: .7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x292827, roughness: .42, metalness: .08 });
  const green = new THREE.MeshStandardMaterial({ color: 0x52614b, roughness: .8 });

  function box(name, size, pos, mat, radius = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
    mesh.name = name; mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
  }
  function cyl(name, radius, height, pos, mat, segments = 48) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), mat);
    mesh.name = name; mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
  }

  // Living: low warm-ivory sectional, kept clear of the principal accessible route.
  box('living-sofa-seat-long', [3.35,.34,.92], [4.45,.39,-2.55], ivory);
  box('living-sofa-back-long', [3.35,.72,.24], [4.45,.78,-2.94], ivory);
  box('living-sofa-chaise', [1.05,.34,1.85], [5.60,.39,-1.65], ivory);
  box('living-sofa-chaise-back', [1.05,.72,.24], [5.60,.78,-2.48], ivory);
  cyl('living-coffee-table', .68, .32, [3.72,.18,-1.28], stone);
  cyl('living-coffee-table-base', .25, .31, [3.72,.16,-1.28], bronze);

  // Dining: eight-place warm-oak table with slim upholstered chairs.
  box('dining-table-top', [2.65,.09,1.08], [6.45,.77,.55], oak);
  for (const x of [5.35,7.55]) for (const z of [.18,.92]) box('dining-leg', [.09,.72,.09], [x,.38,z], dark);
  const chairs = [[5.45,-.25],[6.15,-.25],[6.85,-.25],[7.55,-.25],[5.45,1.35],[6.15,1.35],[6.85,1.35],[7.55,1.35]];
  for (const [x,z] of chairs) { box('dining-chair-seat',[.48,.10,.48],[x,.48,z],ivory); box('dining-chair-back',[.48,.72,.10],[x,.82,z + (z<.5?-.19:.19)],ivory); }

  // Kitchen island: waterfall stone volume with seating side kept visually light.
  box('kitchen-island-core', [3.25,.88,1.08], [5.05,.45,3.18], dark);
  box('kitchen-island-top', [3.31,.055,1.14], [5.05,.92,3.18], stone);
  box('kitchen-island-waterfall-left', [.055,.90,1.14], [3.42,.46,3.18], stone);
  box('kitchen-island-waterfall-right', [.055,.90,1.14], [6.68,.46,3.18], stone);
  for (const x of [4.20,5.05,5.90]) { cyl('island-stool-base',.18,.05,[x,.03,2.38],bronze); box('island-stool-seat',[.46,.09,.42],[x,.66,2.38],ivory); }

  // Soft landscaping accents visible through the open-plan glazing.
  for (const [x,z,s] of [[8.2,-4.7,1.0],[1.7,-5.0,.8],[-7.6,-4.6,.9]]) {
    cyl('planter', .32*s, .55*s, [x,.28*s,z], stone);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(.52*s,20,14), green); crown.position.set(x,.95*s,z); crown.scale.y=1.35; crown.castShadow=true; group.add(crown);
  }

  scene.add(group);
  return group;
}
