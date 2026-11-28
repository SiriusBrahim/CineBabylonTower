import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

const FLOOR_COUNT = 10;
const SLOTS_PER_FLOOR = 10;
const TOTAL_SLOTS = FLOOR_COUNT * SLOTS_PER_FLOOR;

type SlotProps = {
  floor: number;
  slot: number;
  watched: boolean;
  locked: boolean;
  complete: boolean;
};

function TowerSlot({ floor, slot, watched, locked, complete }: SlotProps) {
  const width = 820 - floor * 56;
  const slotWidth = width / SLOTS_PER_FLOOR;
  const x = 500 - width / 2 + slot * slotWidth;
  const y = 760 - floor * 66;
  const posterInset = Math.max(3, Math.min(7, slotWidth * 0.09));
  const posterWidth = Math.max(9, slotWidth - posterInset * 2);
  const posterHeight = 35;
  const hue = (floor * 29 + slot * 17 + 28) % 360;

  return (
    <g className={`tower-slot ${watched ? "is-watched" : "is-empty"} ${locked ? "is-locked" : ""} ${complete ? "is-complete" : ""}`}>
      {watched && (
        <rect
          x={x + posterInset - 4}
          y={y + 3}
          width={posterWidth + 8}
          height={posterHeight + 9}
          rx="3"
          className="window-glow"
        />
      )}
      <rect
        x={x + 1.5}
        y={y + 1.5}
        width={slotWidth - 3}
        height="47"
        rx="2"
        className="slot-opening"
      />
      {watched ? (
        <g className="poster-in-slot">
          <rect
            x={x + posterInset}
            y={y + posterInset}
            width={posterWidth}
            height={posterHeight}
            rx="1.5"
            fill={`url(#poster-${hue})`}
            stroke="#f7d9a1"
            strokeOpacity=".78"
            strokeWidth=".8"
          />
          <path
            d={`M ${x + posterInset + 3} ${y + 12} Q ${x + slotWidth / 2} ${y + 4} ${x + slotWidth - posterInset - 3} ${y + 15} L ${x + slotWidth - posterInset - 3} ${y + 29} L ${x + posterInset + 3} ${y + 29} Z`}
            fill="rgba(255,230,185,.38)"
          />
          <circle cx={x + slotWidth / 2} cy={y + 20} r={Math.max(2, Math.min(5, slotWidth * .07))} fill="#fff0c8" opacity=".88" />
          <path
            d={`M ${x + posterInset + 3} ${y + 37} H ${x + slotWidth - posterInset - 3}`}
            stroke="rgba(255,239,211,.68)"
            strokeWidth="1"
          />
        </g>
      ) : (
        <g className="empty-slot-mark">
          <path
            d={`M ${x + slotWidth * .25} ${y + 15} L ${x + slotWidth * .75} ${y + 15} M ${x + slotWidth * .25} ${y + 31} L ${x + slotWidth * .75} ${y + 31}`}
            stroke={locked ? "#30313b" : "#6b5b49"}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity=".75"
          />
        </g>
      )}
    </g>
  );
}

function TowerFloor({
  floor,
  watchedCount,
}: {
  floor: number;
  watchedCount: number;
}) {
  const width = 820 - floor * 56;
  const left = 500 - width / 2;
  const y = 760 - floor * 66;
  const watchedOnFloor = Math.max(0, Math.min(SLOTS_PER_FLOOR, watchedCount - floor * SLOTS_PER_FLOOR));
  const complete = watchedOnFloor === SLOTS_PER_FLOOR;
  const unlocked = floor <= Math.floor(watchedCount / SLOTS_PER_FLOOR);
  const nextFloor = floor === Math.floor(watchedCount / SLOTS_PER_FLOOR) && watchedCount < TOTAL_SLOTS;

  return (
    <g className={`tower-floor ${complete ? "floor-complete" : ""} ${unlocked ? "floor-unlocked" : "floor-locked"} ${nextFloor ? "floor-current" : ""}`}>
      <path
        className="floor-arch"
        d={`M ${left - 8} ${y + 51} L ${left + 10} ${y - 4} L ${500 + width / 2 - 10} ${y - 4} L ${left + width + 8} ${y + 51} Z`}
      />
      <path
        className="floor-ledge"
        d={`M ${left - 13} ${y + 51} H ${left + width + 13}`}
      />
      {Array.from({ length: SLOTS_PER_FLOOR }, (_, slot) => (
        <TowerSlot
          key={slot}
          floor={floor}
          slot={slot}
          watched={floor * SLOTS_PER_FLOOR + slot < watchedCount}
          locked={!unlocked}
          complete={complete}
        />
      ))}
      <text x={left - 20} y={y + 29} textAnchor="end" className="floor-number">
        {String(floor + 1).padStart(2, "0")}
      </text>
      {complete && (
        <text x={left + width + 20} y={y + 29} className="floor-complete-mark">✦</text>
      )}
    </g>
  );
}

