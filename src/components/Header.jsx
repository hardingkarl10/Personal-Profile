import React from 'react';
import { Compass } from 'lucide-react';

export default function Header({ onOpenUpload, onNavigateGame }) {
  return (
    <header className="header-glass">
      <div className="header-container">
        <a href="/" className="logo-section">
          <span id="header-logo-name" className="logo-text">Karl Harding</span>
        </a>

        <nav className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#gallery" className="nav-link">Gallery</a>
          {/* TODO: unhide when game is ready
          <button type="button" className="nav-link nav-link-btn" onClick={onNavigateGame}>Game</button>
          */}
        </nav>

        <div className="social-links">
          <a
            href="https://github.com/hardingkarl10"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="View Codebase"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/harding-karl"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="LinkedIn"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          <button
            onClick={onOpenUpload}
            className="btn-header-action"
          >
            Upload
          </button>
        </div>
      </div>

      <style>{`
        .header-glass {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(0, 95, 115, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          transition: var(--transition-smooth);
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 1rem 1.25rem;
          }
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
        }

        .logo-icon {
          color: var(--secondary);
          width: 26px;
          height: 26px;
          animation: spin-slow 20s linear infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .logo-text {
          font-family: 'Aboreto', serif;
          font-weight: 400;
          font-size: 1.2rem;
          letter-spacing: 0.06em;
          color: var(--text-primary);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        @media (max-width: 640px) {
          /* Hide About/Gallery anchors on mobile, but keep the Game button reachable
             (it's the only entry point to the fullscreen game page). */
          .nav-links a.nav-link {
            display: none;
          }
          .nav-links {
            gap: 0;
          }
        }

        .nav-link {
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          transition: var(--transition-fast);
          position: relative;
          padding: 0.25rem 0;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--secondary);
          transition: var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .social-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .social-icon-btn {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-light);
          background: rgba(255, 255, 255, 0.02);
          transition: var(--transition-fast);
          text-decoration: none;
        }

        .social-icon-btn:hover {
          color: var(--text-primary);
          border-color: var(--secondary);
          background: rgba(var(--secondary-rgb), 0.1);
          transform: translateY(-1px);
        }

        .btn-header-action {
          display: inline-flex;
          align-items: center;
          background: rgba(var(--primary-rgb), 0.12);
          color: var(--primary);
          border: 1px solid rgba(var(--primary-rgb), 0.25);
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-header-action:hover {
          background: var(--primary);
          color: var(--bg-deep);
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.3);
          transform: translateY(-1px);
        }
      `}</style>
    </header>
  );
}
