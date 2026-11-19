import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'

export const AuthService = {
  async sendPasswordReset(email: string): Promise<{ success: boolean }> {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  },
}
