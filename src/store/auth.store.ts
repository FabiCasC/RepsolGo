import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth, db } from '../lib/firebase'
import type { User, NivelFidelizacion } from '../types'

const SESSION_KEY = 'repsolgo_session'

interface StoredSession {
  uid: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string, rol?: 'cliente' | 'operario') => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  checkAuth: () => void
}

async function fetchUserProfile(uid: string, email: string): Promise<User> {
  const docSnap = await getDoc(doc(db, 'users', uid))
  const data = docSnap.exists() ? docSnap.data() : {}
  return {
    id: uid,
    nombre: data.nombre ?? 'Usuario',
    email: data.email ?? email,
    telefono: data.telefono,
    rol: data.rol ?? 'cliente',
    puntos: data.puntos ?? 0,
    nivel: (data.nivel as NivelFidelizacion) ?? 'Bronce',
    avatar: data.avatar,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const user = await fetchUserProfile(credential.user.uid, email)
      const session: StoredSession = { uid: credential.user.uid, email }
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session))
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  register: async (nombre: string, email: string, password: string, rol: 'cliente' | 'operario' = 'cliente') => {
    set({ isLoading: true })
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = credential.user.uid
      const userData = {
        nombre,
        email,
        rol,
        puntos: 0,
        nivel: 'Bronce' as NivelFidelizacion,
      }
      await setDoc(doc(db, 'users', uid), {
        ...userData,
        createdAt: serverTimestamp(),
      })
      const session: StoredSession = { uid, email }
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session))
      const user: User = { id: uid, ...userData }
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    await signOut(auth)
    await AsyncStorage.removeItem(SESSION_KEY)
    set({ user: null, isAuthenticated: false })
  },

  updateUser: async (data: Partial<User>) => {
    const currentUser = get().user
    if (!currentUser) return
    const userRef = doc(db, 'users', currentUser.id)
    const firestoreData: { [key: string]: string | number | undefined } = {}
    if (data.nombre !== undefined) firestoreData.nombre = data.nombre
    if (data.telefono !== undefined) firestoreData.telefono = data.telefono
    if (data.avatar !== undefined) firestoreData.avatar = data.avatar
    if (data.puntos !== undefined) firestoreData.puntos = data.puntos
    if (data.nivel !== undefined) firestoreData.nivel = data.nivel
    if (Object.keys(firestoreData).length > 0) {
      await updateDoc(userRef, firestoreData)
    }
    const updated: User = { ...currentUser, ...data }
    set({ user: updated })
  },

  checkAuth: () => {
    set({ isLoading: true })
    // First try to restore from AsyncStorage (Firebase inMemory doesn't persist)
    AsyncStorage.getItem(SESSION_KEY)
      .then(async (sessionJson) => {
        if (sessionJson) {
          try {
            const session: StoredSession = JSON.parse(sessionJson)
            const user = await fetchUserProfile(session.uid, session.email)
            set({ user, isAuthenticated: true, isLoading: false })
            return
          } catch {
            await AsyncStorage.removeItem(SESSION_KEY)
          }
        }
        // Fall back to Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const user = await fetchUserProfile(firebaseUser.uid, firebaseUser.email ?? '')
              const session: StoredSession = { uid: firebaseUser.uid, email: firebaseUser.email ?? '' }
              await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session))
              set({ user, isAuthenticated: true, isLoading: false })
            } catch {
              set({ user: null, isAuthenticated: false, isLoading: false })
            }
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
          unsubscribe()
        })
      })
      .catch(() => {
        set({ user: null, isAuthenticated: false, isLoading: false })
      })
  },
}))
