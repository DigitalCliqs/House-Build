# Anamarija EuroMax Digital Twin

Interactive browser-based first-person walkthrough of the planned accessible premium ~200 m² EuroMax house near Velika Gorica, Croatia.

## Current finished-concept scene

The current build now renders the house as a finished residential concept rather than a bare spatial prototype. It includes:

- single-storey accessible layout based on the enlarged Anamarija concept
- EuroMax/low-energy design intent
- 2.8 m private-area ceilings, ~3.05 m principal ceilings and a higher/vaulted living zone
- tall architectural door openings
- large floor-to-ceiling/panoramic glazing
- white Calacatta-style marble-look porcelain through the main circulation and living areas
- oak herringbone-style flooring in bedrooms and office
- built-in central storage wall
- fitted modern kitchen with island and a lower accessible work section
- furnished living/dining spaces
- furnished bedrooms and office
- accessible bedroom with extra circulation space
- accessible wet-room bathroom with roll-in shower concept and grab rail
- ensuite and guest WC
- recessed lighting, pendant lighting, warm architectural/mood lighting and day/night simulation
- walking and wheelchair camera modes
- optional 1.50 m wheelchair turning-circle overlay
- flush terrace and pergola/outdoor lounge
- landscaped ~1,200 m² concept plot
- driveway and level approach path
- planted borders, boundary hedging and trees
- 8 × 4 m pool, paved pool deck and electric slatted-cover visualisation
- outdoor shower and sun loungers
- room/garden teleport controls for quick inspection

## Run locally

Because the project uses JavaScript modules, serve the repository through a local web server rather than double-clicking `index.html`.

For example, with Python installed:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

A VS Code Live Server session also works.

## Controls

- `WASD` or arrow keys — move
- mouse — look around after entering first-person mode
- `Shift` — move faster
- `Esc` — release mouse lock
- Profile selector — switch between walking and wheelchair camera/movement envelope
- Turn circle selector — display a 1.50 m accessibility checking circle
- Go to / Quick views — jump directly to principal rooms, terrace, pool or garden
- Time slider — inspect the property at different times of day
- Lighting selector — force day/evening/night lighting presets
- Pool cover selector — show the automatic slatted pool cover open or closed

## Important design status

This is a **visual digital twin / design-development model**, not a certified architectural, structural, fire-safety or accessibility construction drawing. The geometry is being refined from the design brief and renders. Final wall positions, structural spans, glazing sizes, door clear openings, MEP zones and furniture clearances must be updated from the final dimensioned architectural drawings before construction decisions are made.

The project is intentionally data-driven: core dimensions and room zones are kept in `src/house-config.js` so the walkthrough can be updated as the Domprojekt/architect plan develops.

## Technical stack

- Three.js
- browser-native ES modules
- PointerLockControls for first-person navigation
- procedural materials for marble, oak and landscape surfaces
- no backend required

The open-source `ch-bas/threejs-sims-house-builder` (MIT) remains a reference/base candidate for later editor features such as interactive wall editing, richer plan import, measurements, saved layouts and glTF/GLB export.

## Next refinement milestones

1. Replace concept wall geometry with the exact final dimensioned 200 m² floor plan.
2. Match the final exterior elevations/roof geometry from Domprojekt.
3. Replace procedural finishes with exact selected Croatian product textures/material properties.
4. Add proper animated doors and motorised exterior blinds.
5. Add realistic pool-cover animation and pool plant/technical area.
6. Add exact sanitaryware, kitchen, lighting and furniture dimensions.
7. Add wheelchair swept-path and door-clearance validation rather than camera-radius checking alone.
8. Add photorealistic HDR environment/PBR assets where licensing permits.
