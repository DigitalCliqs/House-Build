// Next-generation editable first-person engine core for the Anamarija walkthrough.
// This module wires the existing collision, GLTF, PBR and live-scene layers together
// without coupling them to the legacy procedural viewer or the cubemap tour.

import { createCollisionSystem, createCollisionHooks } from './collision-system-v1.js';
import { registerAnamarijaArchitectureCollisions } from './architecture-collision-v1.js';
import { createGLTFAssetFactory } from './gltf-asset-factory-v1.js';
import { createPBRMaterialResolver } from './pbr-material-library-v1.js';
import { createThreeSceneAdapter, bindLiveScene } from './three-scene-adapter-v1.js';
import { connectLiveScene, applySceneToEngine } from './live-edit-client-v1.js';

export function createAnamarijaNextgenEngine({
  THREE,
  GLTFLoader,
  scene,
  camera,
  renderer,
  controls = null,
  assetRegistry,
  strictAssets = false,
  strictMaterials = false,
  onAssetStatus = () => {},
  onMaterialStatus = () => {},
  onBeforeApply = () => {},
  onAfterApply = () => {},
  architectureCollisionOptions = {},
} = {}) {
  if (!THREE || !scene || !camera || !renderer || !GLTFLoader) {
    throw new Error('THREE, GLTFLoader, scene, camera and renderer are required');
  }

  const collisionSystem = createCollisionSystem({ THREE });
  const architecture = registerAnamarijaArchitectureCollisions(
    collisionSystem,
    architectureCollisionOptions,
  );

  const assetFactory = createGLTFAssetFactory({
    THREE,
    GLTFLoader,
    ...(assetRegistry ? { registry: assetRegistry } : {}),
    strict: strictAssets,
    onAssetStatus,
  });

  const materialResolver = createPBRMaterialResolver({
    THREE,
    renderer,
    strict: strictMaterials,
    onMaterialStatus,
  });

  const collisionHooks = createCollisionHooks(collisionSystem, (id, state) => ({
    kind: state?.type === 'amenity' ? 'amenity' : 'furniture',
    enabled: state?.collision !== false,
    padding: state?.collisionPadding ?? 0.03,
  }));

  const sceneAdapter = createThreeSceneAdapter({
    THREE,
    scene,
    camera,
    controls,
    assetFactory,
    materialResolver,
    collisionHooks,
    onBeforeApply,
    onAfterApply,
  });

  function resolveFirstPersonMovement(intendedDelta, mode = 'walking') {
    const wheelchair = mode === 'wheelchair';
    return collisionSystem.resolveMovement(camera.position, intendedDelta, {
      radius: wheelchair ? 0.46 : 0.34,
      height: wheelchair ? 1.20 : 1.70,
    });
  }

  function moveFirstPerson(intendedDelta, mode = 'walking') {
    const result = resolveFirstPersonMovement(intendedDelta, mode);
    camera.position.add(result.delta);
    return result;
  }

  function setViewHeight(mode = 'walking') {
    const height = mode === 'wheelchair' ? 1.20 : 1.65;
    camera.position.y = height;
    return height;
  }

  function connect(url, onStatus = () => {}) {
    if (!url) throw new Error('A WebSocket URL is required for live scene sync');
    return bindLiveScene({
      connectLiveScene,
      applySceneToEngine,
      url,
      engine: sceneAdapter,
      onStatus,
    });
  }

  return {
    sceneAdapter,
    collisionSystem,
    architecture,
    resolveFirstPersonMovement,
    moveFirstPerson,
    setViewHeight,
    connect,
    dispose() {
      sceneAdapter.dispose();
    },
  };
}
