// Camera-preserving adapter between canonical scene.json updates and a Three.js/Floorplan2Walkthru-style engine.
// The adapter only owns objects inside its managed group, so rebuilding furniture never resets camera,
// controls, static architecture, lighting, or unrelated scene state.

export function createThreeSceneAdapter({
  THREE,
  scene,
  camera,
  controls = null,
  assetFactory,
  materialResolver = null,
  onBeforeApply = () => {},
  onAfterApply = () => {},
} = {}) {
  if (!THREE) throw new Error('THREE is required');
  if (!scene) throw new Error('Three.js scene is required');
  if (!camera) throw new Error('Three.js camera is required');
  if (typeof assetFactory !== 'function') throw new Error('assetFactory(id, object) is required');

  const managedRoot = new THREE.Group();
  managedRoot.name = 'llm-managed-scene';
  scene.add(managedRoot);

  const records = new Map();
  let transactionDepth = 0;
  let cameraSnapshot = null;

  function snapshotCamera() {
    const state = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      up: camera.up.clone(),
      fov: camera.fov,
      zoom: camera.zoom,
    };
    if (controls?.target?.clone) state.target = controls.target.clone();
    return state;
  }

  function restoreCamera(state) {
    if (!state) return;
    camera.position.copy(state.position);
    camera.quaternion.copy(state.quaternion);
    camera.up.copy(state.up);
    camera.fov = state.fov;
    camera.zoom = state.zoom;
    camera.updateProjectionMatrix();
    if (state.target && controls?.target?.copy) controls.target.copy(state.target);
    if (typeof controls?.update === 'function') controls.update();
  }

  function disposeMaterial(material) {
    if (!material) return;
    const list = Array.isArray(material) ? material : [material];
    for (const mat of list) {
      for (const value of Object.values(mat || {})) {
        if (value?.isTexture && typeof value.dispose === 'function') value.dispose();
      }
      if (typeof mat?.dispose === 'function') mat.dispose();
    }
  }

  function disposeObject(root) {
    root.traverse?.(node => {
      if (node.geometry?.dispose) node.geometry.dispose();
      if (node.material) disposeMaterial(node.material);
    });
  }

  function applyTransform(root, object) {
    const p = object.position || [0, 0, 0];
    const r = object.rotation || [0, 0, 0];
    const s = object.scale || [1, 1, 1];
    root.position.set(Number(p[0]) || 0, Number(p[1]) || 0, Number(p[2]) || 0);
    root.rotation.set(Number(r[0]) || 0, Number(r[1]) || 0, Number(r[2]) || 0, 'XYZ');
    root.scale.set(Number(s[0]) || 1, Number(s[1]) || 1, Number(s[2]) || 1);
    root.userData.sceneObject = object;
  }

  async function buildObject(id, object) {
    const built = await assetFactory(id, object);
    if (!built?.isObject3D) throw new Error(`assetFactory did not return a THREE.Object3D for ${id}`);
    built.name = `scene:${id}`;
    built.userData.sceneId = id;
    applyTransform(built, object);

    if (materialResolver && object.material) {
      const replacement = await materialResolver(object.material, object, built);
      if (replacement) {
        built.traverse(node => {
          if (node.isMesh) node.material = replacement;
        });
      }
    }
    return built;
  }

  function sameRenderableState(a, b) {
    return JSON.stringify({
      asset: a?.asset,
      material: a?.material,
      type: a?.type,
    }) === JSON.stringify({
      asset: b?.asset,
      material: b?.material,
      type: b?.type,
    });
  }

  return {
    root: managedRoot,

    beginTransaction() {
      transactionDepth += 1;
      if (transactionDepth === 1) {
        cameraSnapshot = snapshotCamera();
        onBeforeApply();
      }
    },

    async upsertObject(id, object) {
      const existing = records.get(id);

      // If geometry/material identity has not changed, mutate transform in place for instant edits.
      if (existing && sameRenderableState(existing.state, object)) {
        applyTransform(existing.root, object);
        existing.state = structuredClone(object);
        return existing.root;
      }

      // Otherwise build replacement first, then swap atomically to avoid visible disappearance.
      const replacement = await buildObject(id, object);
      managedRoot.add(replacement);
      if (existing) {
        managedRoot.remove(existing.root);
        disposeObject(existing.root);
      }
      records.set(id, { root: replacement, state: structuredClone(object) });
      return replacement;
    },

    removeObject(id) {
      const existing = records.get(id);
      if (!existing) return;
      managedRoot.remove(existing.root);
      disposeObject(existing.root);
      records.delete(id);
    },

    listObjectIds() {
      return [...records.keys()];
    },

    endTransaction() {
      transactionDepth = Math.max(0, transactionDepth - 1);
      if (transactionDepth === 0) {
        restoreCamera(cameraSnapshot);
        cameraSnapshot = null;
        onAfterApply();
      }
    },

    dispose() {
      for (const id of [...records.keys()]) this.removeObject(id);
      scene.remove(managedRoot);
    },
  };
}

// Convenience helper: connect the live WebSocket client to this adapter while preserving camera state.
export function bindLiveScene({ connectLiveScene, applySceneToEngine, url, engine, onStatus = () => {} }) {
  if (typeof connectLiveScene !== 'function' || typeof applySceneToEngine !== 'function') {
    throw new Error('connectLiveScene and applySceneToEngine are required');
  }
  const apply = scene => Promise.resolve(applySceneToEngine(scene, engine));
  return connectLiveScene({
    url,
    onSnapshot: apply,
    onUpdate: apply,
    onStatus,
  });
}
