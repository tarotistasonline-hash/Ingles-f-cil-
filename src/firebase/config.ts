import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App as singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore targeting the provisioned custom database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connectivity validation constraint
let isConnectionVerified = false;
export async function verifyFirestoreConnection(): Promise<boolean> {
  if (isConnectionVerified) return true;
  try {
    await getDocFromServer(doc(db, 'site_metrics', 'health_check'));
    isConnectionVerified = true;
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or unreachable, using local fallback.');
      return false;
    }
    // Any other response (like permission denied or document not found) confirms server connectivity
    isConnectionVerified = true;
    return true;
  }
}
