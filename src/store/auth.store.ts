import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import type { User, UserRole } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  setToken: (token: string | null) => void
  checkAuth: () => Promise<void>
}

const MOCK_USER: User = {
  id: '1',
  nombre: 'Fabiana Castro',
  email: 'fabiana.castroc22@gmail.com',
  telefono: '+51 987 654 321',
  rol: 'cliente',
  puntos: 4820,
  nivel: 'Oro',
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 800))
    const token = 'mock_token_' + Date.now()
    const user = { ...MOCK_USER, email }
    await SecureStore.setItemAsync('auth_token', token)
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token')
    await SecureStore.deleteItemAsync('auth_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (data: Partial<User>) => {
    const currentUser = get().user
    if (currentUser) {
      const updated = { ...currentUser, ...data }
      set({ user: updated })
      SecureStore.setItemAsync('auth_user', JSON.stringify(updated)).catch(console.error)
    }
  },

  setToken: (token: string | null) => {
    set({ token })
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token')
      const userJson = await SecureStore.getItemAsync('auth_user')
      if (token && userJson) {
        const user = JSON.parse(userJson) as User
        set({ token, user, isAuthenticated: true })
      }
    } catch {
      set({ token: null, user: null, isAuthenticated: false })
    }
  },
}))
