import React from 'react';
import { Compass, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-glass">
      <div className="footer-container container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Compass className="logo-icon" size={16} />
            <span>Karl Harding</span>
          </div>
          <p className="footer-tagline">Photos served from Google Cloud Storage</p>
        </div>

        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} Karl Code. Built with React & GCP.</p>
          <span className="heart-span">
            Crafted with <Heart size={10} className="heart-icon" /> for visual excellence.
          </span>
        </div>
      </div>

      <style>{`
        .footer-glass {
          background: rgba(255, 251, 245, 0.75);
          border-top: 1px solid var(--border-light);
          padding: 3rem 0;
          margin-top: auto;
        }

        .footer-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        @media (max-width: 640px) {
          .footer-container {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-start;
        }

        @media (max-width: 640px) {
          .footer-brand {
            align-items: center;
          }
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          color: var(--text-primary);
        }

        .logo-icon {
          color: var(--secondary);
        }

        .footer-tagline {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .footer-copyright {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .footer-copyright {
            align-items: center;
          }
        }

        .heart-span {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-muted);
        }

        .heart-icon {
          color: var(--accent);
          fill: var(--accent);
        }
      `}</style>
    </footer>
  );
}
