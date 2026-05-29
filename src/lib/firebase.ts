import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyBSa-tB9zonME4b_oK-xb2l_uXdTNiEodU",
  authDomain: "dwelloecommerce.firebaseapp.com",
  projectId: "dwelloecommerce",
  storageBucket: "dwelloecommerce.firebasestorage.app",
  messagingSenderId: "200279812132",
  appId: "1:200279812132:web:e8851a72a74b20f766d0b1",
  measurementId: "G-J9575S3CXB"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);