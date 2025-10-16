import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC-6QlxCJlwIfN6f4F5fwvqNGh1A0vPGTA",
  authDomain: "konttazen.firebaseapp.com",
  projectId: "konttazen",
  storageBucket: "konttazen.firebasestorage.app",
  messagingSenderId: "272735310265",
  appId: "1:272735310265:web:7908cf3131a905150c6668",
  measurementId: "G-G4L40BGQ2Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics };