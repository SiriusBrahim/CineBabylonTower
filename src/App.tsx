import { useMemo, useState } from "react";
import BabelTowerArchitecture, { TIER_ACCENT_COLORS } from "./components/BabelTowerArchitecture";
import { sampleContent } from "./data/sampleContent";
import { calculateBabelTower } from "./engine/towerGeometry";
import { TOWER_TIERS, type TowerContent, type TowerTierConfig } from "./types/content";

type FillMode = "sample" | "half" | "nearly_full";

export default function App() {
  const [selectedTier, setSelectedTier] = useState<TowerTierConfig>(TOWER_TIERS[0]);
  const [fillMode, setFillMode] = useState<FillMode>("sample");
  const [focusedFloor, setFocusedFloor] = useState<number | null>(null);
  const [controlsOpen, setControlsOpen] = useState(true);

  const orderedSample = useMemo(
    () => [...sampleContent].sort((a, b) => Number(b.status === "watched") - Number(a.status === "watched")),
    []
  );

  const { watchedCount, watchlistCount, contentForTier } = useMemo(() => {
    if (fillMode === "sample") {
      const watched = orderedSample.filter((item) => item.status === "watched").length;
      const watchlist = orderedSample.length - watched;
      return { watchedCount: watched, watchlistCount: watchlist, contentForTier: orderedSample };
    }

    const totalFilled =
      fillMode === "half"
        ? Math.floor(selectedTier.targetTotal * 0.45)
        : Math.floor(selectedTier.targetTotal * 0.85);
    const watched = Math.floor(totalFilled * 0.68);
    const watchlist = totalFilled - watched;

    const generated: TowerContent[] = Array.from({ length: totalFilled }, (_, i) => {
      const sample = orderedSample[i];
      if (sample) {
        return { ...sample, status: i < watched ? "watched" : "watchlist" };
      }
      return {
        id: `slot-${i + 1}`,
        title: `Arşiv Yapısı #${i + 1}`,
        mediaType: i % 3 === 0 ? "tv" : "movie",
        status: i < watched ? "watched" : "watchlist",
        releaseYear: 1995 + (i % 30)
      };
    });

    return { watchedCount: watched, watchlistCount: watchlist, contentForTier: generated };
  }, [fillMode, orderedSample, selectedTier.targetTotal]);

  const build = useMemo(
    () => calculateBabelTower(selectedTier, watchedCount, watchlistCount),
    [selectedTier, watchedCount, watchlistCount]
  );

  const blueprintCount = Math.max(0, build.targetTotal - (watchedCount + watchlistCount));

  function handleSelectTier(tier: TowerTierConfig) {
    setSelectedTier(tier);
    setFocusedFloor(null);
  }

  return (
    <div className="sandbox-shell">
      <div className="tier-bar" role="tablist" aria-label="Kule klasman seçimi">
        {TOWER_TIERS.map((tier) => (
          <button
            key={tier.id}
            type="button"
            role="tab"
            aria-selected={selectedTier.id === tier.id}
            onClick={() => handleSelectTier(tier)}
            className={selectedTier.id === tier.id ? "tier-tab active" : "tier-tab"}
          >
            <span className="tier-accent" style={{ backgroundColor: TIER_ACCENT_COLORS[tier.id] }} />
            {tier.name} ({tier.targetTotal.toLocaleString("tr-TR")})
          </button>
        ))}
      </div>

      <BabelTowerArchitecture
        build={build}
        content={contentForTier}
        focusedFloor={focusedFloor}
        onSelectFloor={(floorIdx) => setFocusedFloor(floorIdx)}
        onClearFocus={() => setFocusedFloor(null)}
      />

      <div className={controlsOpen ? "bottom-dock" : "bottom-dock collapsed"}>
        <button
          type="button"
          className="dock-toggle"
          onClick={() => setControlsOpen((open) => !open)}
        >
          {controlsOpen ? "▾ Kontrolleri Gizle" : "▴ Kontrolleri Göster"}
        </button>

        {controlsOpen && (
          <div className="dock-panel">
            <div className="legend-group">
              <span className="legend-chip">
                <i className="swatch watched" />
                İzlenen <b>{watchedCount}</b>
              </span>
              <span className="legend-chip">
                <i className="swatch watchlist" />
                Listedeki <b>{watchlistCount}</b>
              </span>
              <span className="legend-chip">
                <i className="swatch blueprint" />
                Blueprint <b>{blueprintCount}</b>
              </span>
            </div>

            <div className="dock-actions">
              <div className="preset-group" role="group" aria-label="Doluluk simülasyonu">
                <button
                  type="button"
                  className={fillMode === "sample" ? "mini-btn active" : "mini-btn"}
                  onClick={() => setFillMode("sample")}
                >
                  Demo (24)
                </button>
                <button
                  type="button"
                  className={fillMode === "half" ? "mini-btn active" : "mini-btn"}
                  onClick={() => setFillMode("half")}
                >
                  %45 Dolu
                </button>
                <button
                  type="button"
                  className={fillMode === "nearly_full" ? "mini-btn active" : "mini-btn"}
                  onClick={() => setFillMode("nearly_full")}
                >
                  %85 Dolu
                </button>
              </div>

              {focusedFloor !== null && (
                <button
                  type="button"
                  className="mini-btn reset-btn"
                  onClick={() => setFocusedFloor(null)}
                >
                  Kat {focusedFloor + 1} · Görünümü Sıfırla
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}