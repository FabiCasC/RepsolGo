import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

export default function PerfilScreen() {
  const { user, logout, setBiometric, biometricEnabled, updateProfile } = useAuthStore();
  const [notifPush, setNotifPush] = useState(user?.notifPush ?? true);
  const [notifEmail, setNotifEmail] = useState(user?.notifEmail ?? false);

  async function handleToggleBiometric(val: boolean) {
    if (val) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        Alert.alert('No disponible', 'Tu dispositivo no tiene biometría configurada.');
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirma tu identidad' });
      if (!res.success) return;
    }
    await setBiometric(val);
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  }

  async function toggleNotif(type: 'push' | 'email', val: boolean) {
    if (type === 'push') { setNotifPush(val); await updateProfile({ notifPush: val }); }
    else { setNotifEmail(val); await updateProfile({ notifEmail: val }); }
  }

  const initials = user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={() => router.push('/(app)/perfil/editar')}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.editBadge}><Text style={{ color: '#fff', fontSize: 11 }}>✏️</Text></View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name ?? 'Usuario'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() ?? 'CLIENTE'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>4,820</Text>
            <Text style={styles.statLabel}>Puntos</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statVal}>8</Text>
            <Text style={styles.statLabel}>Cargas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>2</Text>
            <Text style={styles.statLabel}>Retos</Text>
          </View>
        </View>

        {/* Sections */}
        <Section title="Mi cuenta">
          <MenuItem icon="✏️" label="Editar perfil" onPress={() => router.push('/(app)/perfil/editar')} />
          <MenuItem icon="🔐" label="Cambiar contraseña" onPress={() => router.push('/(app)/perfil/cambiar-password')} />
          <MenuItem icon="🏆" label="Retos y gamificación" onPress={() => router.push('/(app)/retos')} />
          <MenuItem icon="📦" label="Mis cargas" onPress={() => Alert.alert('Próximamente')} />
          <MenuItem icon="❤️" label="Mis favoritos" onPress={() => Alert.alert('Próximamente')} />
        </Section>

        <Section title="Seguridad">
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Acceso biométrico</Text>
              <Text style={styles.switchSub}>Huella o reconocimiento facial</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ true: Colors.orange }}
              thumbColor="#fff"
            />
          </View>
        </Section>

        <Section title="Notificaciones">
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Notificaciones push</Text>
            <Switch value={notifPush} onValueChange={v => toggleNotif('push', v)} trackColor={{ true: Colors.orange }} thumbColor="#fff" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Notificaciones por email</Text>
            <Switch value={notifEmail} onValueChange={v => toggleNotif('email', v)} trackColor={{ true: Colors.orange }} thumbColor="#fff" />
          </View>
        </Section>

        <Section title="Soporte">
          <MenuItem icon="❓" label="Ayuda y soporte" onPress={() => Alert.alert('Próximamente')} />
          <MenuItem icon="📄" label="Términos y condiciones" onPress={() => Alert.alert('Próximamente')} />
          <MenuItem icon="🔒" label="Política de privacidad" onPress={() => Alert.alert('Próximamente')} />
        </Section>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>RepsolGo v1.0.0 · SDK 57</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  hero: { backgroundColor: Colors.navy, alignItems: 'center', paddingVertical: 32, paddingTop: 16 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: Colors.orange },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 32, fontWeight: '800' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: Colors.orange, borderRadius: 12, padding: 4,
  },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 12 },
  email: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  roleBadge: { backgroundColor: Colors.orange + '30', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  roleText: { color: Colors.orange, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: 20, fontWeight: '800', color: Colors.navy },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.surface },
  menuIcon: { fontSize: 18, marginRight: 12, width: 24 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: Colors.textMuted },
  switchRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.surface },
  switchLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  switchSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  logoutBtn: { margin: 16, marginTop: 24, borderWidth: 1.5, borderColor: Colors.red, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: Colors.red, fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginBottom: 32 },
});
