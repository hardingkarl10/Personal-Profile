import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Lightbox from './components/Lightbox';
import UploadPanel from './components/UploadPanel';
import AboutSection from './components/AboutSection';
import BoardGamesSection from './components/BoardGamesSection';
import NavalGame from './components/NavalGame';
import Footer from './components/Footer';
import ChessBackground from './components/ChessBackground';
import IntroScreen from './components/IntroScreen';
import { getGalleryImages, deleteGalleryImage } from './services/storage';
import { onAuthChange, signInWithGoogle, isAuthorized } from './services/auth';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeImageList, setActiveImageList] = useState([]);

  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('intro-seen')
  );

  // 'home' | 'game' — naval combat opens as a fullscreen page
  const [page, setPage] = useState('home');

  const handleIntroComplete = () => {
    sessionStorage.setItem('intro-seen', '1');
    setShowIntro(false);
  };

  const goToGame = () => setPage('game');
  const goHome   = () => setPage('home');

  // Upload Portal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Auth state (drives Login vs Upload button in header)
  const [authUser, setAuthUser] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => onAuthChange(setAuthUser), []);

  const authorized = isAuthorized(authUser);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed', err);
    } finally {
      setSigningIn(false);
    }
  };

  // Fetch images on component mount
  useEffect(() => {
    let active = true;
    
    async function loadData() {
      setLoading(true);
      try {
        const data = await getGalleryImages('gallery');
        if (active) {
          setImages(data);
        }
      } catch (error) {
        console.error('Error loading gallery images:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleSelectImage = (image, currentList) => {
    setSelectedImage(image);
    setActiveImageList(currentList);
  };

  const handleNavigateImage = (newImage) => {
    setSelectedImage(newImage);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
    setActiveImageList([]);
  };

  const handleOpenUpload = () => {
    setIsUploadOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
  };

  const handleDeleteImage = async (image) => {
    if (!authorized) return;
    const confirmed = window.confirm(`Delete "${image.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteGalleryImage(image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      setToast({ show: true, message: `Deleted "${image.title}".` });
      setTimeout(() => setToast({ show: false, message: '' }), 4000);
    } catch (err) {
      console.error('Failed to delete image', err);
      setToast({ show: true, message: `Failed to delete "${image.title}".` });
      setTimeout(() => setToast({ show: false, message: '' }), 4000);
    }
  };

  const handleUploadSuccess = (newImage) => {
    // Add new image directly to top of gallery feed instantly
    setImages((prev) => [newImage, ...prev]);
    
    // Trigger success notification toast
    setToast({ show: true, message: `Successfully published: "${newImage.title}"!` });
    
    // Auto fade toast after 4s
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4000);
  };

  // Fullscreen game page — return early so the homepage isn't rendered behind it
  if (page === 'game') {
    return <NavalGame onBack={goHome} />;
  }

  return (
    <div className="app-root">
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

      {/* Animated Chess Board Ambient Background */}
      <ChessBackground />
      
      {/* Background glow structures */}
      <div className="glow-ambient glow-purple" style={{ top: '5%', left: '5%' }}></div>
      <div className="glow-ambient glow-cyan" style={{ top: '35%', right: '5%' }}></div>
      
      {/* Navigation Header */}
      <Header
        authorized={authorized}
        signingIn={signingIn}
        onLogin={handleLogin}
        onOpenUpload={handleOpenUpload}
        onNavigateGame={goToGame}
      />
      
      {/* Hero Visual Section */}
      <Hero />
      
      {/* Main Gallery Area */}
      <AboutSection />

      <BoardGamesSection />

      <Gallery
        images={images}
        loading={loading}
        onSelectImage={handleSelectImage}
        authorized={authorized}
        onDeleteImage={handleDeleteImage}
      />

      {/* Footer Branding */}
      <Footer />
      
      {/* Admin Upload Portal Drawer */}
      <UploadPanel 
        isOpen={isUploadOpen}
        onClose={handleCloseUpload}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Full-screen Lightbox Modal */}
      {selectedImage && (
        <Lightbox 
          image={selectedImage}
          imageList={activeImageList}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigateImage}
        />
      )}

      {/* Dynamic Toast Notification */}
      {toast.show && (
        <div className="toast-notification glass-card animate-toast">
          <CheckCircle2 className="toast-icon" size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        /* Toast Styling */
        .toast-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1200;
          background: rgba(var(--success-rgb), 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(var(--success-rgb), 0.3);
          color: var(--ink-black);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 10px 30px rgba(var(--success-rgb), 0.25);
        }

        .toast-icon {
          color: var(--ink-black);
          flex-shrink: 0;
        }

        .animate-toast {
          animation: toastSlide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes toastSlide {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
