import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('fabiana.castroc22@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading, biometricEnabled, token } = useAuthStore();

  useEffect(() => {
    if (token) router.replace('/(app)/mapa');
  }, [token]);

  useEffect(() => {
    if (biometricEnabled) tryBiometric();
  }, [biometricEnabled]);

  async function tryBiometric() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Accede con tu huella o rostro',
      cancelLabel: 'Usar contraseña',
    });
    if (result.success) router.replace('/(app)/mapa');
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/(app)/mapa');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.brand}>RepsolGo</Text>
          <Text style={styles.subtitle}>Tu app de energía en Perú</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="correo@ejemplo.com"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.pwRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              placeholder="••••••"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
              <Text style={{ color: Colors.navy }}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {biometricEnabled && (
            <TouchableOpacity style={styles.btnOutline} onPress={tryBiometric}>
              <Text style={styles.btnOutlineText}>🔒 Usar biometría</Text>
            </TouchableOpacity>
          )}

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.navy },
  hero: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    flex: 1, padding: 28, paddingTop: 32,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.navy, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: Colors.textPrimary, marginBottom: 16, backgroundColor: Colors.surface,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eyeBtn: { padding: 12, marginLeft: 4 },
  forgotLink: { color: Colors.orange, fontSize: 13, fontWeight: '600', marginBottom: 24, textAlign: 'right' },
  btnPrimary: {
    backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 12,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnOutline: {
    borderWidth: 1.5, borderColor: Colors.navy, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginBottom: 12,
  },
  btnOutlineText: { color: Colors.navy, fontSize: 15, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  registerText: { color: Colors.textSecondary, fontSize: 14 },
  registerLink: { color: Colors.orange, fontSize: 14, fontWeight: '700' },
});
