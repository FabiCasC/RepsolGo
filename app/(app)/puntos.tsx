import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../src/constants/colors'
import { PuntosHeroCard } from '../../src/components/puntos/PuntosHeroCard'
import { CanjeCard } from '../../src/components/puntos/CanjeCard'
import { CargaItem } from '../../src/components/puntos/CargaItem'
import { useAuthStore } from '../../src/store/auth.store'
import { FirestoreService } from '../../src/services/firestore.service'
import { NotificationsService } from '../../src/services/notifications.service'
import type { Canje, Punto } from '../../src/types'

interface Balance {
  total: number
  nivel: string
  cargas: number
  retosCompletados: number
  esteMes: number
  puntosParaSiguienteNivel: number
  progresoNivel: number
}

export default function PuntosScreen() {
  const user = useAuthStore(state => state.user)
  const { updateUser } = useAuthStore()
  const [canjes, setCanjes] = useState<Canje[]>([])
  const [historial, setHistorial] = useState<Punto[]>([])
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [canjesData, cargasData, balanceData] = await Promise.all([
        FirestoreService.getCanjesDisponibles(),
        FirestoreService.getCargas(user.id),
        FirestoreService.getBalance(user.id),
      ])
      setCanjes(canjesData as Canje[])
      setHistorial(
        cargasData.slice(0, 5).map(c => ({
          id: c.id,
          fecha: c.fecha,
          descripcion: 'Carga de combustible',
          cantidad: c.puntos,
          tipo: 'carga' as const,
          grifoNombre: c.grifoNombre,
        }))
      )
      setBalance(balanceData)
    } catch (err) {
      // silent fail — keep showing what we have
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCanje(canje: Canje) {
    if (!user?.id) return
    const currentPuntos = balance?.total ?? user.puntos ?? 0
    if (currentPuntos < canje.puntos) {
      Alert.alert('Puntos insuficientes', `Necesitas ${canje.puntos} puntos para este canje.`)
      return
    }
    Alert.alert(
      'Confirmar canje',
      `¿Deseas canjear ${canje.puntos} puntos por "${canje.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          onPress: async () => {
            try {
              await FirestoreService.canjearPuntos(user.id, {
                nombre: canje.nombre,
                puntos: canje.puntos,
                canjeId: canje.id,
              })
              const newPuntos = currentPuntos - canje.puntos
              await updateUser({ puntos: newPuntos })

              await NotificationsService.scheduleLocalNotification(
                '¡Canje exitoso!',
                `Canjeaste "${canje.nombre}" por ${canje.puntos} puntos`
              )

              Alert.alert('¡Canje exitoso!', `"${canje.nombre}" fue canjeado.`)
              loadData()
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Error al canjear.'
              Alert.alert('Error', msg)
            }
          },
        },
      ]
    )
  }

  const displayBalance = balance?.total ?? user?.puntos ?? 0
  const displayNivel = balance?.nivel ?? user?.nivel ?? 'Bronce'

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData() }} tintColor={Colors.orange} />
          }
        >
          <PuntosHeroCard
            puntos={displayBalance}
            nivel={displayNivel}
            progresoNivel={balance?.progresoNivel ?? 0}
            esteMes={balance?.esteMes ?? 0}
            cargas={balance?.cargas ?? 0}
            retosCompletados={balance?.retosCompletados ?? 0}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Canjear puntos</Text>
            <View style={styles.canjesGrid}>
              {canjes.map((c, i) => (
                <View key={c.id} style={[styles.canjeWrapper, i % 2 === 0 && styles.canjeLeft]}>
                  <CanjeCard canje={c} onPress={handleCanje} />
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.section, styles.sectionLast]}>
            <Text style={styles.sectionTitle}>Últimas cargas</Text>
            <View style={styles.historialCard}>
              {historial.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Aún no tienes cargas registradas.</Text>
                  <Text style={styles.emptyHint}>¡Escanea tu primera boleta!</Text>
                </View>
              ) : (
                historial.map(punto => (
                  <CargaItem key={punto.id} punto={punto} />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.orange,
    fontWeight: '600',
  },
})
