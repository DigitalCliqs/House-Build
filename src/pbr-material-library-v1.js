// PBR material dictionary for the Anamarija live-edit walkthrough.
// Materials are loaded lazily, cached as source textures, and cloned per resolved
// material instance so the live scene adapter can dispose replaced objects safely.

export const PBR_MATERIALS = {
  warm_ivory_fabric: {
    kind: 'standard',
    color: 0xeee7de,
    roughness: 0.92,
    metalness: 0.0,
    maps: {
      map: './assets/textures/anamarija/warm-ivory-fabric/albedo.jpg',
      normalMap: './assets/textures/anamarija/warm-ivory-fabric/normal.jpg',
      roughnessMap: './assets/textures/anamarija/warm-ivory-fabric/roughness.jpg',
      aoMap: './assets/textures/anamarija/warm-ivory-fabric/ao.jpg',
    },
    repeat: [3, 3],
  },
  calacatta_porcelain: {
    kind: 'physical',
    color: 0xffffff,
    roughness: 0.24,
    metalness: 0.0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.2,
    maps: {
      map: './assets/textures/anamarija/calacatta-porcelain/albedo.jpg',
      normalMap: './assets/textures/anamarija/calacatta-porcelain/normal.jpg',
      roughnessMap: './assets/textures/anamarija/calacatta-porcelain/roughness.jpg',
      aoMap: './assets/textures/anamarija/calacatta-porcelain/ao.jpg',
    },
    repeat: [1.25, 1.25],
  },
  warm_oak: {
    kind: 'standard',
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.0,
    maps: {
      map: './assets/textures/anamarija/warm-oak/albedo.jpg',
      normalMap: './assets/textures/anamarija/warm-oak/normal.jpg',
      roughnessMap: './assets/textures/anamarija/warm-oak/roughness.jpg',
      aoMap: './assets/textures/anamarija/warm-oak/ao.jpg',
    },
    repeat: [2, 2],
  },
  oak_stone: {
    kind: 'physical',
    color: 0xe7dfd2,
    roughness: 0.48,
    metalness: 0.0,
    clearcoat: 0.06,
    clearcoatRoughness: 0.42,
    maps: {
      map: './assets/textures/anamarija/oak-stone/albedo.jpg',
      normalMap: './assets/textures/anamarija/oak-stone/normal.jpg',
      roughnessMap: './assets/textures/anamarija/oak-stone/roughness.jpg',
      aoMap: './assets/textures/anamarija/oak-stone/ao.jpg',
    },
    repeat: [1.5, 1.5],
  },
  dark_oak: {
    kind: 'standard',
    color: 0xffffff,
    roughness: 0.56,
    metalness: 0.0,
    maps: {
      map: './assets/textures/anamarija/dark-oak/albedo.jpg',
      normalMap: './assets/textures/anamarija/dark-oak/normal.jpg',
      roughnessMap: './assets/textures/anamarija/dark-oak/roughness.jpg',
      aoMap: './assets/textures/anamarija/dark-oak/ao.jpg',
    },
    repeat: [2, 2],
  },
  champagne_bronze: {
    kind: 'physical',
    color: 0xb69a72,
    roughness: 0.28,
    metalness: 0.88,
    clearcoat: 0.08,
    clearcoatRoughness: 0.2,
    maps: {},
  },
  pool_finish: {
    kind: 'physical',
    color: 0x8fc7d4,
    roughness: 0.2,
    metalness: 0.0,
    clearcoat: 0.36,
    clearcoatRoughness: 0.08,
    maps: {
      map: './assets/textures/anamarija/pool-finish/albedo.jpg',
      normalMap: './assets/textures/anamarija/pool-finish/normal.jpg',
      roughnessMap: './assets/textures/anamarija/pool-finish/roughness.jpg',
      aoMap: './assets/textures/anamarija/pool-finish/ao.jpg',
    },
    repeat: [4, 4],
  },
};

const COLOR_TEXTURE_SLOTS = new Set(['map', 'emissiveMap']);

function configureTexture(THREE, texture, slot, repeat, anisotropy) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  if (Array.isArray(repeat) && repeat.length === 2) texture.repeat.set(repeat[0], repeat[1]);
  if (COLOR_TEXTURE_SLOTS.has(slot)) texture.colorSpace = THREE.SRGBColorSpace;
  else if ('NoColorSpace' in THREE) texture.colorSpace = THREE.NoColorSpace;
  if (anisotropy) texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function createPBRMaterialResolver({
  THREE,
  renderer = null,
  library = PBR_MATERIALS,
  strict = false,
  onMaterialStatus = () => {},
} = {}) {
  if (!THREE) throw new Error('THREE is required');
  const loader = new THREE.TextureLoader();
  const sourceTextureCache = new Map();
  const anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1;

  function loadSourceTexture(path) {
    if (!sourceTextureCache.has(path)) {
      sourceTextureCache.set(path, new Promise((resolve, reject) => {
        loader.load(path, resolve, undefined, reject);
      }));
    }
    return sourceTextureCache.get(path);
  }

  async function buildMaps(spec) {
    const resolved = {};
    for (const [slot, path] of Object.entries(spec.maps || {})) {
      if (!path) continue;
      try {
        const source = await loadSourceTexture(path);
        const owned = source.clone();
        configureTexture(THREE, owned, slot, spec.repeat, anisotropy);
        resolved[slot] = owned;
      } catch (error) {
        onMaterialStatus({ material: spec, slot, path, state: 'texture-error', error });
        if (strict) throw error;
      }
    }
    return resolved;
  }

  return async function materialResolver(materialName, object) {
    const spec = library[materialName];
    if (!spec) {
      onMaterialStatus({ materialName, object, state: 'unregistered' });
      if (strict) throw new Error(`Unregistered PBR material: ${materialName}`);
      return null; // Keep the GLTF's native material when no override is registered.
    }

    onMaterialStatus({ materialName, object, state: 'loading' });
    const maps = await buildMaps(spec);
    const params = {
      color: spec.color ?? 0xffffff,
      roughness: spec.roughness ?? 0.5,
      metalness: spec.metalness ?? 0.0,
      ...maps,
    };

    let material;
    if (spec.kind === 'physical') {
      material = new THREE.MeshPhysicalMaterial({
        ...params,
        clearcoat: spec.clearcoat ?? 0,
        clearcoatRoughness: spec.clearcoatRoughness ?? 0,
        transmission: spec.transmission ?? 0,
        ior: spec.ior ?? 1.5,
      });
    } else {
      material = new THREE.MeshStandardMaterial(params);
    }

    material.name = `pbr:${materialName}`;
    if (material.aoMap) material.aoMapIntensity = spec.aoMapIntensity ?? 1;
    if (material.normalMap && spec.normalScale) material.normalScale.set(spec.normalScale[0], spec.normalScale[1]);
    material.needsUpdate = true;
    onMaterialStatus({ materialName, object, state: 'ready' });
    return material;
  };
}
