// HDR image-based lighting for the Anamarija walkthrough.
// Designed for Three.js PBR materials. The HDR is used for lighting/reflections;
// the visible background can remain the actual house/exterior scene.

export const ENVIRONMENTS = {
  anamarija_day: {
    path: './assets/hdri/anamarija-day.hdr',
    intensity: 1.0,
    rotationY: 0,
  },
  anamarija_evening: {
    path: './assets/hdri/anamarija-evening.hdr',
    intensity: 0.72,
    rotationY: 0,
  },
};

export function createEnvironmentController({ THREE, renderer, RGBELoader } = {}) {
  if (!THREE || !renderer || !RGBELoader) throw new Error('THREE, renderer and RGBELoader are required');

  const loader = new RGBELoader();
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const cache = new Map();
  let activeTarget = null;

  async function loadPMREM(path) {
    if (!cache.has(path)) {
      cache.set(path, new Promise((resolve, reject) => {
        loader.load(path, hdr => {
          try {
            hdr.mapping = THREE.EquirectangularReflectionMapping;
            const target = pmrem.fromEquirectangular(hdr);
            hdr.dispose();
            resolve(target);
          } catch (error) {
            hdr.dispose();
            reject(error);
          }
        }, undefined, reject);
      }));
    }
    return cache.get(path);
  }

  return {
    async apply(scene, name = 'anamarija_day', { background = false } = {}) {
      const config = ENVIRONMENTS[name];
      if (!config) throw new Error(`Unknown environment: ${name}`);
      const target = await loadPMREM(config.path);
      activeTarget = target;
      scene.environment = target.texture;
      scene.environmentIntensity = config.intensity ?? 1;
      if (scene.environmentRotation) scene.environmentRotation.y = config.rotationY || 0;
      if (background) scene.background = target.texture;
      return target.texture;
    },

    setIntensity(scene, intensity) {
      scene.environmentIntensity = Math.max(0, Number(intensity) || 0);
    },

    clear(scene) {
      scene.environment = null;
      if (scene.background === activeTarget?.texture) scene.background = null;
      activeTarget = null;
    },

    dispose() {
      for (const promise of cache.values()) {
        Promise.resolve(promise).then(target => target?.dispose?.()).catch(() => {});
      }
      cache.clear();
      pmrem.dispose();
      activeTarget = null;
    },
  };
}
