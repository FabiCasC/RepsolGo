import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, UserRole } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'repartidor', label: 'Repartidor' },
  { value: 'operador', label: 'Operador' },
  { value: 'supervisor', label: 'Supervisor' },
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('cliente');
  const { register, isLoading } = useAuthStore();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await register(name.trim(), email.trim(), phone.trim(), password, role);
      router.replace('/(app)/mapa');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a RepsolGo</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Nombre completo', value: name, set: setName, placeholder: 'Tu nombre', keyboard: 'default' as const },
            { label: 'Correo electrónico', value: email, set: setEmail, placeholder: 'correo@ejemplo.com', keyboard: 'email-address' as const },
            { label: 'Teléfono', value: phone, set: setPhone, placeholder: '9XXXXXXXX', keyboard: 'phone-pad' as const },
          ].map(f => (
            <View key={f.label}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType={f.keyboard}
                autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Repite tu contraseña"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Perfil</Text>
          <View style={styles.rolesRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleChip, role === r.value && styles.roleChipActive]}
                onPress={() => setRole(r.value)}
              >
                <Text style={[styles.roleText, role === r.value && styles.roleTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Registrarme</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.navy },
  header: { padding: 28, paddingTop: 56 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    flex: 1, padding: 28, paddingTop: 32,
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: Colors.textPrimary, marginBottom: 16, backgroundColor: Colors.surface,
  },
  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  roleChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  roleChipActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  roleText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  btnPrimary: {
    backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: Colors.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.orange, fontSize: 14, fontWeight: '700' },
});
