import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  getDocFromServer,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatSession, ChatMessage } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must pass database ID as second argument to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Firestore Error Handling conforming strictly to Firebase Skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
}

// Auth Actions
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sync user profile to Firestore
    const userRef = doc(db, 'users', user.uid);
    const path = `users/${user.uid}`;
    try {
      const userDoc = await getDoc(userRef);
      const existingData = userDoc.exists() ? userDoc.data() : null;
      await setDoc(userRef, {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString(),
        createdAt: existingData?.createdAt || new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    
    return user;
  } catch (err: unknown) {
    console.error('Sign-in error:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Cloud Synchronization for Sessions
export async function saveSessionToCloud(userId: string, session: ChatSession): Promise<void> {
  if (!userId || !session || !session.id) return;
  const path = `users/${userId}/sessions/${session.id}`;
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', session.id);
    await setDoc(sessionRef, {
      id: session.id,
      userId,
      title: (session.title || 'নতুন চ্যাট').slice(0, 200),
      mode: session.mode || 'general',
      createdAt: typeof session.createdAt === 'number' ? session.createdAt : (Date.parse(String(session.createdAt)) || Date.now()),
      updatedAt: typeof session.updatedAt === 'number' ? session.updatedAt : (Date.parse(String(session.updatedAt)) || Date.now()),
    }, { merge: true });

    // Save individual messages in subcollection
    if (Array.isArray(session.messages)) {
      for (const msg of session.messages) {
        if (!msg.id) continue;
        const msgPath = `users/${userId}/sessions/${session.id}/messages/${msg.id}`;
        try {
          const msgRef = doc(db, 'users', userId, 'sessions', session.id, 'messages', msg.id);
          await setDoc(msgRef, {
            id: msg.id,
            sessionId: session.id,
            userId,
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: (msg.text || '').slice(0, 50000),
            timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Date.now(),
            citations: msg.groundingChunks ? msg.groundingChunks.map(c => c.web?.title || '').filter(Boolean).slice(0, 50) : [],
          }, { merge: true });
        } catch (msgErr) {
          handleFirestoreError(msgErr, OperationType.WRITE, msgPath);
        }
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function loadSessionsFromCloud(userId: string): Promise<ChatSession[]> {
  const path = `users/${userId}/sessions`;
  try {
    const sessionsCol = collection(db, 'users', userId, 'sessions');
    const sessionsSnapshot = await getDocs(sessionsCol);
    const sessions: ChatSession[] = [];

    for (const sessionDoc of sessionsSnapshot.docs) {
      const sData = sessionDoc.data();
      const sessionId = sessionDoc.id;

      // Fetch messages for this session
      const messagesCol = collection(db, 'users', userId, 'sessions', sessionId, 'messages');
      const q = query(messagesCol, orderBy('timestamp', 'asc'));
      const messagesSnapshot = await getDocs(q);

      const messages: ChatMessage[] = messagesSnapshot.docs.map(mDoc => {
        const mData = mDoc.data();
        return {
          id: mData.id || mDoc.id,
          role: mData.role,
          text: mData.content || '',
          timestamp: Number(mData.timestamp) || Date.now(),
        };
      });

      sessions.push({
        id: sessionId,
        title: sData.title || 'কথোপকথন',
        mode: sData.mode || 'general',
        enableSearch: false,
        createdAt: typeof sData.createdAt === 'number' ? sData.createdAt : (Date.parse(sData.createdAt) || Date.now()),
        updatedAt: typeof sData.updatedAt === 'number' ? sData.updatedAt : (Date.parse(sData.updatedAt) || Date.now()),
        messages,
      });
    }

    return sessions.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteSessionFromCloud(userId: string, sessionId: string): Promise<void> {
  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
    await deleteDoc(sessionRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
