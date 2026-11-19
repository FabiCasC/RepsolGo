import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors } from '../../src/constants/colors'
import { useAuthStore } from '../../src/store/auth.store'

export default function PerfilOperarioScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const initials = user?.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? 'OP'

  function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolText}>⛽ OPERARIO</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.nombre ?? 'Operario'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información del grifo</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⛽</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Grifo asignado</Text>
                <Text style={styles.infoValue}>Repsol Javier Prado Este</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>Av. Javier Prado Este 4200, San Borja</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Horario</Text>
                <Text style={styles.infoValue}>Lunes a Domingo · 24 horas</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.infoCard}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/(operario)/registro-turno')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🕐</Text>
              <Text style={styles.actionLabel}>Registrar turno</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/(operario)/incidencias')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>⚠️</Text>
              <Text style={styles.actionLabel}>Ver incidencias</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Versión</Text>
                <Text style={styles.infoValue}>RepsolGo 1.0.0 — Operario</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: {
    backgroundColor: Colors.navy, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  rolBadge: { backgroundColor: Colors.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  rolText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  profileCard: {
    backgroundColor: Colors.white, margin: 16, borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.navy,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '800' },
  userName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: 14, color: Colors.textSecondary },
  infoSection: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  infoCard: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  infoIcon: { fontSize: 20, marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.surface, marginLeft: 48 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  actionIcon: { fontSize: 20, marginRight: 12 },
  actionLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  chevron: { fontSize: 20, color: Colors.textMuted },
  logoutSection: { padding: 16, paddingBottom: 40 },
  logoutBtn: { backgroundColor: Colors.red, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
})
