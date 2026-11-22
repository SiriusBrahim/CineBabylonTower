import type { TowerContent } from "../types/content";

const titles = [
  "Interstellar", "Blade Runner 2049", "Arrival", "The Matrix", "Inception", "Ex Machina",
  "Dune", "The Martian", "Her", "Moon", "Annihilation", "District 9",
  "Dark", "Severance", "Black Mirror", "The Expanse", "Foundation", "Devs",
  "Children of Men", "Looper", "Upgrade", "Gravity", "Snowpiercer", "Westworld"
];

export const sampleContent: TowerContent[] = titles.map((title, index) => ({
  id: `demo-${index + 1}`,
  title,
  mediaType: index % 3 === 0 ? "tv" : "movie",
  status: index < 14 ? "watched" : "watchlist",
  releaseYear: 2000 + (index * 3) % 25
}));