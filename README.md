# Anamarija EuroMax Digital Twin

Interactive browser-based first-person walkthrough of the planned premium, accessible **~200 m² enlarged Domprojekt Anamarija** near Velika Gorica, Croatia.

## Governing design target

The project is not a generic luxury villa and not a literal copy of the stock catalogue house. It is a premium accessible enlargement of the Domprojekt Anamarija, retaining the original single-storey identity and zoning while increasing scale, ceiling height, glazing, circulation, finishes and indoor/outdoor living quality.

The current governing visual brief is documented in [`DESIGN_TARGET_V40.md`](./DESIGN_TARGET_V40.md).

The v40 hero route is:

**Entrance → Hallway → Living Room → Kitchen / Dining → Panoramic Glazing → Terrace → Pool**

## Current next-generation scene

The active next-generation walkthrough is `nextgen.html`, driven by `src/nextgen-app-v1.js` and the modular scene stack.

Current systems include:

- Three.js first-person navigation with PointerLockControls;
- walking and wheelchair eye-height modes;
- collision-aware movement;
- room jump navigation;
- daytime / evening / night presentation states;
- fullscreen presentation;
- high ceilings and raised living-zone volume;
- panoramic glazing and tall doors;
- Calacatta-style stone / porcelain and warm oak material language;
- premium architectural lighting;
- open-plan living, kitchen and dining hero-zone detailing;
- private-room detailing;
- terrace, garden and 8 × 4 m pool;
- runtime GLB/glTF production-asset registry with procedural fallbacks;
- architectural QA against the current working envelope;
- optional live-scene WebSocket connection.

## V40 source-of-truth configuration

Core project intent and presentation viewpoints are kept in `src/house-config.js`.

- Base model: Domprojekt Anamarija
- Concept: Anamarija EuroMax
- Target internal area: approximately 200 m²
- General ceiling target: approximately 2.8–3.0 m
- Main living-zone peak / raised volume: up to approximately 4.0 m in the working concept
- Tall doors: approximately 2.2–2.3 m
- Accessibility target: generous step-free circulation with approximately 1.5 m principal turning/circulation zones where practical
- Pool: 8 × 4 m

Exact construction dimensions remain provisional until replaced by final architect / Domprojekt documentation.

## Production asset pipeline

Selected Poly Haven assets can be fetched automatically:

```bash
node scripts/fetch-polyhaven-assets.mjs
```

Downloaded files are placed under `assets/models/<polyhaven-id>/` and registered through the runtime asset registry. Missing production assets retain safe procedural fallbacks so the walkthrough remains usable.

Poly Haven assets used by this project are CC0.

## Run locally

Because the project uses JavaScript modules, serve the repository through a local web server:

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080/nextgen.html
```

VS Code Live Server also works.

## Controls

- `WASD` or arrow keys — move
- mouse — look around after entering first-person mode
- `Esc` — release pointer lock
- Wheelchair Mode / Walking Mode — change navigation eye height and movement envelope
- room list / hero strip — jump to principal viewpoints
- Time — switch Daytime / Evening / Night presentation states
- Fullscreen — enter or leave presentation mode
- touch devices — on-screen movement controls plus drag-to-look

## Important design status

This is a **visual digital twin / design-development model**, not a certified architectural, structural, fire-safety, MEP or accessibility construction drawing.

Final wall positions, structural spans, roof build-up, glazing systems, door clear openings, thresholds, drainage, MEP zones and furniture clearances must be replaced or verified against final professional drawings before construction decisions are made.

## Technical stack

- Three.js browser-native ES modules
- PointerLockControls and GLTFLoader
- procedural + production GLB/glTF scene content
- physically based materials and ACES filmic tone mapping
- dynamic presentation lighting
- collision-aware first-person movement
- modular architecture / interior / lighting / landscape / QA layers
- no backend required for normal walkthrough use

## Next refinement milestones

1. Replace concept wall geometry with the exact final dimensioned ~200 m² architectural plan.
2. Match final Domprojekt elevations and roof geometry exactly from architect drawings.
3. Replace remaining hero-route procedural furniture with high-quality production GLB/glTF assets.
4. Replace remaining procedural surfaces with exact selected Croatian product PBR textures.
5. Expand real-model coverage to sanitaryware, appliances, beds, wardrobes and planting.
6. Add true wheelchair swept-path, transfer-space and door-clearance validation.
7. Add generated floor-plan/minimap context from the actual geometry.
8. Add optional guided cinematic camera paths and WebXR.
