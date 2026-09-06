# V12 photoreal tour asset specification

The previous realtime Three.js prototype remains for layout/reference only. V12 uses finished architectural renders as the presentation layer.

## Required scene set

Publish one finished render for each filename below under `assets/tour-v12/`:

- `exterior-front.webp`
- `entrance.webp`
- `hallway.webp`
- `living.webp`
- `dining.webp`
- `kitchen.webp`
- `office.webp`
- `accessible-bedroom.webp`
- `accessible-bathroom.webp`
- `master-bedroom.webp`
- `ensuite.webp`
- `guest-bedroom.webp`
- `terrace.webp`
- `pool.webp`
- `garden-front.webp`
- `garden-rear.webp`
- `floorplan.webp`

## Visual acceptance bar

Use the user's uploaded Domprojekt Anamarija board as the benchmark, not the procedural V4-V11 browser render. Every scene should show architectural-visualisation quality: realistic global illumination, physically plausible reflections and glazing, soft indirect light/contact shadows, detailed joinery, real furniture/fixture geometry, convincing vegetation, high-resolution PBR surfaces, balanced exposure and photographic depth.

Design intent for this adapted house: approximately 200 m² enclosed gross area; articulated multi-pitch Anamarija-style roof; premium warm-white / oak / Calacatta palette; oak herringbone bedrooms and office; marble-look main circulation/living/kitchen/bathrooms; 2.8–3.0 m typical ceilings with the living zone rising toward ~4.0 m; wide wheelchair circulation; accessible bedroom and wet room; premium open kitchen/dining/living area; terrace/pergola; 8 × 4 m pool; landscaped ~1,200 m² plot.

## Output format

For a true look-around tour, preferred source is 2:1 equirectangular panorama, ideally 8192 × 4096 master. Publish responsive WebP versions around 4096 × 2048 for desktop and 3072 × 1536 for mobile. If an initial proof is rendered as conventional perspective views, V12 can display them with parallax pan/zoom, but those are an interim stage and must not be described as 360° panoramas.

## Accessibility

Keep principal navigation points and door approaches visible and understandable in renders. Do not place decorative furniture within intended 1.5 m turning areas or 0.9–1.2 m approach/circulation zones. Final compliance still depends on architect-dimensioned drawings rather than concept render coordinates.
