// Lightweight first-person collision layer for the editable Anamarija walkthrough.
// Uses low-cost AABB proxies generated from architecture/furniture objects rather
// than raycasting against full GLTF detail every frame.

export function createCollisionSystem({ THREE, playerRadius = 0.45, playerHeight = 1.7 } = {}) {
  if (!THREE) throw new Error('THREE is required');

  const proxies = new Map();
  const scratchBox = new THREE.Box3();
  const scratchSize = new THREE.Vector3();
  const scratchCenter = new THREE.Vector3();
  const nextPosition = new THREE.Vector3();
  const axisPosition = new THREE.Vector3();

  function makeProxyFromObject(id, object3D, options = {}) {
    if (!object3D?.isObject3D) throw new Error(`Object3D required for collision proxy ${id}`);
    object3D.updateWorldMatrix(true, true);
    scratchBox.setFromObject(object3D);

    if (scratchBox.isEmpty()) return null;
    scratchBox.getSize(scratchSize);
    scratchBox.getCenter(scratchCenter);

    const padding = Number.isFinite(options.padding) ? options.padding : 0.03;
    const min = scratchBox.min.clone().addScalar(-padding);
    const max = scratchBox.max.clone().addScalar(padding);

    const proxy = {
      id,
      kind: options.kind || object3D.userData?.collisionKind || 'solid',
      enabled: options.enabled ?? true,
      box: new THREE.Box3(min, max),
      source: object3D,
    };
    proxies.set(id, proxy);
    return proxy;
  }

  function setProxyBox(id, min, max, options = {}) {
    const proxy = {
      id,
      kind: options.kind || 'solid',
      enabled: options.enabled ?? true,
      box: new THREE.Box3(
        new THREE.Vector3(min[0], min[1], min[2]),
        new THREE.Vector3(max[0], max[1], max[2]),
      ),
      source: null,
    };
    proxies.set(id, proxy);
    return proxy;
  }

  function removeProxy(id) {
    proxies.delete(id);
  }

  function refreshProxy(id) {
    const proxy = proxies.get(id);
    if (!proxy?.source) return proxy;
    proxy.source.updateWorldMatrix(true, true);
    proxy.box.setFromObject(proxy.source);
    return proxy;
  }

  function refreshAll() {
    for (const id of proxies.keys()) refreshProxy(id);
  }

  function collidesAt(position, radius = playerRadius, height = playerHeight) {
    const half = radius;
    const minY = position.y - height * 0.5;
    const maxY = position.y + height * 0.5;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - half, minY, position.z - half),
      new THREE.Vector3(position.x + half, maxY, position.z + half),
    );

    for (const proxy of proxies.values()) {
      if (!proxy.enabled || proxy.kind === 'nonblocking') continue;
      if (playerBox.intersectsBox(proxy.box)) return proxy;
    }
    return null;
  }

  function resolveMovement(currentPosition, intendedDelta, options = {}) {
    const radius = options.radius ?? playerRadius;
    const height = options.height ?? playerHeight;

    nextPosition.copy(currentPosition).add(intendedDelta);
    if (!collidesAt(nextPosition, radius, height)) {
      return { delta: intendedDelta.clone(), blocked: false, obstacle: null };
    }

    // Axis-separated resolution allows natural sliding along walls/furniture.
    const resolved = new THREE.Vector3();
    let obstacle = null;

    axisPosition.copy(currentPosition);
    axisPosition.x += intendedDelta.x;
    const xHit = collidesAt(axisPosition, radius, height);
    if (!xHit) resolved.x = intendedDelta.x;
    else obstacle = xHit;

    axisPosition.copy(currentPosition);
    axisPosition.z += intendedDelta.z;
    const zHit = collidesAt(axisPosition, radius, height);
    if (!zHit) resolved.z = intendedDelta.z;
    else obstacle ||= zHit;

    // Vertical movement is intentionally omitted for the single-storey walkthrough.
    return { delta: resolved, blocked: resolved.lengthSq() < intendedDelta.lengthSq(), obstacle };
  }

  function debugHelpers(scene, visible = false) {
    const group = new THREE.Group();
    group.name = 'collision-debug';
    for (const proxy of proxies.values()) {
      proxy.box.getSize(scratchSize);
      proxy.box.getCenter(scratchCenter);
      const geom = new THREE.BoxGeometry(scratchSize.x, scratchSize.y, scratchSize.z);
      const mat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.25 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(scratchCenter);
      mesh.name = `collision:${proxy.id}`;
      group.add(mesh);
    }
    group.visible = visible;
    scene?.add(group);
    return group;
  }

  return {
    makeProxyFromObject,
    setProxyBox,
    removeProxy,
    refreshProxy,
    refreshAll,
    collidesAt,
    resolveMovement,
    debugHelpers,
    listProxies: () => [...proxies.values()],
  };
}

// Helper for a scene adapter: regenerate/update an object's collision proxy after
// its model or transform changes, and remove the proxy when the object is deleted.
export function createCollisionHooks(collisionSystem, optionsForObject = () => ({})) {
  if (!collisionSystem) throw new Error('collisionSystem is required');
  return {
    upsert(id, root, state) {
      const options = optionsForObject(id, state, root) || {};
      if (options.enabled === false || state?.collision === false) {
        collisionSystem.removeProxy(id);
        return null;
      }
      return collisionSystem.makeProxyFromObject(id, root, options);
    },
    remove(id) {
      collisionSystem.removeProxy(id);
    },
  };
}
