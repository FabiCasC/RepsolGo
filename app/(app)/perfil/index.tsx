import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect, Lock, Polyline, ChevronRight } from 'react-native-svg';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/colors';

// ── Iconos ────────────────────────────────────────────────────────────────────

function IcoEdit({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoLock({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoTrophy({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9H4a2 2 0 000 4h2" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M18 9h2a2 2 0 010 4h-2" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M6 2h12v9a6 6 0 01-12 0V2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 17v4M8 21h8" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoBox({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoHeart({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoHelpCircle({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} />
      <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth={1} />
    </Svg>
  );
}

function IcoFileText({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoShield({ color = Colors.orange, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoChevronRight({ color = Colors.textMuted, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoCog({ color = '#fff', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

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
          <TouchableOpacity style={styles.settingsBtn} onPress={() => Alert.alert('Ajustes')}>
            <IcoCog color="#fff" size={20} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(app)/perfil/editar')}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <IcoEdit color="#fff" size={12} />
            </View>
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

        {/* Secciones */}
        <Section title="Mi cuenta">
          <MenuItem icon={<IcoEdit />} label="Editar perfil" onPress={() => router.push('/(app)/perfil/editar')} />
          <MenuItem icon={<IcoLock />} label="Cambiar contraseña" onPress={() => router.push('/(app)/perfil/cambiar-password')} />
          <MenuItem icon={<IcoTrophy />} label="Retos y gamificación" onPress={() => router.push('/(app)/retos')} />
          <MenuItem icon={<IcoBox />} label="Mis cargas" onPress={() => Alert.alert('Próximamente')} last />
          <MenuItem icon={<IcoHeart />} label="Mis favoritos" onPress={() => Alert.alert('Próximamente')} last />
        </Section>

        <Section title="Seguridad">
          <View style={styles.switchRow}>
            <View style={[styles.iconWrap, { backgroundColor: Colors.orange + '18' }]}>
              <IcoLock color={Colors.orange} size={16} />
            </View>
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
          <View style={[styles.switchRow, styles.borderBottom]}>
            <Text style={styles.switchLabel}>Notificaciones push</Text>
            <Switch value={notifPush} onValueChange={v => toggleNotif('push', v)} trackColor={{ true: Colors.orange }} thumbColor="#fff" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Notificaciones por email</Text>
            <Switch value={notifEmail} onValueChange={v => toggleNotif('email', v)} trackColor={{ true: Colors.orange }} thumbColor="#fff" />
          </View>
        </Section>

        <Section title="Soporte">
          <MenuItem icon={<IcoHelpCircle />} label="Ayuda y soporte" onPress={() => Alert.alert('Próximamente')} />
          <MenuItem icon={<IcoFileText />} label="Términos y condiciones" onPress={() => Alert.alert('Próximamente')} />
          <MenuItem icon={<IcoShield />} label="Política de privacidad" onPress={() => Alert.alert('Próximamente')} last />
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

function MenuItem({ icon, label, onPress, last }: { icon: React.ReactNode; label: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.menuItem, !last && styles.borderBottom]} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: Colors.orange + '18' }]}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      <IcoChevronRight />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  hero: { backgroundColor: Colors.navy, alignItems: 'center', paddingVertical: 32, paddingTop: 16 },
  settingsBtn: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, padding: 8,
  },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: Colors.orange },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 32, fontWeight: '800' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: Colors.orange, borderRadius: 12, padding: 5,
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
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  switchLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  switchSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: Colors.surface },
  logoutBtn: { margin: 16, marginTop: 24, borderWidth: 1.5, borderColor: Colors.red, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: Colors.red, fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginBottom: 32 },
});
