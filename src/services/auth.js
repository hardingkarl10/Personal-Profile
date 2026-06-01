import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseApp, AUTHORIZED_EMAIL } from './firebase';

const auth = firebaseApp ? getAuth(firebaseApp) : null;

// Try popup first; fall back to redirect if popup is blocked.
export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase Auth not configured');
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider);
      return null; // page will reload; result handled via consumeRedirectResult
    }
    throw err;
  }
};

// Call once on app init to consume any pending redirect result.
// Returns the user if a redirect sign-in just completed, null otherwise.
export const consumeRedirectResult = async () => {
  if (!auth) return null;
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
};

export const signOut = async () => {
  if (!auth) return;
  await fbSignOut(auth);
};

export const onAuthChange = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const isAuthorized = (user) => !!user && user.email === AUTHORIZED_EMAIL;

export { AUTHORIZED_EMAIL };
