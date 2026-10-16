import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

/** Enmascara el correo: fabiana.castroc22@gmail.com → f***@gmail.com */
function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  return `${user[0]}***@${domain}`;
}

// EMAIL_NOT_CONFIGURED → modo demo: muestra el código en pantalla
// EmailJS configurado → el código llega al correo real, no se muestra aquí

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [sentCode, setSentCode] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { requestRecoveryCode } = useAuthStore();

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSend() {
    if (!email.trim()) { setEmailError('Ingresa tu correo'); return; }
    if (!validateEmail(email.trim())) { setEmailError('Correo electrónico inválido'); return; }
    setEmailError('');
    setLoading(true);
    const dest = email.trim().toLowerCase();
    try {
      const code = await requestRecoveryCode(dest);
      startCooldown();
      setSentEmail(dest);
      setSentCode(code);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  function goToReset(dest: string) {
    router.push({ pathname: '/(auth)/reset-password', params: { email: dest } });
  }

  function startCooldown() {
    setCooldown(30);
    timer.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(timer.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>Te enviaremos un código al correo</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 40 }}>{sent ? '✅' : '🔑'}</Text>
          </View>

          {sent ? (
            <>
              <Text style={styles.sentTitle}>¡Código enviado!</Text>
              <Text style={styles.sentDesc}>
                Enviamos un código a{'\n'}
                <Text style={styles.sentEmail}>{maskEmail(sentEmail)}</Text>
              </Text>

              {/* Código destacado */}
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Tu código de verificación</Text>
                <Text style={styles.codeValue}>{sentCode}</Text>
              </View>

              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => goToReset(sentEmail)}
              >
                <Text style={styles.btnOutlineText}>Ingresar el código →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary, cooldown > 0 && styles.btnDisabled]}
                onPress={() => { setSent(false); }}
                disabled={cooldown > 0}
              >
                <Text style={styles.btnSecondaryText}>
                  {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar a otro correo'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>
                Ingresa el correo asociado a tu cuenta y te enviaremos un código de verificación.
              </Text>

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                value={email}
                onChangeText={v => { setEmail(v); setEmailError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="correo@ejemplo.com"
                placeholderTextColor={Colors.textMuted}
                maxLength={80}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <TouchableOpacity
                style={[styles.btn, (loading || cooldown > 0) && styles.btnDisabled]}
                onPress={handleSend}
                disabled={loading || cooldown > 0}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>
                    {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Enviar código'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  header: { padding: 28, paddingTop: 56 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    flex: 1, padding: 28, paddingTop: 40,
  },
  iconBox: { alignItems: 'center', marginBottom: 20 },
  desc: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: Colors.textPrimary, marginBottom: 24, backgroundColor: Colors.surface,
  },
  inputError: { borderColor: Colors.red },
  errorText: { color: Colors.red, fontSize: 12, marginTop: -8, marginBottom: 10 },
  btn: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Estado "enviado"
  sentTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  sentDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  sentEmail: { fontWeight: '700', color: Colors.navy },
  codeBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.orange,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: 8,
  },
  btnOutline: {
    borderWidth: 2, borderColor: Colors.orange, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 12,
  },
  btnOutlineText: { color: Colors.orange, fontSize: 16, fontWeight: '700' },
  btnSecondary: { backgroundColor: Colors.surface },
  btnSecondaryText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
});
