import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "Your Api key",
  authDomain: "Ecommerce.firebaseapp.com",
  projectId: "Ecommerce",
  storageBucket: "Ecommerce.firebasestorage.app",
  messagingSenderId: "Your senders ID",
  appId: "1:76586969007621:web:9913271a252534a3c4e6c",
  measurementId: "Your Measurement ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 