function TowerArtwork({ watchedCount }: { watchedCount: number }) {
  const floors = useMemo(() => Array.from({ length: FLOOR_COUNT }, (_, i) => FLOOR_COUNT - 1 - i), []);
  return (
    <svg
      className="babylon-svg"
      viewBox="0 0 1000 900"
      role="img"
      aria-label={`On katlı Babil Sinema Kulesi. ${watchedCount} / 100 poster yuvası dolu.`}
    >
      <defs>
        <linearGradient id="stone" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#88745c" />
          <stop offset=".45" stopColor="#4a4036" />
          <stop offset="1" stopColor="#211f20" />
        </linearGradient>
        <linearGradient id="poster-base" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f1c17d" />
          <stop offset="1" stopColor="#7d3f32" />
        </linearGradient>
        {Array.from({ length: 360 }, (_, hue) => (
          <linearGradient key={hue} id={`poster-${hue}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={`hsl(${hue}, 58%, 49%)`} />
            <stop offset="1" stopColor={`hsl(${(hue + 35) % 360}, 62%, 13%)`} />
          </linearGradient>
        ))}
        <filter id="warm-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="gold-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="tower-shadow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ad936d" stopOpacity=".13" />
          <stop offset="1" stopColor="#08090e" stopOpacity=".86" />
        </linearGradient>
      </defs>

      <g className="sky-stars">
        {Array.from({ length: 42 }, (_, i) => {
          const x = (i * 173 + 41) % 940 + 30;
          const y = (i * 97 + 23) % 270 + 25;
          return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 1.8 : .9} className="sky-star" style={{ animationDelay: `${(i % 9) * .35}s` }} />;
        })}
      </g>

      <g className="tower-clouds">
        <path d="M0 330 Q90 285 190 325 T390 320 T590 325 T800 310 T1000 330 V410 H0Z" />
        <path d="M0 390 Q130 350 260 385 T510 380 T760 388 T1000 370 V455 H0Z" />
      </g>

      <path className="tower-ground-shadow" d="M115 812 Q500 755 885 812 L970 900 H30Z" />
      <path className="tower-foundation" d="M78 810 L922 810 L878 842 L122 842Z" />
      <path className="tower-foundation-line" d="M78 810 H922" />

      <g className="tower-body">
        {floors.map((floor) => (
          <TowerFloor key={floor} floor={floor} watchedCount={watchedCount} />
        ))}
      </g>

      <g className="tower-crown">
        <path d="M445 100 L500 48 L555 100 L545 120 H455Z" />
        <path d="M474 91 L500 20 L526 91" />
        <circle cx="500" cy="30" r="5" />
      </g>
      <path className="tower-center-spine" d="M500 120 V806" />
      <path className="tower-outline" d="M78 810 L125 755 L170 690 L226 624 L282 558 L338 492 L394 426 L450 360 L506 294 L562 228 L618 162 L655 120 L500 48 L345 120 L382 162 L438 228 L494 294 L550 360 L606 426 L662 492 L718 558 L774 624 L830 690 L875 755 L922 810" />
    </svg>
  );
}

export default function PosterWall() {
  const [watchedCount, setWatchedCount] = useState(0);
  const completedFloors = Math.floor(watchedCount / SLOTS_PER_FLOOR);
  const progress = watchedCount / TOTAL_SLOTS;
  const atmosphereStyle = {
    "--tower-progress": progress,
    "--sky-warmth": 1 - progress,
  } as CSSProperties;

  return (
    <main className="babylon-page" style={atmosphereStyle}>
      <div className="atmosphere-earth" />
      <div className="atmosphere-clouds" />
      <div className="atmosphere-space" />
      <header className="babylon-header">
        <div className="brand-block">
          <span className="eyebrow">CINE BABYLON TOWER · YOUR FILM JOURNEY</span>
          <h1>Babil Sinema Kulesi</h1>
          <p>Her film bir taş. Her tamamlanan kat, zirveye bir adım daha.</p>
        </div>
        <div className="test-controls" aria-label="Kule test kontrolleri">
          <span className="test-label">TEST KONTROLÜ</span>
          <button type="button" onClick={() => setWatchedCount((count) => Math.min(TOTAL_SLOTS, count + 1))} disabled={watchedCount === TOTAL_SLOTS}>+1 İçerik İzle</button>
          <button type="button" onClick={() => setWatchedCount((count) => Math.min(TOTAL_SLOTS, count + 10))} disabled={watchedCount === TOTAL_SLOTS}>+10 İçerik İzle</button>
          <button type="button" className="reset-button" onClick={() => setWatchedCount(0)}>Sıfırla</button>
        </div>
      </header>

      <section className="tower-scene">
        <div className="tower-caption">
          <span>YÜKSELİŞİN</span>
          <strong>{String(watchedCount).padStart(3, "0")} <i>/ 100</i></strong>
          <div className="progress-track"><span style={{ width: `${progress * 100}%` }} /></div>
          <small>{completedFloors} / 10 KAT TAMAMLANDI</small>
        </div>
        <div className="tower-visual">
          <TowerArtwork watchedCount={watchedCount} />
        </div>
        <div className="tower-legend">
          <span><i className="legend-empty" /> BOŞ YUVA</span>
          <span><i className="legend-poster" /> İZLENEN</span>
          <span><i className="legend-gold" /> TAMAMLANAN KAT</span>
        </div>
      </section>

      <footer className="babylon-footer">
        <span>100 POSTER YUVASI · 10 KAT · TEK ZİRVE</span>
        <span>{watchedCount === TOTAL_SLOTS ? "KULE TAMAMLANDI · ZİRVEYE ULAŞTIN" : `${TOTAL_SLOTS - watchedCount} İÇERİK DAHA · ${Math.min(10, completedFloors + 1)}. KAT AÇIK`}</span>
      </footer>
    </main>
  );
}
