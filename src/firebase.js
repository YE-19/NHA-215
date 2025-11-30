// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ أضف السطر ده
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3KVbnryeDG3ZdrGORbtV4WytdM03djMI",
  authDomain: "nha-215.firebaseapp.com",
  projectId: "nha-215",
  storageBucket: "nha-215.firebasestorage.app",
  messagingSenderId: "496290907011",
  appId: "1:496290907011:web:a9e2347aef6c75ea52ecb6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app);
export default app;
