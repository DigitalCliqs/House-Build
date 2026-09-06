# Photoreal Asset Sourcing Policy

This project should prefer assets that can be used safely in a long-lived public walkthrough and whose licences can be recorded alongside each asset.

## Approved primary sources

### Poly Haven — preferred for HDRIs, PBR textures and selected models
- Licence: CC0.
- Use for: HDR environments, seamless PBR materials, plants, props and furniture where the visual fit is strong.
- Strengths: high-resolution unclipped HDRIs, photoscanned seamless PBR textures, hyperreal models, simple licence position.
- Project rule: store source URL, Poly Haven asset ID, licence `CC0`, original download resolution and any optimisation performed.

### ambientCG — preferred secondary source for PBR textures
- Licence: CC0.
- Use for: stone, marble, plaster, concrete, timber, fabric and other seamless PBR surfaces when Poly Haven does not have the exact finish needed.
- Project rule: retain the ambientCG asset ID and map set metadata (base colour, normal, roughness, AO, displacement where used).

### Quaternius — fallback for generic geometry only
- Use for: temporary or non-hero furniture/props when no photoreal model is available.
- Important: Quaternius' current site licence changed in 2026. Do not assume every older pack is still governed by CC0 solely because an old pack page says so. Record the licence shown for the exact downloaded asset/date and do not use it for hero assets unless the licence is clear.
- Visual quality: generally better suited to placeholders/game assets than final photoreal hero furniture.

## Conditional source

### Sketchfab — manual-review only
- Sketchfab contains a large library of downloadable Creative Commons models and can provide glTF/GLB downloads.
- Licences vary by model. A model must not enter the production registry until its exact licence, author, source URL and attribution requirements have been recorded.
- Avoid NC assets for anything that could become commercial. Avoid ND assets if optimisation, retopology, material replacement or editing is required. Prefer CC0 or CC BY assets when using Sketchfab.
- The automated Download API also requires authentication, so this is not the preferred bulk-ingest route for our build.

## Project-specific Anamarija hero assets

The following design-defining items should not be filled with arbitrary generic models. They need either a close production model or a purpose-built GLB matching the approved reference design:

- `warm-ivory-sectional`
- `calacatta-island-3.25m`
- `oak-dining-8`
- full-height kitchen cabinetry
- living media wall
- master bed
- accessible bedroom furniture
- accessible bathroom sanitary layout
- ensuite vanity/shower set
- terrace lounge/dining set
- pergola
- `pool-8x4`

For these assets, spatial dimensions matter as much as appearance. A visually attractive model is rejected if its real dimensions break the canonical scene or accessibility clearances.

## Texture quality target

Source masters should normally be 4K–8K for hero surfaces, then generate browser delivery variants after QA. Required channels vary by material but should usually include:

- base colour / albedo
- normal
- roughness
- ambient occlusion
- optional displacement/height
- optional metalness

Do not bake dramatic directional lighting into base-colour textures. Lighting belongs in the renderer/HDRI system.

## HDRI policy

Use HDRIs for illumination and reflections (`scene.environment`) rather than as the final visible world once the actual garden/site is present. This prevents a reflected or visible environment from contradicting the Anamarija site geometry.

Maintain at least:

- neutral daylight environment
- warm late-afternoon/evening environment

The renderer should use PMREM-filtered image-based lighting and ACES tone mapping.

## Asset registry requirements

Every production asset record should contain:

```json
{
  "id": "stable-project-id",
  "kind": "model|texture|hdri",
  "source": "Poly Haven",
  "sourceUrl": "https://...",
  "sourceAssetId": "...",
  "license": "CC0",
  "author": "...",
  "downloadedAt": "YYYY-MM-DD",
  "originalFormat": "glb|gltf|hdr|jpg|png",
  "masterResolution": "...",
  "optimizedForWeb": true,
  "notes": "..."
}
```

Assets without this provenance record are development-only and must not be promoted to the final walkthrough.

## Web optimisation gate

Before an asset is marked production-ready:

1. verify licence/provenance;
2. check physical dimensions in metres;
3. remove hidden/unneeded geometry;
4. reduce excessive polygon count without changing silhouette;
5. deduplicate materials/textures;
6. generate sensible texture resolutions for desktop/mobile;
7. preserve PBR channels and colour-space metadata;
8. verify normals/tangents;
9. test shadows and reflections under both day/evening HDRIs;
10. confirm the live-update disposal path does not leak GPU resources;
11. confirm accessibility/collision volumes still match the canonical scene.

## Source priority

For this project the priority order is:

**Poly Haven → ambientCG for textures → purpose-built Anamarija GLBs → carefully reviewed Sketchfab models → generic fallback assets only during development.**
