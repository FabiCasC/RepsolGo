import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ code?: string; newPw?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  const { resetPassword } = useAuthStore();

  function handleCodeChange(val: string, idx: number) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...codes];
    next[idx] = digit;
    setCodes(next);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    if (!digit && idx > 0) inputs.current[idx - 1]?.focus();
  }

  function validate() {
    const e: typeof errors = {};
    const code = codes.join('');
    if (code.length < 6) e.code = 'Ingresa el código de 6 dígitos';
    if (!newPw) e.newPw = 'Ingresa tu nueva contraseña';
    else if (newPw.length < 6) e.newPw = 'La contraseña debe tener al menos 6 caracteres';
    else if (newPw.length > 20) e.newPw = 'La contraseña no puede tener más de 20 caracteres';
    if (!confirm) e.confirm = 'Confirma tu contraseña';
    else if (newPw !== confirm) e.confirm = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleReset() {
    if (!validate()) return;
    const code = codes.join('');
    setLoading(true);
    try {
      await resetPassword(email, code, newPw);
      Alert.alert('¡Listo!', 'Contraseña actualizada correctamente', [
        { text: 'Iniciar sesión', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e: any) {
      setErrors(prev => ({ ...prev, code: e.message }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nueva contraseña</Text>
          <Text style={styles.subtitle}>Código enviado a {email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Código de verificación</Text>
          <View style={[styles.codeRow, errors.code ? styles.codeRowError : null]}>
            {codes.map((c, i) => (
              <TextInput
                key={i}
                ref={r => { if (r) inputs.current[i] = r; }}
                style={[styles.codeInput, errors.code ? styles.codeInputError : null]}
                value={c}
                onChangeText={v => { handleCodeChange(v, i); setErrors(p => ({ ...p, code: '' })); }}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          {errors.code ? <Text style={styles.errorText}>{errors.code}</Text> : null}

          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={[styles.input, errors.newPw ? styles.inputError : null]}
            value={newPw}
            onChangeText={v => { setNewPw(v); setErrors(p => ({ ...p, newPw: '' })); }}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={Colors.textMuted}
            maxLength={20}
          />
          {errors.newPw ? <Text style={styles.errorText}>{errors.newPw}</Text> : null}

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

          <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Actualizar contraseña</Text>}
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
    flex: 1, padding: 28, paddingTop: 32,
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 16 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  codeRowError: { marginBottom: 4 },
  codeInput: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 2, borderColor: Colors.border,
    textAlign: 'center', fontSize: 22, fontWeight: '700', color: Colors.navy,
    backgroundColor: Colors.surface,
  },
  codeInputError: { borderColor: Colors.red },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: Colors.textPrimary, marginBottom: 8, backgroundColor: Colors.surface,
  },
  inputError: { borderColor: Colors.red },
  errorText: { color: Colors.red, fontSize: 12, marginBottom: 10 },
  btn: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
