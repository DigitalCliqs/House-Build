// GLTF/GLB asset factory for the live-edit scene adapter.
// It loads real model assets, clones them per scene object, and gives each clone
// its own disposable geometry/material/texture resources so live replacement does
// not corrupt cached source assets or leak GPU memory.

export const LIVE_ASSET_REGISTRY = {
  'round-oak-stone-table': './assets/models/coffee_table_round_01/scene.gltf',
  'modern-coffee-table': './assets/models/modern_coffee_table_01/scene.gltf',
  'modern-armchair': './assets/models/modern_arm_chair_01/scene.gltf',
  'modern-wooden-cabinet': './assets/models/modern_wooden_cabinet/scene.gltf',
  'dining-chair': './assets/models/dining_chair_02/scene.gltf',
  'potted-plant': './assets/models/potted_plant_01/scene.gltf',
  'crystalline-iceplant': './assets/models/crystalline_iceplant/scene.gltf',

  // Canonical Anamarija assets. These paths are deliberately explicit so the
  // scene can reference stable design IDs even when the model library changes.
  'warm-ivory-sectional': './assets/models/anamarija/warm-ivory-sectional.glb',
  'calacatta-island-3.25m': './assets/models/anamarija/calacatta-island-3.25m.glb',
  'oak-dining-8': './assets/models/anamarija/oak-dining-8.glb',
  'pool-8x4': './assets/models/anamarija/pool-8x4.glb',
};

const TEXTURE_KEYS = [
  'map','alphaMap','aoMap','bumpMap','displacementMap','emissiveMap','envMap',
  'lightMap','metalnessMap','normalMap','roughnessMap','clearcoatMap',
  'clearcoatNormalMap','clearcoatRoughnessMap','iridescenceMap',
  'iridescenceThicknessMap','sheenColorMap','sheenRoughnessMap',
  'specularColorMap','specularIntensityMap','thicknessMap','transmissionMap',
];

function cloneMaterialOwned(material) {
  if (!material) return material;
  const clone = material.clone();
  for (const key of TEXTURE_KEYS) {
    const texture = clone[key];
    if (texture?.isTexture) {
      clone[key] = texture.clone();
      clone[key].needsUpdate = true;
    }
  }
  return clone;
}

function makeOwnedClone(source) {
  const root = source.clone(true);
  root.traverse(node => {
    if (!node.isMesh) return;
    if (node.geometry?.clone) node.geometry = node.geometry.clone();
    if (Array.isArray(node.material)) node.material = node.material.map(cloneMaterialOwned);
    else if (node.material) node.material = cloneMaterialOwned(node.material);
    node.castShadow = true;
    node.receiveShadow = true;
  });
  return root;
}

function fallbackObject(THREE, id, object) {
  // Development-only visual fallback. Production can disable this with strict=true.
  const type = object?.type || 'furniture';
  let geometry;
  if (String(object?.asset || '').includes('table')) geometry = new THREE.BoxGeometry(1.5, .08, .8);
  else if (String(object?.asset || '').includes('sofa')) geometry = new THREE.BoxGeometry(2.4, .78, .95);
  else if (type === 'amenity') geometry = new THREE.BoxGeometry(4, .18, 8);
  else geometry = new THREE.BoxGeometry(1, 1, 1);

  const material = new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: .75, metalness: .02 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `missing-asset:${id}`;
  mesh.userData.assetMissing = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

export function createGLTFAssetFactory({
  THREE,
  GLTFLoader,
  registry = LIVE_ASSET_REGISTRY,
  strict = false,
  onAssetStatus = () => {},
} = {}) {
  if (!THREE) throw new Error('THREE is required');
  if (!GLTFLoader) throw new Error('GLTFLoader constructor is required');

  const loader = new GLTFLoader();
  const cache = new Map();

  async function loadSource(path) {
    if (!cache.has(path)) {
      cache.set(path, new Promise((resolve, reject) => {
        loader.load(
          path,
          gltf => resolve(gltf.scene || gltf.scenes?.[0]),
          undefined,
          reject,
        );
      }));
    }
    return cache.get(path);
  }

  return async function assetFactory(id, object) {
    const assetKey = object?.asset;
    const path = registry[assetKey] || (typeof assetKey === 'string' && /\.(?:glb|gltf)(?:\?|$)/i.test(assetKey) ? assetKey : null);

    if (!path) {
      onAssetStatus({ id, asset: assetKey, state: 'unregistered' });
      if (strict) throw new Error(`No GLTF asset registered for ${assetKey || id}`);
      return fallbackObject(THREE, id, object);
    }

    try {
      onAssetStatus({ id, asset: assetKey, path, state: 'loading' });
      const source = await loadSource(path);
      if (!source) throw new Error(`GLTF has no scene root: ${path}`);
      const instance = makeOwnedClone(source);
      instance.userData.assetKey = assetKey;
      instance.userData.assetPath = path;
      onAssetStatus({ id, asset: assetKey, path, state: 'ready' });
      return instance;
    } catch (error) {
      onAssetStatus({ id, asset: assetKey, path, state: 'error', error });
      if (strict) throw error;
      return fallbackObject(THREE, id, object);
    }
  };
}
