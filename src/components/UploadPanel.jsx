import React, { useState, useRef, useEffect } from 'react';
import { CloudUpload, LogIn, LogOut, CheckCircle2, AlertCircle, X, Image as ImageIcon, Sparkles, ShieldAlert } from 'lucide-react';
import { uploadGalleryImage } from '../services/storage';
import { signInWithGoogle, signOut, onAuthChange, isAuthorized, AUTHORIZED_EMAIL } from '../services/auth';

export default function UploadPanel({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Travel');
  const [aspectRatio, setAspectRatio] = useState('wide');
  const [description, setDescription] = useState('');

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // Status states
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' }); // 'success', 'error'

  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    setStatus({ type: '', message: '' });
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Sign-in failed. Please try again.' });
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setStatus({ type: '', message: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const authorized = isAuthorized(user);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const blobUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(blobUrl);
      setStatus({ type: '', message: '' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const blobUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(blobUrl);
      setStatus({ type: '', message: '' });
    } else {
      setStatus({ type: 'error', message: 'Please drop a valid image file.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorized) {
      setStatus({ type: 'error', message: 'You must be signed in as the admin to upload.' });
      return;
    }
    if (!file) {
      setStatus({ type: 'error', message: 'Please select an image file.' });
      return;
    }
    if (!title.trim()) {
      setStatus({ type: 'error', message: 'Please enter a title.' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', message: '' });

    try {
      const newImage = await uploadGalleryImage(file, {
        title,
        category,
        aspectRatio,
        description,
      });

      setStatus({ type: 'success', message: 'Photo uploaded and GCS metadata attached successfully!' });

      // Reset form fields
      setFile(null);
      setPreviewUrl('');
      setTitle('');
      setDescription('');

      // Delay closing or refresh slightly for user to read success message
      setTimeout(() => {
        onUploadSuccess(newImage);
        onClose();
        setStatus({ type: '', message: '' });
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to upload photo. Please check your storage bucket configs.' });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className="upload-drawer-backdrop" onClick={onClose}>
      <div className="upload-drawer glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>

        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Sparkles className="drawer-glow-icon" />
            <div>
              <h3>Admin Upload Portal</h3>
              <p>Stream photos directly into Google Cloud Storage</p>
            </div>
          </div>
          <button className="btn-close-drawer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Status Messages */}
        {status.message && (
          <div className={`status-banner ${status.type}`}>
            {status.type === 'success' ? (
              <CheckCircle2 size={16} className="status-icon" />
            ) : (
              <AlertCircle size={16} className="status-icon" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {authLoading ? (
          <div className="auth-gate">
            <div className="spinner" />
            <p>Checking sign-in…</p>
          </div>
        ) : !user ? (
          <div className="auth-gate">
            <ShieldAlert className="gate-icon" size={32} />
            <h4>Admin sign-in required</h4>
            <p>Uploads are restricted to the site owner. Sign in with Google to continue.</p>
            <button
              type="button"
              className="btn-glow btn-submit"
              onClick={handleSignIn}
              disabled={signingIn}
            >
              {signingIn ? (
                <><div className="spinner" /> Opening Google…</>
              ) : (
                <><LogIn size={16} /> Sign in with Google</>
              )}
            </button>
          </div>
        ) : !authorized ? (
          <div className="auth-gate">
            <ShieldAlert className="gate-icon error" size={32} />
            <h4>Not authorized</h4>
            <p>
              You're signed in as <strong>{user.email}</strong>, but uploads are restricted
              to <strong>{AUTHORIZED_EMAIL}</strong>.
            </p>
            <button type="button" className="btn-cancel" onClick={handleSignOut}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="drawer-form">
          <div className="form-grid">

            {/* Left Side: File Dropper & Preview */}
            <div className="form-left">
              <div
                className={`dropzone ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {previewUrl ? (
                  <div className="preview-container">
                    <img src={previewUrl} alt="Preview" className="image-preview" />
                    <div className="preview-overlay">
                      <ImageIcon size={20} />
                      <span>Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <CloudUpload className="upload-icon" size={40} />
                    <h4>Drag & drop photo here</h4>
                    <p>or click to browse local files</p>
                    <span className="file-hint">Supports JPG, PNG, WEBP</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Form Inputs */}
            <div className="form-right">
              <div className="input-group">
                <label>Photo Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kyoto Golden Pavilion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={uploading}
                  >
                    <option value="Travel">Travel</option>
                    <option value="Photography">Photography</option>
                    <option value="Board Games">Board Games</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    disabled={uploading}
                  >
                    <option value="wide">Wide (Landscape)</option>
                    <option value="portrait">Tall (Portrait)</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe your shot, gear used, or background context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                />
              </div>

              {/* Signed-in admin badge */}
              <div className="input-group auth-group">
                <label className="lock-label">
                  <CheckCircle2 size={12} className="lock-icon" /> Signed in
                </label>
                <div className="auth-row">
                  <span className="auth-email">{user?.email}</span>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={handleSignOut}
                    disabled={uploading}
                  >
                    <LogOut size={12} /> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-glow btn-submit"
              disabled={uploading || !file || !title}
            >
              {uploading ? (
                <>
                  <div className="spinner" /> Streaming to GCS...
                </>
              ) : (
                <>
                  <CloudUpload size={16} /> Publish Photo
                </>
              )}
            </button>
          </div>
        </form>
        )}

      </div>

      <style>{`
        .upload-drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 900;
          background: rgba(0, 18, 25, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .upload-drawer {
          width: 100%;
          max-width: 850px;
          margin-bottom: 2rem;
          background: rgba(18, 69, 89, 0.95);
          border-color: var(--border-glow);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(var(--primary-rgb), 0.25);
          transform: translateY(0);
          max-height: 90vh;
          overflow-y: auto;
        }

        @media (max-width: 900px) {
          .upload-drawer {
            max-width: 100%;
            margin-bottom: 0;
            border-radius: 20px 20px 0 0;
            padding: 1.5rem;
          }
        }

        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .drawer-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .drawer-glow-icon {
          color: var(--secondary);
          width: 24px;
          height: 24px;
        }

        .drawer-header h3 {
          font-size: 1.25rem;
          font-family: var(--font-display);
        }

        .drawer-header p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .btn-close-drawer {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-fast);
          padding: 0.25rem;
          border-radius: 50%;
        }

        .btn-close-drawer:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Status banner */
        .status-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .status-banner.success {
          background: rgba(var(--success-rgb), 0.08);
          border: 1px solid rgba(var(--success-rgb), 0.2);
          color: var(--success-light);
        }

        .status-banner.error {
          background: rgba(var(--error-rgb), 0.08);
          border: 1px solid rgba(var(--error-rgb), 0.2);
          color: var(--error-light);
        }

        /* Form grids */
        .drawer-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* Dropzone */
        .dropzone {
          border: 2px dashed rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.01);
          transition: var(--transition-fast);
          height: 100%;
          min-height: 200px;
          overflow: hidden;
        }

        .dropzone:hover, .dropzone.has-file:hover {
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.03);
        }

        .dropzone-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .upload-icon {
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          transition: var(--transition-fast);
        }

        .dropzone:hover .upload-icon {
          color: var(--primary);
          transform: translateY(-2px);
        }

        .dropzone h4 {
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .dropzone p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .file-hint {
          font-size: 0.7rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        /* Image Previews */
        .preview-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(18, 69, 89, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          opacity: 0;
          color: var(--text-primary);
          font-size: 0.85rem;
          transition: var(--transition-fast);
        }

        .preview-container:hover .preview-overlay {
          opacity: 1;
        }

        /* Inputs */
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        input[type="text"], input[type="password"], select, textarea {
          background: var(--ink-black);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 0.75rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }

        input[type="text"]:focus, input[type="password"]:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.15);
        }

        /* Signed-in badge */
        .auth-group {
          background: rgba(var(--accent-rgb), 0.03);
          border: 1px solid rgba(var(--accent-rgb), 0.08);
          padding: 0.85rem;
          border-radius: 8px;
          margin-bottom: 0;
        }

        .lock-label {
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .lock-icon {
          color: var(--accent);
        }

        .auth-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .auth-email {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-family: var(--font-mono, monospace);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-text {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: var(--transition-fast);
        }

        .btn-text:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Auth gate (sign-in / wrong-account screens) */
        .auth-gate {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 0.75rem;
        }

        .auth-gate h4 {
          font-size: 1.05rem;
          color: var(--text-primary);
          margin: 0;
        }

        .auth-gate p {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 380px;
          margin: 0 0 0.5rem;
        }

        .auth-gate .gate-icon {
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .auth-gate .gate-icon.error {
          color: var(--error-light, #f87171);
        }

        /* Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 1.5rem;
          margin-top: 0.5rem;
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none !important;
          filter: none !important;
          transform: none !important;
        }

        /* Spinner */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--text-primary);
          animation: spin 1s infinite linear;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
