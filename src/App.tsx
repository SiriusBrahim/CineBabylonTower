import { useState } from "react";
import BabelTowerArchitecture, { TOWER_TIERS, type TowerTierConfig } from "./components/BabelTowerArchitecture";

export default function App() {
  const [selectedTier, setSelectedTier] = useState<TowerTierConfig>(TOWER_TIERS[0]);

  return (
    <div className="sandbox-shell">
      <div className="tier-bar" role="tablist" aria-label="Kule klasman seçimi">
        {TOWER_TIERS.map((tier) => (
          <button
            key={tier.id}
            type="button"
            role="tab"
            aria-selected={selectedTier.id === tier.id}
            onClick={() => setSelectedTier(tier)}
            className={selectedTier.id === tier.id ? "tier-tab active" : "tier-tab"}
          >
            <span className="tier-accent" style={{ backgroundColor: tier.accentColor }} />
            {tier.name}
          </button>
        ))}
      </div>

      <BabelTowerArchitecture tier={selectedTier} />
    </div>
  );
}