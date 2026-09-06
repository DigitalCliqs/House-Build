# High-detail model cache

This folder is populated by the optional Poly Haven asset installer:

```bash
node scripts/fetch-polyhaven-assets.mjs
```

The installer downloads low-resolution glTF variants suitable for a browser walkthrough and stores each asset in its own folder, for example:

```text
assets/models/
  modern_arm_chair_01/
    scene.gltf
    ...textures / buffers...
  modern_coffee_table_01/
    scene.gltf
    ...
```

The walkthrough is intentionally fault-tolerant. If an asset is missing, the procedural furniture already built into the scene remains visible and the viewer continues to work.

Poly Haven model assets used by this project are CC0. The project should continue to display the Poly Haven credit in the viewer even though attribution is not legally required for CC0 assets.
