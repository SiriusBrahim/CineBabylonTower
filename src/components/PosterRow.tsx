const posters = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  title: `POSTER ${String(index + 1).padStart(3, "0")}`,
  hue: (index * 37) % 360,
}));

export default function PosterRow() {
  return (
    <main className="poster-page">
      <header className="poster-header">
        <span className="eyebrow">CINE BABYLON TOWER · FOUNDATION</span>
        <h1>100 Poster Test</h1>
        <p>İlk aşama · Tek sıra · Yatay yerleşim</p>
      </header>

      <section className="poster-viewport" aria-label="100 posterlik yatay sıra">
        <div className="poster-row">
          {posters.map((poster) => (
            <article className="poster-card" key={poster.id}>
              <div
                className="poster-art"
                style={{ "--poster-hue": poster.hue } as React.CSSProperties}
              >
                <span className="poster-index">{String(poster.id).padStart(3, "0")}</span>
                <span className="poster-mark">CINEMA<br />COLLECTION</span>
                <span className="poster-title">{poster.title}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="poster-footer">
        <span>01 — 100</span>
        <span>Yatay poster dizilimi</span>
        <span>Kaydırarak devam et →</span>
      </footer>
    </main>
  );
}
