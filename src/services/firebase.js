import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCdfNovpT6QHygV-9_lgPq6HNLT83wkGCM",
  authDomain: "vapexindia-x.firebaseapp.com",
  projectId: "vapexindia-x",
  storageBucket: "vapexindia-x.firebasestorage.app",
  messagingSenderId: "790169007621",
  appId: "1:790169007621:web:9913271a5569204a3c4e6c",
  measurementId: "G-Y3QCF394Y5"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 