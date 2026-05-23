import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL, getMetadata, uploadBytes, updateMetadata } from 'firebase/storage';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase keys are fully set up
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket
);

let storage = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    storage = getStorage(app);
    console.log('Successfully initialized Firebase Storage client.');
  } catch (error) {
    console.error('Failed to initialize Firebase app:', error);
  }
} else {
  console.log('Firebase credentials not detected. Operating in Local Mock Mode.');
}

// --------------------------------------------------------------------------
// CURATED PERSONALIZED MOCK IMAGES (Travel, Board Games, Photography)
// --------------------------------------------------------------------------
const MOCK_IMAGES = [
  {
    id: 'mock-1',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    title: 'Red Rock Canyon Pass',
    category: 'Travel',
    description: 'Roadtrip through Utah - capturing the vast sandstone canyon formations during high noon.',
    author: 'Karl',
    aspectRatio: 'wide',
    date: '2026-04-12',
  },
  {
    id: 'mock-2',
    url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80',
    title: 'Dice & Strategy',
    category: 'Board Games',
    description: 'Focus macro shot of custom wooden board game meeples and polyhedral dice on a canvas map.',
    author: 'Karl',
    aspectRatio: 'portrait',
    date: '2026-04-15',
  },
  {
    id: 'mock-3',
    url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    title: 'Misty Woodland Path',
    category: 'Photography',
    description: 'Deep forest pathway enveloped in early morning light fog, emphasizing high-contrast monochrome tones.',
    author: 'Karl',
    aspectRatio: 'portrait',
    date: '2026-04-22',
  },
  {
    id: 'mock-4',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    title: 'Bioluminescent Shoreline',
    category: 'Travel',
    description: 'Long-exposure seascape capturing soft neon waves glowing blue under a starry sky.',
    author: 'Karl',
    aspectRatio: 'wide',
    date: '2026-05-02',
  },
  {
    id: 'mock-5',
    url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80',
    title: 'Tabletop Championship',
    category: 'Board Games',
    description: 'Mid-game perspective shot of a complex Euro-style board game with detailed hexagonal terrain blocks.',
    author: 'Karl',
    aspectRatio: 'wide',
    date: '2026-05-10',
  },
  {
    id: 'mock-6',
    url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80',
    title: 'Golden Hour Reflection',
    category: 'Photography',
    description: 'Reflections of architectural windows casting warm grids on still rainwater, captured with a prime 50mm lens.',
    author: 'Karl',
    aspectRatio: 'square',
    date: '2026-05-18',
  },
  {
    id: 'mock-7',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    title: 'Alpine Lake Mirror',
    category: 'Travel',
    description: 'A perfect crystal reflections of rugged snowy peaks in a still turquoise mountain lake.',
    author: 'Karl',
    aspectRatio: 'wide',
    date: '2026-05-20',
  },
  {
    id: 'mock-8',
    url: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&w=1200&q=80',
    title: 'Vintage Chess Setup',
    category: 'Board Games',
    description: 'Cinematic shallow-depth-of-field shot of a wooden chess board capturing light off a side window.',
    author: 'Karl',
    aspectRatio: 'portrait',
    date: '2026-05-22',
  }
];

// Helper to extract a friendly title from GCS file path
const cleanFileName = (filePath) => {
  const base = filePath.split('/').pop().split('.').shift();
  return base
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Helper to assign a category based on name
const assignCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('game') || lower.includes('dice') || lower.includes('table') || lower.includes('play')) return 'Board Games';
  if (lower.includes('travel') || lower.includes('trip') || lower.includes('lake') || lower.includes('canyon') || lower.includes('mountain')) return 'Travel';
  return 'Photography'; // Default
};

/**
 * Fetches all images from Firebase Google Cloud Storage, or falls back to curated mock images.
 * @param {string} folderPath - Optional path inside the bucket (e.g. 'gallery/')
 * @returns {Promise<Array>} List of image objects
 */
export const getGalleryImages = async (folderPath = '') => {
  if (!isFirebaseConfigured || !storage) {
    // Simulate brief API delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_IMAGES;
  }

  try {
    const listRef = ref(storage, folderPath);
    const result = await listAll(listRef);

    const imagePromises = result.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      let metadata = {};
      try {
        metadata = await getMetadata(itemRef);
      } catch (e) {
        // Metadata not available, graceful fallback
      }

      const title = metadata.customMetadata?.title || cleanFileName(itemRef.name);
      const category = metadata.customMetadata?.category || assignCategory(itemRef.name);
      const description = metadata.customMetadata?.description || `Image from Cloud Storage: ${itemRef.name}`;
      const author = metadata.customMetadata?.author || 'Karl';
      const date = metadata.timeCreated ? new Date(metadata.timeCreated).toISOString().split('T')[0] : 'Cloud Asset';

      return {
        id: itemRef.fullPath,
        url,
        title,
        category,
        description,
        author,
        aspectRatio: metadata.customMetadata?.aspectRatio || 'wide',
        date,
      };
    });

    const images = await Promise.all(imagePromises);
    
    if (images.length === 0) {
      console.warn('GCS Bucket is empty. Showing mock images as fallback.');
      return MOCK_IMAGES;
    }

    return images;
  } catch (error) {
    console.error('Error fetching images from Firebase Storage:', error);
    return MOCK_IMAGES;
  }
};

/**
 * Uploads an image file to Firebase Storage and attaches custom GCS metadata.
 * @param {File} file - The file binary to upload
 * @param {Object} fields - Form metadata (title, category, description, aspectRatio)
 * @returns {Promise<Object>} Uploaded image data structure
 */
export const uploadGalleryImage = async (file, fields) => {
  // Sanitize filename to prevent bucket issues
  const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = `gallery/${cleanName}`;

  if (!isFirebaseConfigured || !storage) {
    // Simulated Upload for Mock Mode
    console.log('Simulating GCS upload in Local Mock Mode...');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Create a local blob URL so the uploaded file actually renders in the UI!
    const objectUrl = URL.createObjectURL(file);
    
    return {
      id: `mock-${Date.now()}`,
      url: objectUrl,
      title: fields.title,
      category: fields.category,
      description: fields.description || 'Simulated file upload in local environment.',
      author: 'Karl (Demo)',
      aspectRatio: fields.aspectRatio || 'wide',
      date: new Date().toISOString().split('T')[0]
    };
  }

  // Upload to GCS Bucket
  const fileRef = ref(storage, filePath);
  
  // Custom metadata to pass into Google Document/Cloud Storage
  const metadata = {
    contentType: file.type,
    customMetadata: {
      title: fields.title,
      category: fields.category,
      description: fields.description || '',
      aspectRatio: fields.aspectRatio || 'wide',
      author: 'Karl',
    }
  };

  // 1. Upload bytes
  const uploadResult = await uploadBytes(fileRef, file, { contentType: file.type });
  
  // 2. Attach GCS custom metadata
  await updateMetadata(fileRef, metadata);
  
  // 3. Fetch public URL
  const downloadUrl = await getDownloadURL(fileRef);

  return {
    id: filePath,
    url: downloadUrl,
    title: fields.title,
    category: fields.category,
    description: fields.description,
    author: 'Karl',
    aspectRatio: fields.aspectRatio,
    date: new Date().toISOString().split('T')[0]
  };
};
