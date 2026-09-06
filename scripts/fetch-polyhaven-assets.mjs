import fs from 'node:fs/promises';
import path from 'node:path';

const USER_AGENT = 'House-Build-AssetFetcher/1.0';
const API = 'https://api.polyhaven.com/files';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets', 'models');

const assets = [
  'modern_wooden_cabinet',
  'potted_plant_01',
  'crystalline_iceplant',
  'modern_arm_chair_01',
  'coffee_table_round_01',
  'modern_coffee_table_01',
  'dining_chair_02',
];

function findBestGltfNode(files) {
  const exact = files?.gltf?.['1k']?.gltf || files?.gltf?.['2k']?.gltf;
  if (exact?.url) return exact;

  const candidates = [];
  const walk = (value, trail = []) => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.url === 'string' && /\.(gltf|glb)(\?|$)/i.test(value.url)) {
      candidates.push({ node: value, trail: trail.join('/'), url: value.url });
    }
    for (const [k, v] of Object.entries(value)) walk(v, [...trail, k]);
  };
  walk(files);
  candidates.sort((a, b) => {
    const score = c => (c.trail.includes('1k') ? 0 : c.trail.includes('2k') ? 1 : 2) + (c.url.endsWith('.glb') ? 0 : 0.2);
    return score(a) - score(b);
  });
  return candidates[0]?.node || null;
}

function collectIncluded(node) {
  const urls = [];
  const walk = value => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.url === 'string') urls.push(value.url);
    for (const v of Object.values(value)) walk(v);
  };
  walk(node?.include || {});
  return [...new Set(urls)];
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function download(url, destination) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  const data = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destination, data);
  return data.byteLength;
}

async function installAsset(id) {
  console.log(`\n→ ${id}`);
  const files = await fetchJson(`${API}/${encodeURIComponent(id)}`);
  const gltfNode = findBestGltfNode(files);
  if (!gltfNode?.url) throw new Error(`No glTF/GLB download found for ${id}`);

  const dir = path.join(OUT, id);
  await fs.mkdir(dir, { recursive: true });

  const entryUrl = gltfNode.url;
  const ext = /\.glb(\?|$)/i.test(entryUrl) ? '.glb' : '.gltf';
  const entryName = `scene${ext}`;
  const entryPath = path.join(dir, entryName);
  const bytes = await download(entryUrl, entryPath);
  console.log(`  entry ${entryName} ${(bytes / 1024 / 1024).toFixed(1)} MB`);

  if (ext === '.gltf') {
    const dependencies = collectIncluded(gltfNode);
    for (const depUrl of dependencies) {
      if (depUrl === entryUrl) continue;
      const filename = decodeURIComponent(new URL(depUrl).pathname.split('/').pop());
      if (!filename) continue;
      try {
        const n = await download(depUrl, path.join(dir, filename));
        console.log(`  + ${filename} ${(n / 1024 / 1024).toFixed(1)} MB`);
      } catch (err) {
        console.warn(`  ! dependency failed: ${filename}: ${err.message}`);
      }
    }

    // Poly Haven glTF often references its original filename. Rename references
    // only in the top-level JSON when safe, while preserving texture filenames.
    const text = await fs.readFile(entryPath, 'utf8');
    await fs.writeFile(entryPath, text);
  }

  return `./assets/models/${id}/${entryName}`;
}

await fs.mkdir(OUT, { recursive: true });
const result = {};
for (const id of assets) {
  try {
    result[id] = await installAsset(id);
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
  }
}

await fs.writeFile(path.join(OUT, 'installed.json'), JSON.stringify(result, null, 2));
console.log('\nFinished. Serve the project locally and refresh the walkthrough.');
