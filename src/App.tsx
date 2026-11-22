import { useMemo, useState } from "react";
import BabelTowerArchitecture, { ARCHITECTURE_TIERS, type ArchitectureTier } from "./components/BabelTowerArchitecture";

function getBodySlotCount(tier: ArchitectureTier) {
  let total = 0;
  for (let units = tier.baseUnits; units >= tier.topUnits; units--) total += tier.segments * units;
  return total;
}

export default function App() {
  const [tierId, setTierId] = useState<ArchitectureTier["id"]>("bronze");
  const tier = useMemo(() => ARCHITECTURE_TIERS.find(item => item.id === tierId) ?? ARCHITECTURE_TIERS[0], [tierId]);
  const bodySlots = getBodySlotCount(tier);
  const crownSlots = tier.targetTotal - bodySlots;

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">C</span><span>CINE<span className="brand-light">BABYLON</span></span></a>
      <div className="topbar-meta"><span className="live-dot" /> POSTER SLOT BLUEPRINT <span className="version">PREVIEW 0.2</span></div>
    </header>

    <section className="intro">
      <div>
        <p className="eyebrow">EMPTY SLOTS · TOWER GEOMETRY</p>
        <h1>Bir kule, binlerce <em>hikâye yuvası.</em></h1>
        <p className="subtitle">Şimdilik yalnızca boş poster yuvalarını ve kule geometrisini inceliyoruz. İçerik, afiş ve başlık gösterilmez.</p>
      </div>
      <div className="tier-chip"><span className="tier-gem">◇</span><div><small>SEÇİLİ KULE</small><strong>{tier.name}</strong></div></div>
    </section>

    <nav className="tier-selector" aria-label="Kule türü">
      {ARCHITECTURE_TIERS.map(item => <button
        key={item.id}
        type="button"
        className={item.id === tier.id ? "tier-option active" : "tier-option"}
        onClick={() => setTierId(item.id)}
        aria-pressed={item.id === tier.id}
      >{item.name}</button>)}
    </nav>

    <section className="stats">
      <article><span>TOPLAM YUVA</span><strong>{tier.targetTotal.toLocaleString("tr-TR")}</strong><small>Seçili kule kapasitesi</small></article>
      <article><span>GÖVDE YUVASI</span><strong>{bodySlots.toLocaleString("tr-TR")}</strong><small>Katlara dağıtılmış</small></article>
      <article><span>ÜST BÖLÜM YUVASI</span><strong>{crownSlots.toLocaleString("tr-TR")}</strong><small>Yerleşimi sonra değerlendirilecek</small></article>
      <article><span>KAT SAYISI</span><strong>{tier.baseUnits - tier.topUnits + 1}</strong><small>Gövde katmanı</small></article>
    </section>

    <section className="tower-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">INTERACTIVE 3D MODEL</p><h2>{tier.name}</h2></div>
        <span className="drag-hint">↻ Sürükle · Yakınlaştır · İncele</span>
      </div>
      <div className="scene-wrap"><BabelTowerArchitecture tier={tier} /></div>
      <div className="progress-row"><div><span>BOŞ POSTER YUVALARI</span><strong>{tier.targetTotal.toLocaleString("tr-TR")} adet</strong></div><div className="progress-track"><i style={{ width: "100%" }} /></div></div>
    </section>

    <footer>CINEBABYLON TOWER <span>·</span> EMPTY SLOTS FIRST</footer>
  </main>;
}
