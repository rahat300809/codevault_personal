import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDcMLXULXig9s9o8JIplY3crSm_LScPqQ4",
  authDomain: "snippet300809.firebaseapp.com",
  projectId: "snippet300809",
  storageBucket: "snippet300809.firebasestorage.app",
  messagingSenderId: "680220026208",
  appId: "1:680220026208:web:f976ac316c6ad0fe242a05",
  measurementId: "G-VB2B8VV2DB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache for offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// Initialize Analytics if supported (browser environment)
isSupported().then(yes => yes && getAnalytics(app));

export default app;
