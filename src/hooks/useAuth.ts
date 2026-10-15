import { useAuthStore } from '../store/auth.store'

export function useAuth() {
  const store = useAuthStore()
  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    updateUser: store.updateUser,
    checkAuth: store.checkAuth,
  }
}
