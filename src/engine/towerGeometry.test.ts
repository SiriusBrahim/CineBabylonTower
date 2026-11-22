import { describe, expect, it } from "vitest";
import { calculateBabelTower, getActiveTier, getBodyFloorCapacities } from "./towerGeometry";
import { TOWER_TIERS } from "../types/content";

describe("tower geometry", () => {
  it("creates the documented body capacities for every standard tier", () => {
    expect(TOWER_TIERS.map(t => getBodyFloorCapacities(t).reduce((a, b) => a + b, 0))).toEqual([99, 364, 825, 1530]);
  });
  it("builds 72 items in bronze tier with 45 watched and 27 planned", () => {
    const result = calculateBabelTower(getActiveTier(72), 45, 27);
    expect(result.tier.id).toBe("bronze");
    expect(result.nodes).toHaveLength(100);
    expect(result.nodes.slice(0, 45).every(n => n.isWatched && !n.isBlueprint)).toBe(true);
    expect(result.nodes.slice(45, 72).every(n => !n.isWatched && !n.isBlueprint)).toBe(true);
    expect(result.nodes.slice(72).every(n => n.isBlueprint)).toBe(true);
    expect(result.flagCount).toBe(1);
  });
  it("creates multiple crown rings for gold tier", () => {
    const result = calculateBabelTower(TOWER_TIERS[2], 400, 100);
    expect(result.flagCount).toBe(10);
    expect(result.nodes.filter(n => n.isFlag)).toHaveLength(10);
    expect(result.totalFloors).toBeGreaterThan(11);
  });
  it("scales beyond premium", () => {
    expect(getActiveTier(1551).targetTotal).toBe(2550);
  });
  it("rejects invalid counts", () => {
    expect(() => calculateBabelTower(TOWER_TIERS[0], -1, 2)).toThrow(RangeError);
  });
});