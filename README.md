# Anamarija EuroMax Digital Twin

Interactive browser-based first-person walkthrough of the planned accessible premium ~200 m² EuroMax house near Velika Gorica, Croatia.

## Current finished-concept scene — v2

The current build renders the house and yard as a finished residential concept rather than a bare spatial prototype. It includes:

- single-storey accessible layout based on the enlarged Anamarija concept
- EuroMax/low-energy design intent
- 2.8 m private-area ceilings, ~3.05 m principal ceilings and a ~4.1 m raised living zone
- tall architectural door openings
- large floor-to-ceiling/panoramic glazing
- white Calacatta-style marble-look porcelain through the main circulation and living areas
- oak herringbone-style flooring in bedrooms and office
- built-in central storage wall
- fitted modern kitchen with island
- furnished living/dining spaces, bedrooms and office
- accessible bedroom with extra circulation space
- accessible wet-room bathroom with roll-in shower concept and grab rails
- recessed, pendant and warm architectural/mood lighting
- animated day/evening/night atmosphere
- walking and wheelchair camera modes
- optional 1.50 m wheelchair turning-circle overlay
- flush terrace, pergola and outdoor lounge
- landscaped ~1,200 m² concept plot with driveway, level paths, hedging, planting and trees
- 8 × 4 m pool, paved deck and animated electric slatted-cover visualisation
- outdoor shower / pool-lift provision zone
- room/garden teleport controls
- animated tall internal/front doors
- animated motorised-blind visualisation on principal panoramic glazing

## Run locally

Because the project uses JavaScript modules, serve the repository through a local web server rather than double-clicking `index.html`.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. VS Code Live Server also works.

## Controls

- `WASD` — move
- mouse — look around after entering first-person mode
- `Shift` — move faster
- `Esc` — release mouse lock
- Profile — walking or wheelchair camera/movement envelope
- Turn circle — display a 1.50 m accessibility checking circle
- Go to / Quick views — jump to principal rooms, terrace, pool or garden
- Time — inspect the property through the day/night cycle
- Lighting — force bright-day, evening-mood or night settings
- Doors — animate all doors open/closed
- Blinds — animate principal motorised blinds open/closed
- Pool cover — animate the electric slatted pool cover open/closed
- Double-click a nearby door — toggle that door individually

## Important design status

This is a **visual digital twin / design-development model**, not a certified architectural, structural, fire-safety or accessibility construction drawing. Final wall positions, structural spans, glazing sizes, door clear openings, MEP zones and furniture clearances still need to be replaced with the final dimensioned Domprojekt/architect drawings before construction decisions are made.

Core dimensions and room zones remain in `src/house-config.js`; the current finished viewer is `src/viewer-v2.js`.

## Technical stack

- Three.js
- browser-native ES modules
- PointerLockControls
- procedural Calacatta-style marble, oak herringbone and landscaping materials
- ACES filmic tone mapping
- dynamic sun, practical lighting and interactive architectural elements
- no backend required

The MIT-licensed `ch-bas/threejs-sims-house-builder` remains a useful reference/base candidate for later editor functions such as interactive wall editing, plan import, measurements, saved layouts and GLB/glTF export.

## Next refinement milestones

1. Replace the current concept wall geometry with the exact final dimensioned ~200 m² plan.
2. Match final exterior elevations and roof geometry from Domprojekt.
3. Replace procedural finishes with exact selected Croatian product textures/material properties.
4. Replace approximate furniture/sanitaryware with exact-dimension selected products.
5. Add a true wheelchair swept-path, transfer-space and door-clearance validator.
6. Add HDR/PBR environment assets and higher-detail vegetation where licensing permits.
7. Add optional VR/WebXR mode and exportable camera paths for presentation video.
