import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, UserRole } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'cliente', label: 'Cliente', desc: 'Carga combustible y acumula puntos' },
  { value: 'operario', label: 'Operario de grifo', desc: 'Gestiona turnos e incidencias' },
];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  return /^9\d{8}$/.test(phone.replace(/\s/g, ''));
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('cliente');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuthStore();

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) e.name = 'Ingresa tu nombre completo (mínimo 3 caracteres)';
    if (!email.trim()) e.email = 'Ingresa tu correo';
    else if (!validateEmail(email.trim())) e.email = 'Correo electrónico inválido';
    if (!phone.trim()) e.phone = 'Ingresa tu teléfono';
    else if (!validatePhone(phone.trim())) e.phone = 'El teléfono debe comenzar con 9 y tener 9 dígitos';
    if (!password) e.password = 'Ingresa una contraseña';
    else if (password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres';
    else if (password.length > 20) e.password = 'La contraseña no puede tener más de 20 caracteres';
    if (!confirm) e.confirm = 'Confirma tu contraseña';
    else if (password !== confirm) e.confirm = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    try {
      await register(name.trim(), email.trim().toLowerCase(), phone.trim(), password, role);
      router.replace(role === 'operario' ? '/(app)/escanear' : '/(app)/mapa');
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
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={name}
            onChangeText={v => { setName(v); setErrors(p => ({ ...p, name: '' })); }}
            placeholder="Tu nombre completo"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
            maxLength={60}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
            onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })); }}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={80}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            value={phone}
            onChangeText={v => { setPhone(v); setErrors(p => ({ ...p, phone: '' })); }}
            placeholder="9XXXXXXXX"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            maxLength={9}
          />
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={password}
            onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })); }}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={Colors.textMuted}
            maxLength={20}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={[styles.input, errors.confirm ? styles.inputError : null]}
            value={confirm}
            onChangeText={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: '' })); }}
            secureTextEntry
            placeholder="Repite tu contraseña"
            placeholderTextColor={Colors.textMuted}
            maxLength={20}
          />
          {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}

          <Text style={styles.label}>Tipo de perfil</Text>
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
                <Text style={[styles.roleDesc, role === r.value && styles.roleDescActive]}>
                  {r.desc}
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
  inputError: { borderColor: Colors.red },
  errorText: { color: Colors.red, fontSize: 12, marginTop: -10, marginBottom: 10 },
  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  roleChip: {
    flex: 1, minWidth: 140, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  roleChipActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  roleText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '700' },
  roleTextActive: { color: '#fff' },
  roleDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  roleDescActive: { color: 'rgba(255,255,255,0.7)' },
  btnPrimary: {
    backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: Colors.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.orange, fontSize: 14, fontWeight: '700' },
});
