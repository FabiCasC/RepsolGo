import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
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
    try {
      const code = await requestRecoveryCode(email.trim().toLowerCase());
      setCodeSent(true);
      startCooldown();
      // Mostrar el código mock en pantalla (solo para demo)
      Alert.alert(
        '📩 Código de verificación',
        `Tu código es: ${code}\n\n(En producción esto llegaría a tu correo)`,
        [{ text: 'Continuar', onPress: () => router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim().toLowerCase() } }) }],
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
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
            <Text style={{ fontSize: 40 }}>🔑</Text>
          </View>
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
});
