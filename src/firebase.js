import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// إعدادات المشروع (Configuration)
const firebaseConfig = {
  apiKey: "AIzaSyD3KVbnryeDG3ZdrGORbtV4WytdM03djMI",
  authDomain: "nha-215.firebaseapp.com",
  projectId: "nha-215",
  storageBucket: "nha-215.firebasestorage.app",
  messagingSenderId: "496290907011",
  appId: "1:496290907011:web:a9e2347aef6c75ea52ecb6",
};

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Export Services (عشان نستخدمهم في باقي المشروع)
export const auth = getAuth(app);       // للمصادقة (Login/Signup)
export const db = getFirestore(app);    // لقاعدة البيانات (Jobs Data)
export const storage = getStorage(app); // لرفع الملفات (CVs/Images)

export default app;
