# Geometry notes

## Standard capacities
The body is built from `baseUnits` down through `topUnits`, inclusive. Each floor capacity is `segments * units`.

| Tier | Floor capacities | Body | Crown |
|---|---:|---:|---:|
| Bronze | 36, 33, 30 | 99 | 1 |
| Silver | 64, 60, 56, 52, 48, 44, 40 | 364 | 1 |
| Gold | 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50 | 825 | 10 |
| Premium | 144 down to 60, step 6 | 1530 | 20 |

Poster slots are placed around each floor circumference. Radius is derived from circumference and poster pitch. A half-segment phase offset rotates each successive floor to reduce aligned seams. Crown slots form progressively smaller rings.

## State mapping
For node index `i`:
- watched iff `i < watchedCount`
- blueprint iff `i >= watchedCount + watchlistCount`
- otherwise it is a planned/watchlist poster.

The ordering is deliberate: watched content is always the foundation.
