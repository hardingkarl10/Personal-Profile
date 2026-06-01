import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ image, imageList, onClose, onNavigate }) {
  const [isRendered, setIsRendered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fading, setFading] = useState(false);
  const pendingNav = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setIsRendered(true), 20);
    return () => clearTimeout(t);
  }, []);

  // When image changes, reset load state — but also handle cached images
  // that won't fire onLoad because the browser already has them.
  useEffect(() => {
    setImgLoaded(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [image.url]);

  const currentIndex = imageList.findIndex((img) => img.id === image.id);

  const navigate = (nextImage) => {
    if (fading) return; // ignore rapid taps mid-transition
    setFading(true);
    pendingNav.current = nextImage;
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    navigate(imageList[(currentIndex + 1) % imageList.length]);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    navigate(imageList[(currentIndex - 1 + imageList.length) % imageList.length]);
  };

  // Only act on the opacity transition end to avoid double-firing (opacity + transform)
  const handleTransitionEnd = (e) => {
    if (e.propertyName !== 'opacity') return;
    if (fading && pendingNav.current) {
      onNavigate(pendingNav.current);
      pendingNav.current = null;
      setFading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, imageList, fading]);

  const touchStart = useRef(null);

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    touchStart.current = null;
    if (Math.abs(delta) < 50) return;
    delta > 0 ? handleNext() : handlePrev();
  };

  return (
    <div
      className={`lb-overlay ${isRendered ? 'active' : ''}`}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button className="lb-close" onClick={onClose} title="Close (Esc)">
        <X size={22} />
      </button>

      {/* Prev arrow */}
      {imageList.length > 1 && (
        <button className="lb-arrow lb-arrow-left" onClick={handlePrev} title="Previous">
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image + title wrapped so title sits below image on mobile */}
      <div className="lb-content" onClick={(e) => e.stopPropagation()}>
        <img
          ref={imgRef}
          src={image.url}
          alt={image.title}
          className={`lb-img ${imgLoaded && !fading ? 'loaded' : ''}`}
          onLoad={() => setImgLoaded(true)}
          onTransitionEnd={handleTransitionEnd}
        />
        <div className={`lb-title ${imgLoaded && !fading ? 'visible' : ''}`}>
          {image.title}
        </div>
      </div>

      {/* Next arrow */}
      {imageList.length > 1 && (
        <button className="lb-arrow lb-arrow-right" onClick={handleNext} title="Next">
          <ChevronRight size={28} />
        </button>
      )}

      <style>{`
        .lb-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(26, 22, 18, 0.96);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .lb-overlay.active {
          opacity: 1;
        }

        .lb-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 92vw;
        }

        .lb-img {
          max-width: 100%;
          max-height: 82vh;
          object-fit: contain;
          border-radius: 4px;
          opacity: 0;
          transform: scale(0.97);
          transition: opacity 0.4s ease, transform 0.4s ease;
          cursor: default;
          user-select: none;
        }

        .lb-img.loaded {
          opacity: 1;
          transform: scale(1);
        }

        /* Mobile: title flows just below the image */
        .lb-title {
          margin-top: 0.9rem;
          font-family: 'Aboreto', serif;
          font-weight: 400;
          font-size: 1rem;
          letter-spacing: 0.06em;
          color: rgba(232, 217, 184, 0.9);
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s;
          pointer-events: none;
        }

        .lb-title.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Desktop: title fixed at bottom-left of screen */
        @media (min-width: 601px) {
          .lb-content {
            max-width: none;
          }
          .lb-img {
            max-width: 92vw;
            max-height: 90vh;
          }
          .lb-title {
            position: fixed;
            bottom: 2.5rem;
            left: 2.5rem;
            margin-top: 0;
            font-size: clamp(1rem, 2.5vw, 1.5rem);
          }
        }

        .lb-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(232, 217, 184, 0.7);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1010;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }

        .lb-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          transform: rotate(90deg);
        }

        .lb-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(232, 217, 184, 0.6);
          width: 54px;
          height: 54px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1010;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }

        .lb-arrow:hover {
          background: rgba(var(--primary-rgb), 0.12);
          border-color: rgba(var(--primary-rgb), 0.35);
          color: var(--text-primary);
        }

        .lb-arrow-left  { left: 1.75rem; }
        .lb-arrow-right { right: 1.75rem; }

        @media (max-width: 600px) {
          .lb-arrow { display: none; }
        }
      `}</style>
    </div>
  );
}
