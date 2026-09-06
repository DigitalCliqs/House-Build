# Anamarija EuroMax Digital Twin

Interactive browser-based first-person walkthrough of the planned accessible premium ~200 m² EuroMax house near Velika Gorica, Croatia.

## Current finished-concept scene — v6 + high-detail asset pipeline

The active walkthrough combines the high-fidelity v4 scene, the articulated Anamarija-style roof/elevation layer, v6 reflection/façade refinements and an optional real-model asset pipeline.

Current scene includes high ceilings, panoramic glazing, animated blinds and tall doors, Calacatta-style marble, oak herringbone, detailed kitchen/bathrooms, architectural lighting, accessible circulation, landscaped ~1,200 m² plot, terrace/pergola, 8 × 4 m pool with animated cover, articulated multi-pitch roof, fascia/gutters/downpipes, deeper window reveals, stone feature cladding and guided presentation controls.

## Install the real CC0 furniture / planting assets

The project can now fetch its selected Poly Haven models automatically rather than requiring manual binary uploads.

```bash
node scripts/fetch-polyhaven-assets.mjs
```

The installer currently targets:

- modern wooden cabinet
- modern arm chair 01
- round stone coffee table
- modern coffee table 01
- dining chair 02
- potted plant 01
- crystalline iceplant

Downloaded files are placed under `assets/models/<polyhaven-id>/` and the walkthrough loads them automatically through `src/asset-manifest-v5.js`. If a file is absent, the procedural fallback scene remains functional.

Poly Haven assets used by this project are CC0. The viewer keeps a visible Poly Haven credit.

## Run locally

Because the project uses JavaScript modules, serve the repository through a local web server rather than double-clicking `index.html`.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. VS Code Live Server also works.

## Controls

- `WASD` or arrow keys — move
- mouse — look around after entering first-person mode
- `Shift` — move faster
- `Esc` — release mouse lock
- Profile — walking or wheelchair navigation envelope
- Turn circle — display a 1.50 m accessibility checking circle
- Go to / Quick views — jump to principal rooms, terrace, pool or garden
- Time — inspect the property through the day/night cycle
- Lighting — force bright-day, evening-mood or night settings
- Doors — animate all doors open/closed
- Blinds — animate principal motorised blinds open/closed
- Pool cover — animate the electric slatted pool cover open/closed
- Double-click a nearby door — toggle that door individually
- Guided tour — automated presentation through the principal spaces and garden

## Important design status

This is a **visual digital twin / design-development model**, not a certified architectural, structural, fire-safety or accessibility construction drawing. Final wall positions, structural spans, glazing sizes, door clear openings, MEP zones and furniture clearances must still be replaced with the final dimensioned Domprojekt/architect drawings before construction decisions are made.

Core dimensions and room zones are kept in `src/house-config.js`. Presentation specifications are in `src/specifications.js`. The presentation layer is `src/presentation-v3.js`; high-fidelity scene geometry is `src/viewer-v4.js`; roof/GLB integration is `src/viewer-bootstrap-v5.js`; and v6 visual refinement is layered above that.

## Technical stack

- Three.js 0.169
- browser-native ES modules + import map
- PointerLockControls and GLTFLoader
- procedural Calacatta-style marble, oak herringbone, stone and landscape materials
- physical materials, PMREM environment reflection and ACES filmic tone mapping
- dynamic sun and practical lighting
- animated doors, blinds, pool cover and water
- optional local CC0 glTF furniture/vegetation assets
- no backend required

The MIT-licensed `ch-bas/threejs-sims-house-builder` remains a useful reference/base candidate for later editor functions such as interactive wall editing, plan import, measurements, saved layouts and GLB/glTF export.

## Next refinement milestones

1. Replace concept wall geometry with the exact final dimensioned ~200 m² architectural plan.
2. Match final Domprojekt elevations and roof geometry exactly from architect drawings.
3. Replace remaining procedural surfaces with exact selected Croatian product PBR textures.
4. Expand real-model coverage to sofas, sanitaryware, appliances, beds, wardrobes and more planting.
5. Add true wheelchair swept-path, transfer-space and door-clearance validation.
6. Add optional WebXR and exportable cinematic camera paths.
