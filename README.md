# Anamarija EuroMax Digital Twin

Interactive browser-based digital twin for the planned accessible ~200 m² EuroMax house near Velika Gorica, Croatia.

## Goals

- First-person 3D walkthrough
- Walking and wheelchair navigation modes
- Accurate room, wall, door and window dimensions as the design is finalised
- High ceilings and panoramic glazing
- Accessible circulation and 1.5 m turning-circle checks
- Marble-look and oak herringbone finishes
- Day/night and architectural mood lighting
- Terrace, landscaping and 8 × 4 m pool with automatic cover
- Eventually support real product/furniture dimensions and materials

## Development approach

The project will use Three.js in the browser. The open-source `ch-bas/threejs-sims-house-builder` (MIT) is being used as an architectural reference/base candidate because it already provides first-person walkthrough, floor-plan import, walls/openings, measurements, time-of-day lighting, JSON persistence and glTF/GLB export.

## Status

Repository initialised. Next milestone: commit the digital-twin engine and current concept layout, then replace concept geometry with the dimensioned final floor plan.
