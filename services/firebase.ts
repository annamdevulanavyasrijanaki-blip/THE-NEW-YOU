
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc2NUDzvq-FrOxoUDeDNHARxs4BCm5Uc4",
  authDomain: "the-new-you-4b2e7.firebaseapp.com",
  projectId: "the-new-you-4b2e7",
  storageBucket: "the-new-you-4b2e7.firebasestorage.app",
  messagingSenderId: "311427576882",
  appId: "1:311427576882:web:0f441098699a155cf7f82b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize and export Firestore
export const db = getFirestore(app);
// Initialize and export Auth
export const auth = getAuth(app);
