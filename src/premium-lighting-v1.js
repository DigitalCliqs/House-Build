// Premium architectural lighting pass for the Anamarija walkthrough.
// Designed to improve depth and material response while real HDRI assets are being populated.
export function createPremiumLighting({ THREE, scene, renderer } = {}) {
  if (!THREE || !scene) throw new Error('THREE and scene are required');
  const root = new THREE.Group();
  root.name = 'anamarija-premium-lighting';
  scene.add(root);

  if (renderer) renderer.toneMappingExposure = 1.0;

  // Broad sky/fill: neutral daylight with warmer ground bounce.
  const sky = new THREE.HemisphereLight(0xeaf4ff, 0x8a735e, 0.75);
  root.add(sky);

  // Soft warm architectural downlights. Keep count modest for mobile performance.
  const fixtures = [
    [-0.2, 2.92, 5.9, 4.0], [1.4, 2.92, 4.5, 3.4],
    [4.1, 3.08, 2.6, 4.6], [6.2, 3.08, 2.6, 4.6],
    [4.1, 3.08, 0.2, 4.2], [6.2, 3.08, 0.2, 4.2],
    [4.1, 3.08, -2.0, 4.0], [6.2, 3.08, -2.0, 4.0]
  ];
  for (const [x,y,z,intensity] of fixtures) {
    const light = new THREE.PointLight(0xffd9ae, intensity, 6.5, 2.0);
    light.position.set(x,y,z);
    light.castShadow = false;
    root.add(light);
  }

  // Warm terrace wash visible through the large slider at dusk/day transitions.
  const terrace = new THREE.RectAreaLight(0xffd2a0, 5.0, 7.5, 2.4);
  terrace.position.set(5.0, 2.55, -4.05);
  terrace.rotation.x = -Math.PI / 2;
  root.add(terrace);

  return { root, dispose(){ scene.remove(root); } };
}
