# Cine Babylon Tower

A standalone 3D poster-tower prototype. The geometry engine is independent from the rendering layer and future Cinethos integration.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```

## Checks
```bash
npm test
npm run build
```

## Core model
- Watched items occupy indices from the foundation upward and render in full colour.
- Watchlist items follow watched items and render muted/translucent.
- Remaining tier capacity is represented by blueprint/ghost poster slots.
- Standard tiers: Bronze (100), Silver (365), Gold (835), Premium (1550).
- Each body level is a horizontal poster ring with a matching continuous annular walkway.
- The geometry engine returns both poster nodes and walkway dimensions; it does not create Three.js objects.
- Poster records may provide `posterUrl`; a generated poster remains the fallback.
- Geometry is calculated in `src/engine/towerGeometry.ts`; React Three Fiber renders the returned nodes and walkway data.

## Architecture
- `src/types`: domain types and tier configuration.
- `src/engine`: deterministic, renderer-independent coordinate calculations.
- `src/components`: Three.js scene components.
- `src/data`: demo data only; no external API or persistence is assumed.

## Integration boundary
Cinethos (or another host app) should map its own records into `TowerContent[]`. The tower engine does not own authentication, networking, database access, or watch-history persistence.
