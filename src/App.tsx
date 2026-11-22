import { useMemo, useState } from "react";
import TowerScene from "./components/TowerScene";
import { sampleContent } from "./data/sampleContent";
import { buildTowerForContent } from "./engine/towerGeometry";
import type { ContentStatus, TowerContent } from "./types/content";

export default function App() {
  const [content, setContent] = useState<TowerContent[]>(sampleContent);
  const watchedCount = content.filter(item => item.status === "watched").length;
  const watchlistCount = content.length - watchedCount;
  const towerOrder = useMemo(
    () => [...content].sort((a, b) => Number(b.status === "watched") - Number(a.status === "watched")),
    [content]
  );
  const build = useMemo(() => buildTowerForContent(watchedCount, watchlistCount), [watchedCount, watchlistCount]);
  const progress = Math.min(100, (content.length / build.targetTotal) * 100);

  function toggleStatus(id: string, status: ContentStatus) {
    setContent(items => items.map(item => item.id === id ? { ...item, status } : item));
  }

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">C</span><span>CINE<span className="brand-light">BABYLON</span></span></a>
      <div className="topbar-meta"><span className="live-dot" /> 3D TOWER ENGINE <span className="version">PREVIEW 0.1</span></div>
    </header>
    <section className="intro">
      <div><p className="eyebrow">YOUR STORY, BUILT IN SPACE</p><h1>Her izleme bir <em>katman.</em></h1><p className="subtitle">İzlediğin filmler temelin. Sıradaki keşiflerin göğe uzanan iskelen.</p></div>
      <div className="tier-chip"><span className="tier-gem">◇</span><div><small>AKTİF KLASMAN</small><strong>{build.tier.name}</strong></div></div>
    </section>
    <section className="stats">
      <article><span>İZLENEN</span><strong>{watchedCount.toLocaleString("tr-TR")}</strong><small>Temel posterleri</small></article>
      <article><span>İZLENECEK</span><strong>{watchlistCount.toLocaleString("tr-TR")}</strong><small>Yükselen iskele</small></article>
      <article><span>KULE KAPASİTESİ</span><strong>{build.targetTotal.toLocaleString("tr-TR")}</strong><small>{build.tier.name}</small></article>
      <article><span>ZİRVE BAYRAĞI</span><strong>{build.flagCount.toLocaleString("tr-TR")}</strong><small>Taç posterleri</small></article>
    </section>
    <section className="tower-panel">
      <div className="panel-heading"><div><p className="eyebrow">INTERACTIVE 3D MODEL</p><h2>Babylon Tower</h2></div><span className="drag-hint">↻ Sürükle · Yakınlaştır · İncele</span></div>
      <div className="scene-wrap"><TowerScene build={build} content={towerOrder} /><div className="scene-label"><span className="legend watched" /> İzlenen <span className="legend planned" /> İzlenecek <span className="legend ghost" /> Potansiyel</div></div>
      <div className="progress-row"><div><span>KULE İNŞA İLERLEMESİ</span><strong>{content.length} / {build.targetTotal}</strong></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div>
    </section>
    <section className="library">
      <div className="library-heading"><div><p className="eyebrow">TOWER CONTENT</p><h2>Kule arşivi</h2></div><span>{content.length} içerik</span></div>
      <div className="content-list">{content.map(item => <article className="content-row" key={item.id}><div className={`mini-poster ${item.status}`}>{item.mediaType === "movie" ? "FILM" : "DİZİ"}</div><div className="content-info"><strong>{item.title}</strong><small>{item.releaseYear ?? "—"} · {item.mediaType === "movie" ? "Film" : "Dizi"}</small></div><button className={item.status === "watched" ? "status-button watched-button" : "status-button"} onClick={() => toggleStatus(item.id, item.status === "watched" ? "watchlist" : "watched")}>{item.status === "watched" ? "İzlendi" : "İzlenecek"}</button></article>)}</div>
    </section>
    <footer> CINEBABYLON TOWER <span>·</span> GEOMETRY FIRST, STORIES FOREVER</footer>
  </main>;
}