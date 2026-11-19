import type { User, UserRole } from '../types'

interface LoginResponse {
  token: string
  user: User
}

interface RegisterPayload {
  nombre: string
  email: string
  password: string
  rol: UserRole
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const AuthService = {
  async login(email: string, _password: string): Promise<LoginResponse> {
    await delay(800)
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: '1',
        nombre: 'Fabiana Castro',
        email,
        telefono: '+51 987 654 321',
        rol: 'cliente',
        puntos: 4820,
        nivel: 'Oro',
      },
    }
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    await delay(800)
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: '2',
        nombre: payload.nombre,
        email: payload.email,
        rol: payload.rol,
        puntos: 0,
        nivel: 'Bronce',
      },
    }
  },

  async sendPasswordReset(_email: string): Promise<{ success: boolean }> {
    await delay(600)
    return { success: true }
  },

  async resetPassword(_code: string, _newPassword: string): Promise<{ success: boolean }> {
    await delay(600)
    return { success: true }
  },
}
