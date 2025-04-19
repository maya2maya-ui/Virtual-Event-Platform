
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUxw-1HLsZcCl7QT9-UM19LyqZ0xBrLO4", // Example public API key
  authDomain: "virtual-event-platform-demo.firebaseapp.com",
  projectId: "virtual-event-platform-demo",
  storageBucket: "virtual-event-platform-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
