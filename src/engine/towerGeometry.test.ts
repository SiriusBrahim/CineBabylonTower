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

  it("creates one continuous walkway ring for every body floor", () => {
    const result = calculateBabelTower(TOWER_TIERS[0], 20, 10);
    expect(result.walkways).toHaveLength(getBodyFloorCapacities(TOWER_TIERS[0]).length);
    expect(result.walkways.every(ring => ring.innerRadius > 0 && ring.outerRadius > ring.innerRadius)).toBe(true);
    expect(result.walkways.map(ring => ring.floorIndex)).toEqual([0, 1, 2]);
  });

  it("keeps every poster on a floor at the same height and steps floors upward", () => {
    const result = calculateBabelTower(TOWER_TIERS[0], 20, 10);
    const bodyNodes = result.nodes.filter(node => !node.isFlag);
    for (let floorIndex = 0; floorIndex < result.walkways.length; floorIndex++) {
      const heights = bodyNodes.filter(node => node.floorIndex === floorIndex).map(node => node.position[1]);
      expect(new Set(heights).size).toBe(1);
      if (floorIndex > 0) {
        const previousHeight = bodyNodes.find(node => node.floorIndex === floorIndex - 1)!.position[1];
        expect(heights[0]).toBeGreaterThan(previousHeight);
      }
    }
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