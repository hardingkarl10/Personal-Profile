import React from 'react';
import { ArrowRight, Camera, Compass, Dices, Terminal, Cloud } from 'lucide-react';

export default function Hero({ onOpenUpload }) {
  return (
    <section className="hero-section container">
      {/* Background ambient spots inside the section for precision */}
      <div className="glow-ambient glow-purple" style={{ top: '10%', left: '15%' }}></div>
      <div className="glow-ambient glow-cyan" style={{ bottom: '20%', right: '10%' }}></div>

      <div className="hero-content animate-fade-in">

        <h1 className="hero-title">
          Code, Photography &<br />
          <span className="text-gradient">Board Games</span>
        </h1>

        <p className="hero-lead">
          I'm a software engineer who builds high-performance web systems. Outside of the terminal, I document my travels, capture high-fidelity photography, and dive deep into complex tabletop strategy board games. Welcome to my personal visual feed.
        </p>

        <div className="hero-actions">
          <a href="#gallery" className="btn-glow">
            Explore Photos <ArrowRight size={16} />
          </a>
        </div>

        {/* Tailored stats reflecting travel, board games, photography, code */}
        <div className="stats-container glass-card">
          <div className="stat-item">
            <Compass className="stat-icon cyan" />
            <div className="stat-info">
              <span className="stat-value">7 Countries</span>
              <span className="stat-label">Travelled & Logged</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Camera className="stat-icon pink" />
            <div className="stat-info">
              <span className="stat-value">Nikon FG20</span>
              <span className="stat-label">Photography Gear</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Dices className="stat-icon purple" />
            <div className="stat-info">
              <span className="stat-value">40+ Tabletop</span>
              <span className="stat-label">Board Game Library</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding-top: 6rem;
          padding-bottom: 4rem;
          position: relative;
          display: flex;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding-top: 4rem;
            padding-bottom: 2.5rem;
          }
        }

        .hero-content {
          max-width: 800px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4.3rem);
          line-height: 1.05;
          margin-bottom: 1.5rem;
        }

        .text-gradient {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradient-motion 8s ease infinite;
        }

        @keyframes gradient-motion {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .hero-lead {
          font-size: clamp(1rem, 2vw, 1.15rem);
          max-width: 680px;
          margin-bottom: 2.5rem;
          color: var(--text-secondary);
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        @media (max-width: 480px) {
          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
          }
          .hero-actions a, .hero-actions button {
            width: 100%;
            justify-content: center;
          }
        }

        .upload-trigger-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          cursor: pointer;
        }

        .btn-secondary-link {
          color: var(--text-primary);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: var(--transition-fast);
          padding: 0.65rem 1.5rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
        }

        .btn-secondary-link:hover {
          color: var(--secondary);
          border-color: rgba(var(--secondary-rgb), 0.25);
          background: rgba(var(--secondary-rgb), 0.05);
          transform: translateY(-2px);
        }

        .stats-container {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          padding: 1.5rem .1rem;
          align-items: center;
        }

        @media (max-width: 640px) {
          .stats-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1.5rem;
          }
          .stat-divider {
            display: none;
          }
        }

        .stat-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: left;
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          padding: 9px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
        }

        .stat-icon.purple {
          color: var(--primary);
          background: rgba(var(--primary-rgb), 0.08);
          border-color: rgba(var(--primary-rgb), 0.15);
        }

        .stat-icon.cyan {
          color: var(--secondary);
          background: rgba(var(--secondary-rgb), 0.08);
          border-color: rgba(var(--secondary-rgb), 0.15);
        }

        .stat-icon.pink {
          color: var(--accent);
          background: rgba(var(--accent-rgb), 0.08);
          border-color: rgba(var(--accent-rgb), 0.15);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border-light);
        }
      `}</style>
    </section>
  );
}
