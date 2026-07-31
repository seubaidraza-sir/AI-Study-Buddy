import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZKOxtvZCIswkF-Bs7qlWDqeAwup_uElo",
  authDomain: "ai-study-buddy-by-ubaid.firebaseapp.com",
  projectId: "ai-study-buddy-by-ubaid",
  storageBucket: "ai-study-buddy-by-ubaid.firebasestorage.app",
  messagingSenderId: "922576792063",
  appId: "1:922576792063:web:5cfc10eac7152db3f29fca"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;