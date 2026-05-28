import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseApp, AUTHORIZED_EMAIL } from './firebase';

const auth = firebaseApp ? getAuth(firebaseApp) : null;

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase Auth not configured');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
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
