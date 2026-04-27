import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC_2jl9cNVH-s2gmzKbraAAZ0TPnoh6xMo",
  authDomain: "cc-baker-c10a8.firebaseapp.com",
  projectId: "cc-baker-c10a8",
  storageBucket: "cc-baker-c10a8.firebasestorage.app",
  messagingSenderId: "440081535811",
  appId: "1:440081535811:web:eb5d6df2422dee44edd5f6"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
