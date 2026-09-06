// Registry-driven HDR image-based lighting for the Anamarija walkthrough.
// The canonical asset registry owns environment paths/status; no duplicate hardcoded paths.
export function createEnvironmentController({ THREE, renderer, RGBELoader, registry = {} } = {}) {
  if (!THREE || !renderer || !RGBELoader) throw new Error('THREE, renderer and RGBELoader are required');
  const loader = new RGBELoader();
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const cache = new Map();
  let activeTarget = null;

  function configFor(name) {
    const key = name === 'anamarija_day' ? 'day' : name === 'anamarija_evening' ? 'evening' : name;
    const entry = registry?.environments?.[key];
    if (!entry) throw new Error(`Unknown environment: ${name}`);
    return { ...entry, key, intensity: entry.intensity ?? (key === 'evening' ? 0.72 : 1.0), rotationY: entry.rotationY ?? 0 };
  }

  async function loadPMREM(path) {
    if (!cache.has(path)) {
      const pending = new Promise((resolve, reject) => {
        loader.load(path, hdr => {
          try {
            hdr.mapping = THREE.EquirectangularReflectionMapping;
            const target = pmrem.fromEquirectangular(hdr);
            hdr.dispose();
            resolve(target);
          } catch (error) { hdr.dispose(); reject(error); }
        }, undefined, reject);
      }).catch(error => { cache.delete(path); throw error; }); // permit retry after a missing/failed asset
      cache.set(path, pending);
    }
    return cache.get(path);
  }

  return {
    async apply(scene, name = 'day', { background = false, allowPlanned = false } = {}) {
      const config = configFor(name);
      if (!config.path) return { applied: false, reason: 'no-path', config };
      if (!allowPlanned && config.status && !['available','production'].includes(config.status)) {
        return { applied: false, reason: `asset-${config.status}`, config };
      }
      const target = await loadPMREM(config.path);
      activeTarget = target;
      scene.environment = target.texture;
      scene.environmentIntensity = config.intensity;
      if (scene.environmentRotation) scene.environmentRotation.y = config.rotationY;
      if (background) scene.background = target.texture;
      return { applied: true, texture: target.texture, config };
    },
    setIntensity(scene, intensity) { scene.environmentIntensity = Math.max(0, Number(intensity) || 0); },
    clear(scene) { scene.environment = null; if (scene.background === activeTarget?.texture) scene.background = null; activeTarget = null; },
    dispose() { for (const promise of cache.values()) Promise.resolve(promise).then(t => t?.dispose?.()).catch(()=>{}); cache.clear(); pmrem.dispose(); activeTarget = null; },
  };
}
