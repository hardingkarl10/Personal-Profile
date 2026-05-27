import React, { useState } from 'react';
import { Layers, User, Calendar, ExternalLink, SlidersHorizontal, Info } from 'lucide-react';

export default function Gallery({ images, loading, onSelectImage }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [loadedImages, setLoadedImages] = useState({});

  // Unique categories derived from the images list
  const categories = ['All', ...new Set(images.map((img) => img.category))];

  // Filter images based on selected category
  const filteredImages = activeCategory === 'All'
    ? images
    : images.filter((img) => img.category === activeCategory);

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const isLocalMockData = images.some(img => img.id.startsWith('mock-'));

  return (
    <section id="gallery" className="gallery-section container">
      {/* Alert banner for local mode */}
      {isLocalMockData && (
        <div className="local-alert glass-card animate-fade-in">
          <Info className="alert-icon" size={18} />
          <div className="alert-text">
            <strong>Operating in Local Demo Mode.</strong> Curated sample images are displayed below. To load custom assets, configure your GCP credentials in a <code>.env</code> file.
          </div>
        </div>
      )}

      <div className="gallery-header">
        <div className="title-area">
          <h2 className="section-title">Visual Portfolio</h2>
          <p className="section-subtitle">A curated feed of dynamic assets fetched in real-time</p>
        </div>
        
        {/* Category Filters */}
        <div className="filter-wrapper">
          <div className="filter-icon-box">
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </div>
          <div className="filter-container">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Container */}
      {loading ? (
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="gallery-card-skeleton shimmer-placeholder" />
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="empty-gallery glass-card">
          <Layers size={40} className="empty-icon" />
          <h3>No assets found</h3>
          <p>This category has no images currently loaded in Cloud Storage.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map((image, index) => {
            const isLoaded = loadedImages[image.id];
            
            // Determine column span class based on aspect ratio
            let gridClass = 'card-normal';
            if (image.aspectRatio === 'wide') gridClass = 'card-wide';
            if (image.aspectRatio === 'portrait') gridClass = 'card-tall';

            return (
              <div
                key={image.id}
                className={`gallery-card glass-card ${gridClass} interactive-hover animate-fade-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onSelectImage(image, filteredImages)}
              >
                {/* Image Container with Loader */}
                <div className="image-container">
                  {!isLoaded && <div className="shimmer-placeholder absolute-fill" />}
                  <img
                    src={image.url}
                    alt={image.title}
                    loading={index < 3 ? "eager" : "lazy"} // Eager load first 3 for LCP optimization
                    fetchPriority={index < 2 ? "high" : "auto"} // High priority for top images
                    onLoad={() => handleImageLoad(image.id)}
                    className={`gallery-img ${isLoaded ? 'loaded' : ''}`}
                  />
                  
                  {/* Category Badge on hover overlay */}
                  <span className="card-badge">{image.category}</span>
                  
                  {/* Hover visual details */}
                  <div className="card-overlay">
                    <span className="btn-expand">
                      <ExternalLink size={16} /> View Details
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="card-info">
                  <h3 className="card-title">{image.title}</h3>
                  <div className="card-meta">
                    <span className="meta-item">
                      <User size={12} /> {image.author}
                    </span>
                    <span className="meta-item">
                      <Calendar size={12} /> {image.date}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .gallery-section {
          padding-top: 4rem;
          padding-bottom: 6rem;
        }

        .local-alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          margin-bottom: 3rem;
          border-color: rgba(var(--secondary-rgb), 0.2);
          background: rgba(var(--secondary-rgb), 0.04);
        }

        @media (max-width: 640px) {
          .local-alert {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 1rem;
          }
        }

        .alert-icon {
          color: var(--secondary);
          flex-shrink: 0;
        }

        .alert-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .alert-text code {
          background: rgba(255, 255, 255, 0.06);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          color: var(--secondary);
          font-family: var(--font-mono);
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .gallery-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
        }

        .section-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .filter-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        @media (max-width: 900px) {
          .filter-wrapper {
            width: 100%;
          }
        }

        .filter-icon-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .filter-icon-box {
            display: none;
          }
        }

        .filter-container {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          scrollbar-width: none; /* Hide scrollbar on Firefox */
        }

        .filter-container::-webkit-scrollbar {
          display: none; /* Hide scrollbar on Chrome */
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 0.85rem;
          white-space: nowrap;
          transition: var(--transition-fast);
        }

        .filter-btn:hover {
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.04);
        }

        .filter-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.2);
          color: var(--bg-deep);
        }

        /* Responsive Grid: Masonry visual layout via CSS Grid */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          grid-auto-flow: dense;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .card-wide {
            grid-column: span 2;
          }
          .card-tall {
            grid-row: span 2;
          }
        }

        @media (min-width: 1400px) {
          .gallery-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Card styles */
        .gallery-card {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          border-color: var(--border-light);
          overflow: hidden;
          height: 100%;
        }

        .gallery-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-glow);
          box-shadow: var(--glow-primary);
        }

        .card-wide .image-container {
          aspect-ratio: 16/9;
        }

        .card-tall .image-container {
          aspect-ratio: 2/3;
          max-height: 520px;
        }

        .image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          flex-shrink: 0;
          background: var(--ink-black);
          overflow: hidden;
          border-radius: 15px 15px 0 0;
        }

        .absolute-fill {
          position: absolute;
          inset: 0;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease;
          opacity: 0;
        }

        .gallery-img.loaded {
          opacity: 1;
        }

        .gallery-card:hover .gallery-img {
          transform: scale(1.06);
        }

        .card-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(18, 69, 89, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--secondary);
          z-index: 5;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(18, 69, 89, 0.85) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 1.25rem;
          opacity: 0;
          transition: var(--transition-fast);
        }

        .gallery-card:hover .card-overlay {
          opacity: 1;
        }

        .btn-expand {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          transform: translateY(10px);
          transition: var(--transition-bounce);
        }

        .gallery-card:hover .btn-expand {
          transform: translateY(0);
        }

        .card-info {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          background: rgba(18, 69, 89, 0.3);
          border-radius: 0 0 15px 15px;
        }

        .card-title {
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
          transition: var(--transition-fast);
        }

        .gallery-card:hover .card-title {
          color: var(--primary);
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        /* Skeletons */
        .gallery-card-skeleton {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 16px;
          min-height: 280px;
        }

        .empty-gallery {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.01);
          border-color: var(--border-light);
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .empty-gallery h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }

        .empty-gallery p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
      `}</style>
    </section>
  );
}
