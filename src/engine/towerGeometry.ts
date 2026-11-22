import {
  DEFAULT_TOWER_METRICS,
  TOWER_TIERS,
  type PosterNode3D,
  type TowerBuildResult,
  type TowerMetrics,
  type TowerTierConfig
} from "../types/content";

function assertValidInputs(tier: TowerTierConfig, watchedCount: number, watchlistCount: number, metrics: TowerMetrics) {
  if (!Number.isInteger(tier.targetTotal) || tier.targetTotal < 1) throw new RangeError("targetTotal pozitif bir tam sayı olmalı.");
  if (!Number.isInteger(tier.segments) || tier.segments < 1) throw new RangeError("segments en az 1 olmalı.");
  if (!Number.isInteger(tier.baseUnits) || !Number.isInteger(tier.topUnits) || tier.baseUnits < tier.topUnits || tier.topUnits < 1) {
    throw new RangeError("baseUnits ve topUnits geçerli, azalan bir kat aralığı oluşturmalı.");
  }
  if (!Number.isInteger(watchedCount) || !Number.isInteger(watchlistCount) || watchedCount < 0 || watchlistCount < 0) {
    throw new RangeError("İçerik adetleri negatif olmayan tam sayılar olmalı.");
  }
  if ([metrics.posterWidth, metrics.posterHeight, metrics.horizontalGap, metrics.verticalGap].some(v => !Number.isFinite(v)) ||
      metrics.posterWidth <= 0 || metrics.posterHeight <= 0 || metrics.horizontalGap < 0 || metrics.verticalGap < 0) {
    throw new RangeError("Poster ölçüleri pozitif, boşluklar negatif olmayan sayılar olmalı.");
  }
}

export function getBodyFloorCapacities(tier: TowerTierConfig): number[] {
  const capacities: number[] = [];
  for (let units = tier.baseUnits; units >= tier.topUnits; units--) capacities.push(tier.segments * units);
  return capacities;
}

export function calculateBabelTower(
  tier: TowerTierConfig,
  watchedCount: number,
  watchlistCount: number,
  metrics: TowerMetrics = DEFAULT_TOWER_METRICS
): TowerBuildResult {
  assertValidInputs(tier, watchedCount, watchlistCount, metrics);

  const nodes: PosterNode3D[] = [];
  const floorHeight = metrics.posterHeight + metrics.verticalGap;
  const unitArcLength = metrics.posterWidth + metrics.horizontalGap;
  const totalUserItems = watchedCount + watchlistCount;
  const floorCapacities = getBodyFloorCapacities(tier);
  const bodyCapacity = floorCapacities.reduce((sum, cap) => sum + cap, 0);
  const flagCount = Math.max(0, tier.targetTotal - bodyCapacity);
  const baseRadius = (floorCapacities[0] * unitArcLength) / (2 * Math.PI);
  let currentIndex = 0;

  const makeNode = (index: number, position: [number, number, number], rotation: [number, number, number], floorIndex: number, isFlag: boolean): PosterNode3D => ({
    index, position, rotation, floorIndex, isFlag,
    isWatched: index < watchedCount,
    isBlueprint: index >= totalUserItems
  });

  floorCapacities.forEach((capacity, floorIdx) => {
    const radius = (capacity * unitArcLength) / (2 * Math.PI);
    const floorAngleOffset = (floorIdx * Math.PI) / tier.segments;
    for (let slot = 0; slot < capacity && currentIndex < tier.targetTotal; slot++) {
      const progressInFloor = slot / capacity;
      const theta = progressInFloor * Math.PI * 2 + floorAngleOffset;
      const y = (floorIdx + progressInFloor) * floorHeight + metrics.posterHeight / 2;
      nodes.push(makeNode(
        currentIndex,
        [radius * Math.cos(theta), y, radius * Math.sin(theta)],
        [0, -theta + Math.PI / 2, 0],
        floorIdx,
        false
      ));
      currentIndex++;
    }
  });

  const bodyTopY = floorCapacities.length * floorHeight;
  const topBodyRadius = (floorCapacities[floorCapacities.length - 1] * unitArcLength) / (2 * Math.PI);

  if (flagCount === 1) {
    nodes.push(makeNode(
      currentIndex,
      [0, bodyTopY + metrics.posterHeight * 0.75, 0],
      [0, 0, 0],
      floorCapacities.length,
      true
    ));
  } else if (flagCount > 1) {
    const crownCapacity = Math.min(flagCount, Math.max(tier.segments, 5));
    const crownRadius = Math.max(
      metrics.posterWidth * 0.85,
      Math.min(topBodyRadius * 0.55, (crownCapacity * unitArcLength) / (2 * Math.PI))
    );
    for (let f = 0; f < flagCount; f++) {
      const subFloor = Math.floor(f / crownCapacity);
      const slotInCrown = f % crownCapacity;
      const itemsInThisRing = Math.min(crownCapacity, flagCount - subFloor * crownCapacity);
      const theta = (slotInCrown / itemsInThisRing) * Math.PI * 2 + subFloor * 0.4;
      const ringRadius = crownRadius * Math.pow(0.85, subFloor);
      const x = ringRadius * Math.cos(theta);
      const z = ringRadius * Math.sin(theta);
      const y = bodyTopY + subFloor * floorHeight + metrics.posterHeight * 0.6;
      nodes.push(makeNode(currentIndex, [x, y, z], [0, -theta + Math.PI / 2, 0], floorCapacities.length + subFloor, true));
      currentIndex++;
    }
  }

  const maxHeight = nodes.reduce((max, node) => Math.max(max, node.position[1] + metrics.posterHeight / 2), floorHeight);
  const crownFloors = flagCount > 1 ? Math.ceil(flagCount / Math.min(flagCount, Math.max(tier.segments, 5))) : flagCount;
  return {
    tier, nodes, bodyCapacity, flagCount,
    totalFloors: floorCapacities.length + crownFloors,
    maxHeight, baseRadius, watchedCount, watchlistCount, targetTotal: tier.targetTotal
  };
}

export function getActiveTier(totalUserItems: number): TowerTierConfig {
  if (!Number.isInteger(totalUserItems) || totalUserItems < 0) throw new RangeError("totalUserItems negatif olmayan bir tam sayı olmalı.");
  const tier = TOWER_TIERS.find(item => totalUserItems <= item.targetTotal);
  if (tier) return { ...tier };
  const extraLevel = Math.ceil((totalUserItems - 1550) / 1000);
  return {
    id: "premium",
    name: `Efsanevi Kule Sv.${extraLevel}`,
    targetTotal: 1550 + extraLevel * 1000,
    segments: 6 + extraLevel,
    baseUnits: 24 + extraLevel * 4,
    topUnits: 10
  };
}

export function buildTowerForContent(watchedCount: number, watchlistCount: number, metrics?: TowerMetrics): TowerBuildResult {
  return calculateBabelTower(getActiveTier(watchedCount + watchlistCount), watchedCount, watchlistCount, metrics);
}