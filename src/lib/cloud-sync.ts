import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';

// Config from the Firebase console (Project settings > Your apps).
// This value is safe to keep in the client bundle — Firebase protects
// data with Security Rules, not by hiding this config.
const firebaseConfig = {
  apiKey: 'AIzaSyCIApb-lGkBSy5ZT4R25g1BTmjgQcrjbOQ',
  authDomain: 'training-team-4b6a5.firebaseapp.com',
  projectId: 'training-team-4b6a5',
  storageBucket: 'training-team-4b6a5.firebasestorage.app',
  messagingSenderId: '334091832787',
  appId: '1:334091832787:web:214b45b59513373c35b326',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// The entire local database is mirrored into a single document.
const DOC_REF = doc(firestore, 'sync', 'keeta-training-team-db-v1');

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let lastSyncedJson = '';

/**
 * Push the current database up to Firestore. Debounced so rapid edits
 * (e.g. a bulk import) don't fire one write per change.
 */
export function pushToCloud(db: unknown) {
  const json = JSON.stringify(db);
  if (json === lastSyncedJson) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    lastSyncedJson = json;
    setDoc(DOC_REF, { payload: json, updatedAt: Date.now() }).catch((err) => {
      console.error('Cloud sync push failed:', err);
    });
  }, 800);
}

/** One-time read of whatever is currently in the cloud, if anything. */
export async function pullFromCloud(): Promise<string | null> {
  try {
    const snap = await getDoc(DOC_REF);
    if (!snap.exists()) return null;
    return (snap.data().payload as string | undefined) ?? null;
  } catch (err) {
    console.error('Cloud sync pull failed:', err);
    return null;
  }
}

/**
 * Subscribe to live updates from teammates. Skips the local "optimistic"
 * echo of our own writes (hasPendingWrites) so we only react to changes
 * that actually came from the server (i.e. from someone else, or our own
 * write once confirmed).
 */
export function subscribeToCloud(onRemoteChange: (json: string) => void) {
  return onSnapshot(
    DOC_REF,
    (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      if (!snap.exists()) return;
      const json = snap.data().payload as string | undefined;
      if (!json || json === lastSyncedJson) return;
      lastSyncedJson = json;
      onRemoteChange(json);
    },
    (err) => {
      console.error('Cloud sync subscription error:', err);
    },
  );
}
