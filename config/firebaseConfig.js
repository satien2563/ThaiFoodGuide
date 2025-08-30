// config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_RSufbS9Cap9ITA8wxaL1LuM6GQFRiAI",
  authDomain: "thaifoodguide-f109f.firebaseapp.com",
  projectId: "thaifoodguide-f109f",
  storageBucket: "thaifoodguide-f109f.appspot.com", // ✅ แนะนำให้ใช้ appspot.com
  messagingSenderId: "97863505662",
  appId: "1:97863505662:web:3436a716291b61e6a4f7af"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
