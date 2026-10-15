import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

export default function EditarPerfilScreen() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [photo, setPhoto] = useState(user?.photo ?? '');
  const [loading, setLoading] = useState(false);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Error', 'El nombre no puede estar vacío'); return; }
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), photo: photo || undefined });
      Alert.alert('¡Guardado!', 'Tu perfil fue actualizado', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Editar perfil</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickPhoto}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Text style={{ fontSize: 16 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Toca para cambiar foto</Text>
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="9XXXXXXXX"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={user?.email ?? ''}
          editable={false}
        />
        <Text style={styles.hint}>El correo no se puede cambiar</Text>

        <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar cambios</Text>}
        </TouchableOpacity>
      </ScrollView>
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
  body: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.orange },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 36, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#fff', borderRadius: 16, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2,
  },
  changePhotoText: { color: Colors.orange, fontSize: 13, fontWeight: '600', marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: Colors.textPrimary, marginBottom: 16, backgroundColor: '#fff',
  },
  inputDisabled: { backgroundColor: Colors.surface, color: Colors.textMuted },
  hint: { fontSize: 12, color: Colors.textMuted, marginTop: -12, marginBottom: 16 },
  btnSave: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
