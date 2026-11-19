import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../src/constants/colors'
import { PuntosHeroCard } from '../../src/components/puntos/PuntosHeroCard'
import { CanjeCard } from '../../src/components/puntos/CanjeCard'
import { CargaItem } from '../../src/components/puntos/CargaItem'
import { useAuthStore } from '../../src/store/auth.store'
import type { Canje, Punto } from '../../src/types'

const CANJES: Canje[] = [
  { id: '1', nombre: 'Descuento S/5', descripcion: 'En tu próxima carga', puntos: 500, icono: 'fuel', categoria: 'combustible' },
  { id: '2', nombre: 'Tienda Repsol', descripcion: 'Vale S/20 en tienda', puntos: 1000, icono: 'store', categoria: 'tienda' },
  { id: '3', nombre: 'Car wash', descripcion: 'Lavado básico gratis', puntos: 800, icono: 'car', categoria: 'descuento' },
  { id: '4', nombre: 'Gift card S/50', descripcion: 'Canjeable en Ripley', puntos: 2500, icono: 'gift', categoria: 'voucher' },
]

const HISTORIAL: Punto[] = [
  { id: '1', fecha: '14/10/2026', descripcion: 'Carga de combustible', cantidad: 90, tipo: 'carga', grifoNombre: 'Repsol Javier Prado Este' },
  { id: '2', fecha: '12/10/2026', descripcion: 'Carga de combustible', cantidad: 88, tipo: 'carga', grifoNombre: 'Repsol Benavides' },
  { id: '3', fecha: '10/10/2026', descripcion: 'Boleta escaneada', cantidad: 120, tipo: 'escaneo', grifoNombre: 'Repsol La Marina', badge: 'Retroactivo' },
]

export default function PuntosScreen() {
  const user = useAuthStore(state => state.user)

  function handleCanje(canje: Canje) {
    Alert.alert(
      'Confirmar canje',
      `¿Deseas canjear ${canje.puntos} puntos por "${canje.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Canjear', onPress: () => Alert.alert('¡Canje exitoso!', 'Tus puntos fueron canjeados.') },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Buenos días,</Text>
          <Text style={styles.userName}>{user?.nombre ?? 'Usuario'} 👋</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? 'U'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <PuntosHeroCard
          puntos={user?.puntos ?? 4820}
          nivel={user?.nivel ?? 'Oro'}
          progresoNivel={0.32}
          esteMes={320}
          cargas={8}
          retosCompletados={2}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canjear puntos</Text>
          <View style={styles.canjesGrid}>
            {CANJES.map((c, i) => (
              <View key={c.id} style={[styles.canjeWrapper, i % 2 === 0 && styles.canjeLeft]}>
                <CanjeCard canje={c} onPress={handleCanje} />
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.sectionLast]}>
          <Text style={styles.sectionTitle}>Últimas cargas</Text>
          <View style={styles.historialCard}>
            {HISTORIAL.map(punto => (
              <CargaItem key={punto.id} punto={punto} />
            ))}
          </View>
          <View style={styles.verMasBtn}>
            <Text style={styles.verMasText}>Ver historial completo →</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  scroll: {
    flex: 1,
    marginTop: -12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionLast: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  canjesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  canjeWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  canjeLeft: {},
  historialCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  verMasBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  verMasText: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600',
  },
})
