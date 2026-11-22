import { useState } from "react";
import BabelTowerArchitecture, { ARCHITECTURE_TIERS } from "./components/BabelTowerArchitecture";

export default function App() {
  const [selectedTier, setSelectedTier] = useState(ARCHITECTURE_TIERS[0]);
  return <main className="architecture-app">
    <header className="architecture-header">
      <a className="brand" href="#"><span className="brand-mark">C</span><span>CINE<span className="brand-light">BABYLON</span></span></a>
      <span className="mode-label"><i /> ARCHITECTURE LAB · NO CONTENT DATA</span>
    </header>
    <nav className="tier-switcher" aria-label="Kule klasmanı">
      {ARCHITECTURE_TIERS.map(tier => <button key={tier.id} className={selectedTier.id === tier.id ? "active" : ""} onClick={() => setSelectedTier(tier)}>
        <span className="tier-dot" style={{ background: tier.accentColor }} />{tier.name}<small>{tier.targetTotal.toLocaleString("tr-TR")}</small>
      </button>)}
    </nav>
    <section className="architecture-heading">
      <div><p>FORM STUDY / 01</p><h1>{selectedTier.name}<em> mimari maketi</em></h1><span>Gövde · Helisel merdiven · Kolonlar · Teraslar · Zirve tacı</span></div>
      <div className="architecture-note">SAF 3D MİMARİ<br/><b>Poster ve kullanıcı verisi yok</b></div>
    </section>
    <section className="viewport"><BabelTowerArchitecture tier={selectedTier} /><div className="viewport-hint">SÜRÜKLE: DÖNDÜR <span>·</span> TEKERLEK: YAKINLAŞTIR <span>·</span> SAĞ TIK: KAYDIR</div></section>
    <section className="spec-strip">
      <div><small>SEGMENT / KOLON</small><b>{selectedTier.segments}</b></div>
      <div><small>TABAN BİRİMİ</small><b>{selectedTier.baseUnits}</b></div>
      <div><small>TEPE BİRİMİ</small><b>{selectedTier.topUnits}</b></div>
      <div><small>HEDEF YUVA</small><b>{selectedTier.targetTotal.toLocaleString("tr-TR")}</b></div>
    </section>
    <footer>CINEBABYLON TOWER <span>·</span> ARCHITECTURE BEFORE CONTENT</footer>
  </main>;
}