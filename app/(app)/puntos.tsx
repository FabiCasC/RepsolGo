import React, { useState, useEffect, useCallback } from 'react'
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
import type { Canje, Punto } from '../../src/types'

export default function PuntosScreen() {
  const user = useAuthStore(state => state.user)

  const [canjes, setCanjes] = useState<Canje[]>([])
  const [historial, setHistorial] = useState<Punto[]>([])
  const [balance, setBalance] = useState<{
    total: number
    nivel: string
    cargas: number
    retosCompletados: number
    esteMes: number
    puntosParaSiguienteNivel: number
    progresoNivel: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const cargarDatos = useCallback(async () => {
    if (!user?.uid) return
    try {
      const [canjesData, cargasData, balanceData] = await Promise.all([
        FirestoreService.getCanjesDisponibles(),
        FirestoreService.getCargas(user.uid),
        FirestoreService.getBalance(user.uid),
      ])

      const canjesMapped: Canje[] = canjesData.map(c => ({
        id: c.id,
        nombre: c.nombre,
        descripcion: c.descripcion,
        puntos: c.puntos,
        icono: c.icono,
        categoria: c.categoria,
      }))

      const historialMapped: Punto[] = cargasData.map(c => ({
        id: c.id,
        fecha: c.fecha,
        descripcion: `Carga de ${c.combustible}`,
        cantidad: c.puntos,
        tipo: 'carga' as const,
        grifoNombre: c.grifoNombre,
      }))

      setCanjes(canjesMapped)
      setHistorial(historialMapped.slice(0, 5))
      setBalance(balanceData)
    } catch (error) {
      console.error('Error cargando puntos:', error)
    }
  }, [user?.uid])

  useEffect(() => {
    setLoading(true)
    cargarDatos().finally(() => setLoading(false))
  }, [cargarDatos])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await cargarDatos()
    setRefreshing(false)
  }, [cargarDatos])

  async function handleCanje(canje: Canje) {
    if (!user?.uid) return
    const puntosActuales = balance?.total ?? user?.puntos ?? 0
    if (puntosActuales < canje.puntos) {
      Alert.alert('Puntos insuficientes', `Necesitas ${canje.puntos} puntos. Tienes ${puntosActuales}.`)
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
              await FirestoreService.canjearPuntos(user.uid, {
                nombre: canje.nombre,
                puntos: canje.puntos,
                canjeId: canje.id,
              })
              Alert.alert('¡Canje exitoso!', 'Tus puntos fueron canjeados.')
              await cargarDatos()
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'No se pudo completar el canje')
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Buenos días,</Text>
          <Text style={styles.userName}>{user?.nombre ?? 'Usuario'}</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.orange} />}
        >
          <PuntosHeroCard
            puntos={balance?.total ?? user?.puntos ?? 0}
            nivel={balance?.nivel ?? user?.nivel ?? 'Bronce'}
            progresoNivel={balance?.progresoNivel ?? 0}
            esteMes={balance?.esteMes ?? 0}
            cargas={balance?.cargas ?? 0}
            retosCompletados={balance?.retosCompletados ?? 0}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Canjear puntos</Text>
            {canjes.length === 0 ? (
              <Text style={styles.emptyText}>No hay canjes disponibles</Text>
            ) : (
              <View style={styles.canjesGrid}>
                {canjes.map((c, i) => (
                  <View key={c.id} style={[styles.canjeWrapper, i % 2 === 0 && styles.canjeLeft]}>
                    <CanjeCard canje={c} onPress={handleCanje} />
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.section, styles.sectionLast]}>
            <Text style={styles.sectionTitle}>Últimas cargas</Text>
            {historial.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aún no tienes cargas registradas</Text>
                <Text style={styles.emptyHint}>Escanea tu boleta para sumar puntos</Text>
              </View>
            ) : (
              <>
                <View style={styles.historialCard}>
                  {historial.map(punto => (
                    <CargaItem key={punto.id} punto={punto} />
                  ))}
                </View>
                <View style={styles.verMasBtn}>
                  <Text style={styles.verMasText}>Ver historial completo →</Text>
                </View>
              </>
            )}
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
  scroll: {
    flex: 1,
    marginTop: -12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
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
