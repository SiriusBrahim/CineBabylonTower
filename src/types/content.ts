export type MediaType = "movie" | "tv";
export type ContentStatus = "watched" | "watchlist";

export interface TowerContent {
  id: string;
  title: string;
  mediaType: MediaType;
  status: ContentStatus;
  posterUrl?: string;
  releaseYear?: number;
  rating?: number;
}

export interface TowerTierConfig {
  id: "bronze" | "silver" | "gold" | "premium";
  name: string;
  targetTotal: number;
  segments: number;
  baseUnits: number;
  topUnits: number;
}

export interface TowerMetrics {
  posterWidth: number;
  posterHeight: number;
  horizontalGap: number;
  verticalGap: number;
}

export interface PosterNode3D {
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  floorIndex: number;
  isFlag: boolean;
  isWatched: boolean;
  isBlueprint: boolean;
}

export interface TowerWalkway3D {
  floorIndex: number;
  innerRadius: number;
  outerRadius: number;
  y: number;
}

export interface TowerBuildResult {
  tier: TowerTierConfig;
  nodes: PosterNode3D[];
  walkways: TowerWalkway3D[];
  bodyCapacity: number;
  flagCount: number;
  totalFloors: number;
  maxHeight: number;
  baseRadius: number;
  watchedCount: number;
  watchlistCount: number;
  targetTotal: number;
}

export const DEFAULT_TOWER_METRICS: TowerMetrics = {
  posterWidth: 1,
  posterHeight: 1.5,
  horizontalGap: 0.15,
  verticalGap: 0.25
};

export const TOWER_TIERS: TowerTierConfig[] = [
  { id: "bronze", name: "Bronz Kule", targetTotal: 100, segments: 3, baseUnits: 12, topUnits: 10 },
  { id: "silver", name: "Gümüş Kule", targetTotal: 368, segments: 4, baseUnits: 16, topUnits: 10 },
  { id: "gold", name: "Altın Kule", targetTotal: 833, segments: 5, baseUnits: 20, topUnits: 10 },
  { id: "premium", name: "Premium Kule", targetTotal: 1545, segments: 6, baseUnits: 24, topUnits: 10 }
];
