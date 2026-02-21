import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyChfoslAqcLRu0wwUmYzscmH2fv09mEHpc",
    authDomain: "faculty-evaluation-d1f7a.firebaseapp.com",
    projectId: "faculty-evaluation-d1f7a",
    storageBucket: "faculty-evaluation-d1f7a.firebasestorage.app",
    messagingSenderId: "14666775699",
    appId: "1:14666775699:web:3646019b6b323efc98a166",
    measurementId: "G-H84EMPYFZ4",
}

// Initialize Firebase (prevent re-initialization in dev hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
