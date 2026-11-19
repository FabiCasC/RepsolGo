// Importar directamente desde los bundles React Native de Firebase
// Evita que Metro resuelva al bundle browser por falta del campo react-native
// en los subpaquetes de firebase/*
import { initializeApp, getApps, getApp } from '@firebase/app'
import { getFirestore } from '@firebase/firestore'
import { initializeAuth, getReactNativePersistence, getAuth } from '@firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)
export default app

let _auth: ReturnType<typeof getAuth> | null = null

export function getFirebaseAuth() {
  if (_auth) return _auth
  try {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('already')) {
      _auth = getAuth(app)
    } else {
      throw e
    }
  }
  return _auth!
}
