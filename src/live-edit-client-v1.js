// Realtime scene sync client for the next-generation geometry engine.
// It is intentionally not imported by the current cubemap-only tour yet.

function revisionKey(scene, message) {
  const raw = message?.revision ?? scene?.metadata?.revision ?? scene?.metadata?.version ?? scene?.metadata?.updatedAt;
  if (typeof raw === 'number' && Number.isFinite(raw)) return { kind: 'number', value: raw };
  if (typeof raw === 'string') {
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && raw.trim() !== '') return { kind: 'number', value: numeric };
    const time = Date.parse(raw);
    if (Number.isFinite(time)) return { kind: 'number', value: time };
    return { kind: 'string', value: raw };
  }
  return null;
}

function isNewer(next, current) {
  if (!next || !current) return true;
  if (next.kind !== current.kind) return true;
  if (next.kind === 'number') return next.value > current.value;
  return next.value !== current.value;
}

export function connectLiveScene({
  url,
  onSnapshot = () => {},
  onUpdate = () => {},
  onStatus = () => {},
} = {}) {
  if (!url) throw new Error('WebSocket URL is required');

  let socket = null;
  let closedByClient = false;
  let retryMs = 1000;
  let retryTimer = null;
  let applyQueue = Promise.resolve();
  let lastAppliedRevision = null;

  const enqueue = (handler, scene, message) => {
    const nextRevision = revisionKey(scene, message);
    applyQueue = applyQueue
      .then(async () => {
        if (!isNewer(nextRevision, lastAppliedRevision)) {
          onStatus({ state: 'stale-update-skipped', revision: nextRevision });
          return;
        }
        await handler(scene, message);
        if (nextRevision) lastAppliedRevision = nextRevision;
      })
      .catch(error => {
        onStatus({ state: 'error', error });
      });
  };

  const connect = () => {
    onStatus({ state: 'connecting' });
    socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      retryMs = 1000;
      onStatus({ state: 'connected' });
    });

    socket.addEventListener('message', event => {
      try {
        const message = JSON.parse(event.data);
        const handler = message.type === 'scene.snapshot' ? onSnapshot : message.type === 'scene.updated' ? onUpdate : null;
        if (handler) enqueue(handler, message.scene, message);
      } catch (error) {
        onStatus({ state: 'error', error });
      }
    });

    socket.addEventListener('close', () => {
      onStatus({ state: 'disconnected' });
      if (closedByClient) return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 1.8, 10000);
    });

    socket.addEventListener('error', error => {
      onStatus({ state: 'error', error });
    });
  };

  connect();

  return {
    close() {
      closedByClient = true;
      clearTimeout(retryTimer);
      socket?.close();
    },
    ping() {
      if (socket?.readyState === WebSocket.OPEN) socket.send('ping');
    },
  };
}

export async function applySceneToEngine(scene, engine) {
  if (!engine) throw new Error('Scene engine adapter is required');
  if (typeof engine.beginTransaction === 'function') await engine.beginTransaction();
  try {
    const incoming = scene?.objects || {};
    const existingIds = new Set(typeof engine.listObjectIds === 'function' ? engine.listObjectIds() : []);

    for (const [id, object] of Object.entries(incoming)) {
      existingIds.delete(id);
      if (typeof engine.upsertObject === 'function') await engine.upsertObject(id, object);
    }

    for (const id of existingIds) {
      if (typeof engine.removeObject === 'function') await engine.removeObject(id);
    }
  } finally {
    if (typeof engine.endTransaction === 'function') await engine.endTransaction();
  }
}
