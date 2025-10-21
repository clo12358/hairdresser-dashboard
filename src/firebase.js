import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// PASTE YOUR CONFIG FROM THE FIREBASE CONSOLE HERE:
const firebaseConfig = {
  apiKey: "AIzaSyBv53EoMvhuACYhMJpIuOp9kIhRSds90a8",
  authDomain: "kathleen-dashboard.firebaseapp.com",
  projectId: "kathleen-dashboard",
  storageBucket: "kathleen-dashboard.firebasestorage.app",
  messagingSenderId: "907995032351",
  appId: "1:907995032351:web:3e3b8da050d6a4e6629e2a",
  measurementId: "G-QVE2D552KC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Ensure we’re signed in anonymously before the app uses Firestore
export function ensureAnonAuth() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) return resolve(user);
      try {
        const cred = await signInAnonymously(auth);
        resolve(cred.user);
      } catch (e) {
        reject(e);
      }
    });
  });
}
