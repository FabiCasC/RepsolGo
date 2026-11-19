import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { sendPasswordResetEmail } from '@firebase/auth';
import { auth } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

function IcoLockShield({ color = Colors.navy, size = 48 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="16" r="1" fill={color} />
    </Svg>
  );
}

function IcoMail({ color = Colors.orange, size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoCheck({ color = '#16a34a', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function CambiarPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useAuthStore();

  async function handleSendEmail() {
    if (!user?.email) {
      setErrorMsg('No se encontró el correo de tu cuenta.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSent(true);
    } catch (e: any) {
      const msg: Record<string, string> = {
        'auth/user-not-found': 'No encontramos una cuenta con ese correo.',
        'auth/invalid-email': 'El correo no es válido.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
      };
      setErrorMsg(msg[e?.code] ?? 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Cambiar contraseña</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.body}>
          {sent ? (
            /* ── Estado: correo enviado ── */
            <View style={styles.successBox}>
              <View style={styles.successIconWrap}>
                <IcoCheck color="#16a34a" size={36} />
              </View>
              <Text style={styles.successTitle}>¡Correo enviado!</Text>
              <Text style={styles.successText}>
                Te enviamos un enlace a{'\n'}
                <Text style={styles.emailHighlight}>{user?.email}</Text>
                {'\n\n'}Ábrelo y sigue las instrucciones para crear tu nueva contraseña.
              </Text>
              <Text style={styles.hint}>Revisa también tu carpeta de spam si no lo ves.</Text>

              <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()}>
                <Text style={styles.btnSecondaryText}>Volver al perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn} onPress={() => { setSent(false); }} disabled={loading}>
                <Text style={styles.resendText}>Reenviar correo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Estado: pantalla inicial ── */
            <>
              <View style={styles.iconBox}>
                <IcoLockShield color={Colors.navy} size={56} />
              </View>

              <Text style={styles.heading}>Cambiar contraseña</Text>
              <Text style={styles.subtext}>
                Te enviaremos un correo a{'\n'}
                <Text style={styles.emailHighlight}>{user?.email ?? 'tu correo'}</Text>
                {'\n\n'}con un enlace seguro para crear una nueva contraseña.
              </Text>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleSendEmail}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnContent}>
                    <IcoMail color="#fff" size={18} />
                    <Text style={styles.btnText}>Enviar correo de restablecimiento</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.navy, paddingHorizontal: 20, paddingVertical: 14,
  },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  topTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  body: { flex: 1, padding: 28, backgroundColor: '#fff' },

  iconBox: { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  heading: { fontSize: 22, fontWeight: '800', color: Colors.navy, textAlign: 'center', marginBottom: 12 },
  subtext: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  emailHighlight: { color: Colors.navy, fontWeight: '700' },

  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#DC2626', fontSize: 13, textAlign: 'center' },

  btn: {
    backgroundColor: Colors.orange, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 12,
  },
  btnDisabled: { opacity: 0.5 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: Colors.textMuted, fontSize: 14 },

  /* Success state */
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  successIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.navy, marginBottom: 12 },
  successText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  hint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 32 },

  btnSecondary: {
    backgroundColor: Colors.navy, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32, alignSelf: 'stretch', alignItems: 'center',
    marginBottom: 12,
  },
  btnSecondaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  resendBtn: { alignItems: 'center', paddingVertical: 10 },
  resendText: { color: Colors.orange, fontSize: 14, fontWeight: '600' },
});
