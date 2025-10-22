// firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

// 🧩 Your Firebase Config (from the Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBv53EoMvhuACYhMJpIuOp9kIhRSds90a8",
  authDomain: "kathleen-dashboard.firebaseapp.com",
  projectId: "kathleen-dashboard",
  storageBucket: "kathleen-dashboard.appspot.com", // ✅ fixed typo
  messagingSenderId: "907995032351",
  appId: "1:907995032351:web:3e3b8da050d6a4e6629e2a",
  measurementId: "G-QVE2D552KC",
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Firestore
export const db = getFirestore(app);

// 👤 Auth (with anonymous sign-in helper)
export const auth = getAuth(app);
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

// 🔔 Firebase Cloud Messaging
let messaging;

// Check if the browser supports FCM
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
    console.log("✅ Firebase Messaging initialized");
  } else {
    console.warn("⚠️ This browser does not support notifications or FCM.");
  }
});

// ✅ Request notification permission + get token
export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn("Messaging not initialized yet.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BJuqwfrsEwigalcFafrCxFINgBXqY4Fvm-kXEU3v8ot6DG_UvGnyYansGvZs4vmJaDdREh6B9Htdy0G0oTSR-xY", // 🔑 Your VAPID key
      });
      console.log("✅ FCM Token:", token);
      return token;
    } else {
      console.warn("❌ Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("🔥 Error getting FCM token:", error);
    return null;
  }
}

// 💬 Listen for messages when app is open
export function listenForMessages() {
  if (!messaging) {
    console.warn("Messaging not initialized.");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("📩 Message received: ", payload);
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/favicon.ico",
    });
  });
}

// ✅ Export messaging reference safely (so imports work)
export { messaging };
