import React, { useState, useEffect, useRef } from 'react';
import { Users, ExternalLink, Star } from 'lucide-react';

const TOP_GAMES = [
  {
    id: 359871,
    name: 'Arcs',
    year: 2024,
    players: '2–4',
    rating: 10,
    description: 'A space opera of ambition and collapse. Factions compete, betray, and fall across a crumbling galactic empire in this asymmetric masterpiece.',
    image: 'https://cdn11.bigcommerce.com/s-ua4dd/images/stencil/1280x1280/products/181049/331436/LED06000-1__76931.1730488429.png?c=2',
    bggUrl: 'https://boardgamegeek.com/boardgame/359871/arcs',
  },
  {
    id: 366013,
    name: 'Heat: Pedal to the Metal',
    year: 2022,
    players: '1–6',
    rating: 10,
    description: "A white-knuckle racing game where managing your car's heat is the difference between a podium finish and a blown engine.",
    image: 'https://www.miniaturemarket.com/media/f7/c8/dc/1752209794/dow9101.jpg',
    bggUrl: 'https://boardgamegeek.com/boardgame/366013/heat-pedal-to-the-metal',
  },
  {
    id: 291572,
    name: 'Oath',
    year: 2021,
    players: '1–6',
    rating: 10,
    description: 'A living chronicle of empire and exile — each game shapes the next as rulers and exiles battle for the soul of an evolving realm.',
    image: 'https://www.miniaturemarket.com/media/5c/f9/87/1752256756/led03000_1.jpg',
    bggUrl: 'https://boardgamegeek.com/boardgame/291572/oath',
  },
  {
    id: 196340,
    name: 'Yokohama',
    year: 2016,
    players: '2–4',
    rating: 9.6,
    description: 'A tightly designed worker-placement engine-builder set in Meiji-era Japan. Build your merchant empire one district at a time.',
    image: 'https://www.miniaturemarket.com/media/4f/eb/91/1752301222/synyok01en.jpg',
    bggUrl: 'https://boardgamegeek.com/boardgame/196340/yokohama',
  },
  {
    id: 332686,
    name: 'John Company',
    subtitle: '2nd Edition',
    year: 2022,
    players: '1–6',
    rating: 9.5,
    description: 'Negotiate, scheme, and exploit your way through the chaotic machinery of the British East India Company in this brutal political game.',
    image: 'https://www.miniaturemarket.com/media/ed/c9/76/1752319193/wgg102.jpg',
    bggUrl: 'https://boardgamegeek.com/boardgame/332686/john-company-second-edition',
  },
];

export default function BoardGamesSection() {
  const [loadedImages, setLoadedImages] = useState({});
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="board-games" className="bg-section container">
      <div className="bg-header">
        <div className="title-area">
          <h2 className="section-title">Favorite Board Games</h2>
          <p className="section-subtitle">
            My top-rated games from a 40+ title library —&nbsp;
            <a
              href="https://boardgamegeek.com/user/kwharding"
              target="_blank"
              rel="noopener noreferrer"
              className="bgg-link"
            >
              kwharding on BGG
            </a>
          </p>
        </div>
      </div>

      <div className="bg-grid" ref={gridRef}>
        {TOP_GAMES.map((game, index) => {
          const isLoaded = loadedImages[game.id];
          return (
            <a
              key={game.id}
              href={game.bggUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card glass-card interactive-hover"
              style={{ '--stagger': `${index * 0.1}s` }}
            >
              <div className="bg-image-wrap">
                {!isLoaded && <div className="shimmer-placeholder absolute-fill" />}
                <img
                  src={game.image}
                  alt={game.name}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  onLoad={() => handleImageLoad(game.id)}
                  className={`bg-img ${isLoaded ? 'loaded' : ''}`}
                />

                <div className="bg-rating-badge">
                  <Star size={10} fill="currentColor" />
                  {game.rating}
                </div>

                <div className="bg-overlay">
                  <span className="btn-expand">
                    <ExternalLink size={14} /> View on BGG
                  </span>
                </div>
              </div>

              <div className="bg-info">
                <div className="bg-name-row">
                  <span className="bg-name">{game.name}</span>
                  {game.subtitle && <span className="bg-subtitle">{game.subtitle}</span>}
                </div>
                <p className="bg-desc">{game.description}</p>
                <div className="bg-meta">
                  <span className="bg-meta-item">
                    <Users size={11} /> {game.players}
                  </span>
                  <span className="bg-meta-item bg-year">{game.year}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <style>{`
        .bg-section {
          padding-top: 4rem;
          padding-bottom: 6rem;
        }

        .bg-header {
          margin-bottom: 3rem;
        }

        .bgg-link {
          color: var(--primary);
          text-decoration: none;
          border-bottom: 1px solid rgba(var(--primary-rgb), 0.35);
          transition: var(--transition-fast);
        }

        .bgg-link:hover {
          border-color: var(--primary);
        }

        .bg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        @media (min-width: 1100px) {
          .bg-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bg-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          border-color: var(--border-light);
          overflow: hidden;
          height: 100%;
          opacity: 0;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .bg-grid.revealed .bg-card {
          animation: cardReveal 0.55s cubic-bezier(0.25, 0.8, 0.25, 1) var(--stagger, 0s) forwards;
        }

        .bg-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-glow);
          box-shadow: var(--glow-primary);
        }

        .bg-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          flex-shrink: 0;
          background: var(--ink-black);
          overflow: hidden;
          border-radius: 15px 15px 0 0;
        }

        .bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease;
          opacity: 0;
        }

        .bg-img.loaded {
          opacity: 1;
        }

        .bg-card:hover .bg-img {
          transform: scale(1.05);
        }

        .bg-rating-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(var(--primary-rgb), 0.92);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: var(--text-primary);
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.8rem;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          z-index: 5;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26, 22, 18, 0.9) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 1rem;
          opacity: 0;
          transition: var(--transition-fast);
        }

        .bg-card:hover .bg-overlay {
          opacity: 1;
        }

        .bg-info {
          padding: 1rem 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          background: rgba(165, 95, 63, 0.18);
          border-radius: 0 0 15px 15px;
          gap: 0.4rem;
        }

        .bg-name-row {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .bg-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
          transition: var(--transition-fast);
          line-height: 1.3;
        }

        .bg-card:hover .bg-name {
          color: var(--primary);
        }

        .bg-subtitle {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .bg-desc {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.5;
          flex-grow: 1;
        }

        .bg-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.25rem;
        }

        .bg-meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .bg-year {
          font-family: var(--font-mono);
          font-size: 0.7rem;
        }
      `}</style>
    </section>
  );
}
