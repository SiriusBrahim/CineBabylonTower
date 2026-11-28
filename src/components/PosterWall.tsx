import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

const TOTAL_POSTERS = 100;
const HELIX_TURNS = 5;
const VIEW = { cx: 500, baseY: 824, rise: 670, radiusBottom: 390, radiusTop: 82, depth: 34 };

type Point = { x: number; y: number; depth: number; angle: number; radius: number };

function helixPoint(progress: number): Point {
  const u = Math.max(0, Math.min(1, progress));
  const theta = u * HELIX_TURNS * Math.PI * 2;
  const radius = VIEW.radiusBottom + (VIEW.radiusTop - VIEW.radiusBottom) * u;
  const x = VIEW.cx + Math.sin(theta) * radius;
  const y = VIEW.baseY - u * VIEW.rise - Math.cos(theta) * VIEW.depth;
  const dx = Math.cos(theta) * radius * HELIX_TURNS * Math.PI * 2 + Math.sin(theta) * (VIEW.radiusTop - VIEW.radiusBottom);
  const dy = -VIEW.rise + Math.sin(theta) * VIEW.depth * HELIX_TURNS * Math.PI * 2;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return { x, y, depth: (Math.cos(theta) + 1) / 2, angle, radius };
}

function routePath(front: boolean, limit = 1): string {
  const points: string[] = [];
  const samples = 900;
  let drawing = false;
  for (let i = 0; i <= Math.floor(samples * limit); i += 1) {
    const p = helixPoint(i / samples);
    const visible = front ? p.depth >= 0.5 : p.depth < 0.5;
    if (visible) {
      points.push(`${drawing ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      drawing = true;
    } else {
      drawing = false;
    }
  }
  return points.join(" ");
}

function TowerPoster({ index, watched, latest }: { index: number; watched: boolean; latest: boolean }) {
  const p = helixPoint(index / (TOTAL_POSTERS - 1));
  const perspective = 0.62 + p.depth * 0.38;
  const width = 39 * perspective;
  const height = 43 * (0.78 + p.depth * 0.22);
  const hue = (index * 19 + 28) % 360;
  const brightness = 0.48 + p.depth * 0.52;
  const opacity = 0.48 + p.depth * 0.52;
  const transform = `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${(p.angle * 0.22).toFixed(2)})`;

  return (
    <g
      className={`helix-poster ${watched ? "is-watched" : "is-empty"} ${latest ? "is-latest" : ""}`}
      transform={transform}
      style={{ opacity, filter: `brightness(${brightness})` }}
    >
      {watched && <rect x={-width / 2 - 8} y={-height / 2 - 7} width={width + 16} height={height + 14} rx="5" className="poster-halo" />}
      <rect x={-width / 2 - 3} y={-height / 2 - 4} width={width + 6} height={height + 8} rx="3" className="poster-stone-frame" />
      {watched ? (
        <g>
          <rect x={-width / 2} y={-height / 2} width={width} height={height} rx="1.5" fill={`url(#poster-${hue})`} stroke="#f7d9a1" strokeWidth="1" />
          <path d={`M ${-width / 2 + 2} ${-height / 2 + height * .62} Q 0 ${-height / 2 + height * .18} ${width / 2 - 2} ${-height / 2 + height * .55} V ${height / 2 - 2} H ${-width / 2 + 2}Z`} fill="rgba(13,18,27,.48)" />
          <circle cx="0" cy={-height * .08} r={Math.max(2, width * .1)} fill="#fff0c8" opacity=".9" />
          <path d={`M ${-width * .3} ${height * .32} H ${width * .3}`} stroke="#ffe7bd" strokeWidth="1" opacity=".85" />
        </g>
      ) : (
        <g className="poster-placeholder">
          <rect x={-width / 2} y={-height / 2} width={width} height={height} rx="1.5" />
          <path d={`M ${-width * .28} 0 H ${width * .28}`} />
          <path d={`M ${-width * .28} 9 H ${width * .28}`} />
        </g>
      )}
      <text x="0" y={height / 2 + 10} textAnchor="middle" className="poster-index">{String(index + 1).padStart(2, "0")}</text>
    </g>
  );
}

