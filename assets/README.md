# High-detail local assets

The v5 viewer supports local glTF/GLB detail assets. Keeping them in the repository (or Git LFS if they become large) avoids fragile runtime dependencies and gives us predictable presentation performance.

## Expected model paths

Place downloaded GLB versions at:

- `assets/models/modern_wooden_cabinet.glb`
- `assets/models/potted_plant_01.glb`
- `assets/models/crystalline_iceplant.glb`

The placement/scaling is defined in `src/asset-manifest-v5.js`.

## Verified CC0 sources

Recommended sources currently used by the manifest:

- Poly Haven — Modern Wooden Cabinet: https://polyhaven.com/a/modern_wooden_cabinet
- Poly Haven — Potted Plant 01: https://polyhaven.com/a/potted_plant_01
- Poly Haven — Crystalline Iceplant: https://polyhaven.com/a/crystalline_iceplant

Poly Haven states its downloadable assets are CC0. The project should still preserve a small source note for provenance and easier maintenance.

## Why the binaries are not committed yet

The GitHub connector used to maintain this repository can create/update UTF-8 repository files but does not upload arbitrary binary GLB files from this chat. The viewer therefore attempts to load these paths and gracefully continues with the existing procedural scene when a model is absent.

Once the GLBs are added manually or through a binary-capable Git workflow, v5 will load them automatically with no code changes.
