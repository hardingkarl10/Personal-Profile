import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, User, Calendar, Tag, FileText } from 'lucide-react';

export default function Lightbox({ image, imageList, onClose, onNavigate }) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Quick timeout to trigger CS transition fade-in
    const t = setTimeout(() => setIsRendered(true), 20);
    return () => clearTimeout(t);
  }, []);

  const currentIndex = imageList.findIndex((img) => img.id === image.id);

  const handleNext = (e) => {
    e?.stopPropagation();
    const nextIdx = (currentIndex + 1) % imageList.length;
    onNavigate(imageList[nextIdx]);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    const prevIdx = (currentIndex - 1 + imageList.length) % imageList.length;
    onNavigate(imageList[prevIdx]);
  };

  // Keyboard navigation hooks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, imageList]);

  return (
    <div 
      className={`lightbox-overlay ${isRendered ? 'active' : ''}`}
      onClick={onClose}
    >
      {/* Close Button */}
      <button className="lightbox-close" onClick={onClose} title="Close (Esc)">
        <X size={24} />
      </button>

      {/* Prev Arrow */}
      {imageList.length > 1 && (
        <button className="lightbox-arrow arrow-left" onClick={handlePrev} title="Previous (Left Arrow)">
          <ChevronLeft size={30} />
        </button>
      )}

      {/* Main Content Area */}
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-wrapper">
          {/* Active Image Panel */}
          <div className="lightbox-image-box">
            <img src={image.url} alt={image.title} className="lightbox-img" />
          </div>

          {/* Details Sidebar (Glass panel) */}
          <div className="lightbox-details glass-card">
            <div className="details-header">
              <span className="details-category">
                <Tag size={12} /> {image.category}
              </span>
              <h2 className="details-title">{image.title}</h2>
            </div>

            <div className="details-meta">
              <div className="meta-row">
                <User className="meta-icon" size={14} />
                <div className="meta-val">
                  <span className="meta-lbl">Creator</span>
                  <span>{image.author}</span>
                </div>
              </div>
              <div className="meta-row">
                <Calendar className="meta-icon" size={14} />
                <div className="meta-val">
                  <span className="meta-lbl">Created On</span>
                  <span>{image.date}</span>
                </div>
              </div>
            </div>

            <div className="details-desc">
              <div className="desc-heading">
                <FileText size={14} />
                <span>Description</span>
              </div>
              <p>{image.description}</p>
            </div>
            
            <div className="details-footer">
              <span className="source-badge">Option 1: Firebase Storage Client</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Arrow */}
      {imageList.length > 1 && (
        <button className="lightbox-arrow arrow-right" onClick={handleNext} title="Next (Right Arrow)">
          <ChevronRight size={30} />
        </button>
      )}

      <style>{`
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(7, 20, 40, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
          padding: 2rem;
        }

        .lightbox-overlay.active {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .lightbox-overlay {
            padding: 1rem;
          }
        }

        .lightbox-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          color: #fff;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1010;
          transition: var(--transition-fast);
        }

        .lightbox-close:hover {
          background: rgba(249, 87, 56, 0.15);
          border-color: var(--accent);
          color: var(--accent);
          transform: rotate(90deg);
        }

        .lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1010;
          transition: var(--transition-fast);
        }

        .lightbox-arrow:hover {
          background: rgba(244, 211, 94, 0.1);
          border-color: var(--primary);
          color: var(--text-primary);
        }

        .arrow-left {
          left: 2rem;
        }

        .arrow-right {
          right: 2rem;
        }

        @media (max-width: 1024px) {
          .lightbox-arrow {
            display: none; /* Hide arrow buttons on smaller screens, rely on swipe / click list */
          }
        }

        .lightbox-content {
          width: 100%;
          max-width: 1100px;
          display: flex;
          justify-content: center;
          transform: scale(0.95);
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .lightbox-overlay.active .lightbox-content {
          transform: scale(1);
        }

        .lightbox-wrapper {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          width: 100%;
          background: #071d33;
          border-radius: 20px;
          border: 1px solid var(--border-light);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
        }

        @media (max-width: 850px) {
          .lightbox-wrapper {
            grid-template-columns: 1fr;
            max-height: 85vh;
            overflow-y: auto;
          }
        }

        .lightbox-image-box {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #051525;
          padding: 1.5rem;
          min-height: 350px;
          max-height: 70vh;
        }

        @media (max-width: 850px) {
          .lightbox-image-box {
            max-height: 40vh;
          }
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
        }

        .lightbox-details {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          background: rgba(10, 40, 75, 0.45);
          border: none;
          border-left: 1px solid var(--border-light);
          border-radius: 0;
        }

        @media (max-width: 850px) {
          .lightbox-details {
            border-left: none;
            border-top: 1px solid var(--border-light);
            padding: 1.5rem;
          }
        }

        .details-header {
          margin-bottom: 2rem;
        }

        .details-category {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--secondary);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .details-title {
          font-size: 1.75rem;
          line-height: 1.2;
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .details-meta {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 2rem;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .meta-icon {
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .meta-val {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }

        .meta-lbl {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .details-desc {
          flex-grow: 1;
        }

        .desc-heading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .details-desc p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .details-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .source-badge {
          display: inline-block;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