function StoneSupports() {
  const supports = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const y = 220 + i * 105;
    const half = 90 + i * 42;
    return { y, half };
  }), []);
  return (
    <g className="stone-supports">
      {supports.map(({ y, half }, i) => (
        <g key={i}>
          <path d={`M ${500 - half} ${y + 72} V ${y + 25} Q ${500 - half} ${y - 18} 500 ${y - 18} Q ${500 + half} ${y - 18} ${500 + half} ${y + 25} V ${y + 72}`} className="support-arch" />
          <path d={`M ${500 - half - 13} ${y + 72} H ${500 + half + 13}`} className="support-cap" />
        </g>
      ))}
      <path d="M500 150 C430 250 420 350 500 450 C580 550 570 650 500 790" className="rear-spine" />
      <path d="M500 150 C570 250 580 350 500 450 C420 550 430 650 500 790" className="rear-spine rear-spine-alt" />
    </g>
  );
}

function TowerArtwork({ watchedCount }: { watchedCount: number }) {
  const posters = useMemo(() => Array.from({ length: TOTAL_POSTERS }, (_, i) => i), []);
  const rearRoute = useMemo(() => routePath(false), []);
  const frontRoute = useMemo(() => routePath(true), []);
  const progress = watchedCount > 1 ? (watchedCount - 1) / (TOTAL_POSTERS - 1) : 0;
  const backProgressRoute = useMemo(() => routePath(false, progress), [progress]);
  const frontProgressRoute = useMemo(() => routePath(true, progress), [progress]);

  return (
    <svg className="babylon-svg" viewBox="0 0 1000 900" role="img" aria-label={`Beş turlu sarmal Babil Sinema Kulesi. ${watchedCount} / 100 poster yuvası dolu.`}>
      <defs>
        <linearGradient id="stone-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b7358" />
          <stop offset=".38" stopColor="#554638" />
          <stop offset="1" stopColor="#17181d" />
        </linearGradient>
        <linearGradient id="ramp-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a58a68" />
          <stop offset=".35" stopColor="#594735" />
          <stop offset="1" stopColor="#211d1b" />
        </linearGradient>
        <linearGradient id="poster-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0c6" stopOpacity=".95" />
          <stop offset="1" stopColor="#e89b4b" stopOpacity="0" />
        </linearGradient>
        {Array.from({ length: 360 }, (_, hue) => (
          <linearGradient key={hue} id={`poster-${hue}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`hsl(${hue}, 62%, 58%)`} />
            <stop offset="1" stopColor={`hsl(${(hue + 34) % 360}, 66%, 14%)`} />
          </linearGradient>
        ))}
        <filter id="warm-halo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="gold-halo" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <clipPath id="tower-mask"><path d="M105 820 Q145 650 245 470 Q330 300 410 170 Q500 75 590 170 Q670 300 755 470 Q855 650 895 820Z" /></clipPath>
      </defs>

      <g className="sky-stars">
        {Array.from({ length: 54 }, (_, i) => {
          const x = (i * 173 + 41) % 940 + 30;
          const y = (i * 97 + 23) % 290 + 18;
          return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 1.8 : .9} className="sky-star" style={{ animationDelay: `${(i % 9) * .35}s` }} />;
        })}
      </g>
      <g className="tower-clouds">
        <path d="M0 330 Q90 285 190 325 T390 320 T590 325 T800 310 T1000 330 V470 H0Z" />
        <path d="M0 405 Q130 350 260 395 T510 380 T760 398 T1000 370 V510 H0Z" />
      </g>

      <ellipse cx="500" cy="832" rx="440" ry="42" className="tower-ground-shadow" />
      <path d="M90 815 L910 815 L865 856 L135 856Z" className="tower-foundation" />
      <path d="M105 815 H895" className="tower-foundation-line" />

      <g className="tower-mass">
        <path d="M105 820 Q145 650 245 470 Q330 300 410 170 Q500 75 590 170 Q670 300 755 470 Q855 650 895 820Z" className="tower-silhouette" />
        <path d="M160 810 Q205 650 285 500 Q365 330 435 190 Q500 120 565 190 Q635 330 715 500 Q795 650 840 810Z" className="tower-inner-shadow" />
        <path d="M500 110 V815" className="tower-axis" />
        <StoneSupports />
      </g>

      <g className="helix-route helix-route-back">
        <path d={rearRoute} className="ramp-shadow" />
        <path d={rearRoute} className="ramp-band" />
        <path d={rearRoute} className="ramp-edge" />
      </g>
      <g className="helix-progress helix-progress-back"><path d={backProgressRoute} className="ramp-progress" /></g>
      <g className="poster-layer poster-layer-back">
        {posters.map((index) => {
          const p = helixPoint(index / (TOTAL_POSTERS - 1));
          return p.depth < .5 ? <TowerPoster key={index} index={index} watched={index < watchedCount} latest={index === watchedCount - 1} /> : null;
        })}
      </g>
      <g className="helix-route helix-route-front">
        <path d={frontRoute} className="ramp-shadow" />
        <path d={frontRoute} className="ramp-band" />
        <path d={frontRoute} className="ramp-edge" />
      </g>
      <g className="helix-progress helix-progress-front"><path d={frontProgressRoute} className="ramp-progress" /></g>
      <g className="poster-layer poster-layer-front">
        {posters.map((index) => {
          const p = helixPoint(index / (TOTAL_POSTERS - 1));
          return p.depth >= .5 ? <TowerPoster key={index} index={index} watched={index < watchedCount} latest={index === watchedCount - 1} /> : null;
        })}
      </g>

      <g className="tower-crown">
        <path d="M430 170 L450 112 L500 48 L550 112 L570 170 L535 160 L500 178 L465 160Z" />
        <path d="M475 110 L500 24 L525 110" />
        <circle cx="500" cy="34" r="7" />
        <path d="M452 170 Q500 145 548 170" className="crown-ring" />
      </g>
      <path d="M100 820 Q500 860 900 820" className="tower-outline" />
    </svg>
  );
}

export default function PosterWall() {
  const [watchedCount, setWatchedCount] = useState(0);
  const progress = watchedCount / TOTAL_POSTERS;
  const atmosphereStyle = {
    "--earth-opacity": 1 - progress * .92,
    "--cloud-opacity": .12 + progress * .55,
    "--space-opacity": progress,
    "--star-opacity": .2 + progress * .8,
  } as CSSProperties;

  return (
    <main className="babylon-page helix-page" style={atmosphereStyle}>
      <div className="atmosphere-earth" />
      <div className="atmosphere-clouds" />
      <div className="atmosphere-space" />
      <header className="babylon-header">
        <div className="brand-block">
          <span className="eyebrow">CINE BABYLON TOWER · YOUR FILM JOURNEY</span>
          <h1>Babil Sinema Kulesi</h1>
          <p>Her film sarmala eklenen bir taş; her izleme zirveye doğru bir dönüş.</p>
        </div>
        <div className="test-controls" aria-label="Kule test kontrolleri">
          <span className="test-label">TEST KONTROLÜ</span>
          <button type="button" onClick={() => setWatchedCount((count) => Math.min(TOTAL_POSTERS, count + 1))} disabled={watchedCount === TOTAL_POSTERS}>+1 İçerik İzle</button>
          <button type="button" onClick={() => setWatchedCount((count) => Math.min(TOTAL_POSTERS, count + 10))} disabled={watchedCount === TOTAL_POSTERS}>+10 İçerik İzle</button>
          <button type="button" className="reset-button" onClick={() => setWatchedCount(0)}>Sıfırla</button>
        </div>
      </header>

      <section className="tower-scene">
        <div className="tower-caption">
          <span>SARMAL YÜKSELİŞ</span>
          <strong>{String(watchedCount).padStart(3, "0")} <i>/ 100</i></strong>
          <div className="progress-track"><span style={{ width: `${progress * 100}%` }} /></div>
          <small>{Math.floor(watchedCount / 10)} / 10 TAM TUR DİLİMİ</small>
        </div>
        <div className="tower-visual"><TowerArtwork watchedCount={watchedCount} /></div>
        <div className="tower-legend">
          <span><i className="legend-empty" /> BOŞ YUVA</span>
          <span><i className="legend-poster" /> İZLENEN POSTER</span>
          <span><i className="legend-gold" /> IŞIKLI RAMPA</span>
        </div>
      </section>

      <footer className="babylon-footer">
        <span>100 POSTER · 5 HELİS TURU · TEK KESİNTİSİZ ROTA</span>
        <span>{watchedCount === TOTAL_POSTERS ? "KULE TAMAMLANDI · ZİRVEYE ULAŞTIN" : `${TOTAL_POSTERS - watchedCount} İÇERİK DAHA · SARMAL YÜKSELİŞ SÜRÜYOR`}</span>
      </footer>
    </main>
  );
}
