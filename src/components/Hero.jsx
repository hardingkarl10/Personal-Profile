import React, { useEffect, useState } from 'react';

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={`hero-section ${visible ? 'visible' : ''}`}>
      <div className="hero-center">
        <h1 className="hero-name">Karl Harding</h1>
        <div className="hero-line" />
        <p className="hero-sub">Software Engineer</p>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          min-height: 78vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
        }

        .hero-center {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-name {
          font-family: 'Aboreto', serif;
          font-size: clamp(2.6rem, 8vw, 7.5rem);
          font-weight: 400;
          color: var(--text-primary);
          letter-spacing: 0.05em;
          margin: 0;
          line-height: 1;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s ease 0.15s,
                      transform 0.9s cubic-bezier(0.25, 0.8, 0.25, 1) 0.15s;
        }
        .hero-section.visible .hero-name {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-line {
          width: 0;
          height: 1px;
          background: rgba(var(--primary-rgb), 0.35);
          margin: 1.5rem 0 1.25rem;
          transition: width 0.7s ease 0.85s;
        }
        .hero-section.visible .hero-line { width: 100%; }

        .hero-sub {
          font-size: clamp(0.65rem, 1.4vw, 0.85rem);
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(var(--text-primary-rgb), 0.5);
          margin: 0;
          opacity: 0;
          transition: opacity 0.7s ease 1s;
        }
        .hero-section.visible .hero-sub { opacity: 1; }
      `}</style>
    </section>
  );
}
