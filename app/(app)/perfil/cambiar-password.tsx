import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

export default function CambiarPasswordScreen() {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuthStore();

  async function handleChange() {
    if (!current || !newPw || !confirm) { Alert.alert('Error', 'Completa todos los campos'); return; }
    if (newPw !== confirm) { Alert.alert('Error', 'Las contraseñas nuevas no coinciden'); return; }
    if (newPw.length < 6) { Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await changePassword(current, newPw);
      Alert.alert('¡Listo!', 'Contraseña actualizada correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
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
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 48 }}>🔐</Text>
          </View>

          {[
            { label: 'Contraseña actual', value: current, set: setCurrent, placeholder: 'Tu contraseña actual' },
            { label: 'Nueva contraseña', value: newPw, set: setNewPw, placeholder: 'Mínimo 6 caracteres' },
            { label: 'Confirmar nueva contraseña', value: confirm, set: setConfirm, placeholder: 'Repite la nueva contraseña' },
          ].map(f => (
            <View key={f.label}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={f.value}
                onChangeText={f.set}
                secureTextEntry
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleChange} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Actualizar contraseña</Text>}
          </TouchableOpacity>
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
  body: { flex: 1, padding: 24, backgroundColor: '#fff' },
  iconBox: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: Colors.textPrimary, marginBottom: 16, backgroundColor: Colors.surface,
  },
  btn: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
