# Anamarija EuroMax Digital Twin

Interactive browser-based first-person walkthrough of the planned accessible premium ~200 m² EuroMax house near Velika Gorica, Croatia.

## Current finished-concept scene — v4

The active viewer is now `src/viewer-v4.js`. It is aimed at looking and behaving like a finished luxury home rather than a bare architectural massing model.

Current scene includes:

- single-storey accessible layout based on the enlarged Anamarija concept
- EuroMax / ultra-low-energy design intent
- 2.8 m private-area ceilings, ~3.05 m principal ceilings and ~4.1 m raised living zone
- tall architectural doors and enlarged entrance portal
- large floor-to-ceiling panoramic glazing
- animated motorised exterior blinds
- white Calacatta-style marble-look porcelain with tile joint detail
- oak herringbone-style flooring in bedrooms and office
- detailed central built-in storage wall
- upgraded fitted kitchen with tall appliance bank, wall cabinetry, island, sink/hob details and an accessible undercut work zone
- more detailed dining and living furniture, media wall, feature slats and artwork
- furnished bedrooms with layered bedding, wardrobes and side furniture
- accessible wet room with marble wall treatment, roll-in shower, bench, WC, vanity, mirror and grab-rail details
- ensuite / guest WC detailing
- recessed, pendant, cove and warm architectural lighting
- animated day/evening/night atmosphere
- walking and wheelchair camera modes
- visible wheelchair envelope plus optional 1.50 m turning-circle overlay
- flush terrace, pergola and outdoor lounge
- landscaped ~1,200 m² concept plot with driveway, front gate, parked car, privacy hedging, planting beds, shrubs and trees
- 8 × 4 m pool, paved deck, animated water surface and electric slatted-cover visualisation
- loungers, outdoor shower and pool-lift provision zone
- room/garden teleport controls
- animated tall internal/front doors
- guided presentation tour and live specification panel
- browser import map so Three.js addon imports resolve reliably

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

Core dimensions and room zones are kept in `src/house-config.js`. Presentation specifications are in `src/specifications.js`. The presentation layer is in `src/presentation-v3.js` and the active renderer is `src/viewer-v4.js`.

## Technical stack

- Three.js 0.169
- browser-native ES modules + import map
- PointerLockControls
- procedural Calacatta-style marble, oak herringbone, stone and landscape materials
- physical materials and ACES filmic tone mapping
- dynamic sun and practical lighting
- animated doors, blinds, pool cover and water
- no backend required

The MIT-licensed `ch-bas/threejs-sims-house-builder` remains a useful reference/base candidate for later editor functions such as interactive wall editing, plan import, measurements, saved layouts and GLB/glTF export.

## Next refinement milestones

1. Replace concept wall geometry with the exact final dimensioned ~200 m² architectural plan.
2. Match the final Domprojekt exterior elevations and roof geometry exactly.
3. Replace procedural surfaces with exact selected Croatian product PBR textures/material properties.
4. Replace approximate furniture/sanitaryware with exact-dimension selected products or licensed GLB assets.
5. Add true wheelchair swept-path, transfer-space and door-clearance validation.
6. Add HDR environment lighting and higher-detail licensed/CC0 vegetation and furniture models.
7. Add optional VR/WebXR mode and exportable cinematic camera paths.
