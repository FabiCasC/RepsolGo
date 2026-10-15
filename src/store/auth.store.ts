import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { sendRecoveryEmail } from '../services/email.service';

export type UserRole = 'cliente' | 'operario';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  photo?: string;
  notifPush: boolean;
  notifEmail: boolean;
}

interface Account {
  email: string;
  password: string;
  profile: UserProfile;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  biometricEnabled: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPw: string, newPw: string) => Promise<void>;
  requestRecoveryCode: (email: string) => Promise<string>;
  validateRecoveryCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPw: string) => Promise<void>;
  setBiometric: (enabled: boolean) => Promise<void>;
  loadSession: () => Promise<void>;
}

const ACCOUNTS_KEY = 'repsol_accounts';
const TOKEN_KEY = 'repsol_token';
const USER_KEY = 'repsol_user';
const BIOMETRIC_KEY = 'repsol_biometric';

const DEFAULT_ACCOUNTS: Account[] = [
  {
    email: 'fabiana.castroc22@gmail.com',
    password: '123456',
    profile: {
      id: '1',
      name: 'Fabiana Castro',
      email: 'fabiana.castroc22@gmail.com',
      phone: '987654321',
      role: 'cliente',
      notifPush: true,
      notifEmail: false,
    },
  },
  {
    email: 'operario@repsol.com',
    password: '123456',
    profile: {
      id: '2',
      name: 'Carlos Operario',
      email: 'operario@repsol.com',
      phone: '999000111',
      role: 'operario',
      notifPush: true,
      notifEmail: false,
    },
  },
];

async function getAccounts(): Promise<Account[]> {
  try {
    const raw = await SecureStore.getItemAsync(ACCOUNTS_KEY);
    if (!raw) {
      await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

async function saveAccounts(accounts: Account[]) {
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// In-memory recovery codes (mock)
const recoveryCodes: Record<string, string> = {};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  biometricEnabled: false,
  isLoading: false,

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userRaw = await SecureStore.getItemAsync(USER_KEY);
      const biometric = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      if (token && userRaw) {
        set({
          token,
          user: JSON.parse(userRaw),
          biometricEnabled: biometric === 'true',
        });
      }
    } catch {}
  },

  login: async (email, password) => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 600));
    const accounts = await getAccounts();
    const account = accounts.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    );
    if (!account) {
      set({ isLoading: false });
      throw new Error('Correo o contraseña incorrectos');
    }
    const token = `mock-token-${Date.now()}`;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(account.profile));
    set({ user: account.profile, token, isLoading: false });
  },

  register: async (name, email, phone, password, role) => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 600));
    const accounts = await getAccounts();
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      set({ isLoading: false });
      throw new Error('Este correo ya está registrado');
    }
    const profile: UserProfile = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role,
      notifPush: true,
      notifEmail: false,
    };
    accounts.push({ email, password, profile });
    await saveAccounts(accounts);
    const token = `mock-token-${Date.now()}`;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile));
    set({ user: profile, token, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, token: null });
  },

  updateProfile: async (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    const accounts = await getAccounts();
    const idx = accounts.findIndex(a => a.email.toLowerCase() === current.email.toLowerCase());
    if (idx >= 0) {
      accounts[idx].profile = updated;
      await saveAccounts(accounts);
    }
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated));
    set({ user: updated });
  },

  changePassword: async (currentPw, newPw) => {
    const current = get().user;
    if (!current) return;
    const accounts = await getAccounts();
    const idx = accounts.findIndex(a => a.email.toLowerCase() === current.email.toLowerCase());
    if (idx < 0 || accounts[idx].password !== currentPw) {
      throw new Error('Contraseña actual incorrecta');
    }
    accounts[idx].password = newPw;
    await saveAccounts(accounts);
  },

  requestRecoveryCode: async (email) => {
    const accounts = await getAccounts();
    if (!accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('No existe una cuenta con ese correo');
    }
    // Código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    recoveryCodes[email.toLowerCase()] = code;
    try {
      await sendRecoveryEmail(email.toLowerCase(), code);
    } catch (err: any) {
      // Si EmailJS no está configurado, caemos en modo demo (mostramos código en pantalla)
      if (err?.message === 'EMAIL_NOT_CONFIGURED') {
        return code; // el caller mostrará el código en un Alert
      }
      throw new Error('No se pudo enviar el correo. Intenta de nuevo.');
    }
    return code;
  },

  validateRecoveryCode: async (email, code) => {
    return recoveryCodes[email.toLowerCase()] === code;
  },

  resetPassword: async (email, code, newPw) => {
    const valid = recoveryCodes[email.toLowerCase()] === code;
    if (!valid) throw new Error('Código inválido');
    const accounts = await getAccounts();
    const idx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
    if (idx >= 0) {
      accounts[idx].password = newPw;
      await saveAccounts(accounts);
    }
    delete recoveryCodes[email.toLowerCase()];
  },

  setBiometric: async (enabled) => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? 'true' : 'false');
    set({ biometricEnabled: enabled });
  },
}));
