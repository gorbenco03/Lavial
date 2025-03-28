import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDFXd-x9huuBfbTnO0egpHpMrMm9lmhPXg",
  authDomain: "lavial-2105a.firebaseapp.com",
  projectId: "lavial-2105a",
  storageBucket: "lavial-2105a.firebasestorage.app",
  messagingSenderId: "548188695563",
  appId: "1:548188695563:web:00fb26ceb729a75f51ab0e",
  measurementId: "G-598XNRLY79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inițializează serviciul de autentificare
export const auth = getAuth(app);