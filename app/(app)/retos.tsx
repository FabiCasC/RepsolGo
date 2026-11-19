import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../src/constants/colors'
import { RetoCard } from '../../src/components/gamificacion/RetoCard'
import { BadgeGrid } from '../../src/components/gamificacion/BadgeGrid'
import { useAuthStore } from '../../src/store/auth.store'
import { FirestoreService } from '../../src/services/firestore.service'
import { NotificationsService } from '../../src/services/notifications.service'
import type { Reto, Badge } from '../../src/types'

export default function RetosScreen() {
  const user = useAuthStore(s => s.user)
  const [retos, setRetos] = useState<Reto[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [xp, setXp] = useState(0)
  const [nivel, setNivel] = useState(1)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      await FirestoreService.seedRetosIniciales(user.id)
      const [retosData, cargasData] = await Promise.all([
        FirestoreService.getRetos(user.id),
        FirestoreService.getCargas(user.id),
      ])

      const cargasCount = cargasData.length

      // Update Cargador Constante progress dynamically
      const retosActualizados = retosData.map(r => {
        if (r.titulo === 'Cargador Constante') {
          return { ...r, progreso: Math.min(cargasCount, r.meta) }
        }
        return r
      })

      setRetos(retosActualizados)

      // Notify completed retos
      for (const r of retosActualizados) {
        if (r.progreso >= r.meta && !r.completado) {
          await FirestoreService.updateRetoProgreso(user.id, r.firestoreId ?? r.id, r.progreso)
          await NotificationsService.scheduleLocalNotification(
            '¡Reto completado!',
            `Completaste "${r.titulo}" y ganaste ${r.puntos} puntos`
          )
        }
      }

      // Calculate XP and level
      const totalXp = retosActualizados
        .filter(r => r.progreso >= r.meta)
        .reduce((acc, r) => acc + r.xp, 0)
      setXp(totalXp)
      setNivel(Math.floor(totalXp / 100) + 1)

      // Calculate badges
      const updatedBadges: Badge[] = [
        {
          id: '1',
          nombre: 'Pionero',
          descripcion: 'Primera carga',
          icono: '🚀',
          ganado: cargasCount >= 1,
          color: '#F59E0B',
        },
        {
          id: '2',
          nombre: 'Fiel',
          descripcion: '10 cargas',
          icono: '❤️',
          ganado: cargasCount >= 10,
          color: Colors.red,
        },
        {
          id: '3',
          nombre: 'Explorador',
          descripcion: '5 grifos',
          icono: '🗺️',
          ganado: retosActualizados.find(r => r.titulo === 'Explorador')?.completado ?? false,
          color: '#3B82F6',
        },
        {
          id: '4',
          nombre: 'Madrugador',
          descripcion: 'Carga temprana',
          icono: '🌅',
          ganado: retosActualizados.find(r => r.titulo === 'Madrugador')?.completado ?? false,
          color: '#F59E0B',
        },
        { id: '5', nombre: 'Platinum', descripcion: 'Nivel Platino', icono: '💎', ganado: (user.puntos ?? 0) >= 5000 },
        { id: '6', nombre: 'Reto Rey', descripcion: '10 retos', icono: '👑', ganado: false },
        { id: '7', nombre: 'Ahorrón', descripcion: '5 canjes', icono: '💰', ganado: false },
        { id: '8', nombre: 'Estrella', descripcion: 'Un año activo', icono: '⭐', ganado: false },
      ]
      setBadges(updatedBadges)
    } catch (err) {
      // silent
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const xpParaSiguiente = nivel * 100
  const progresoXp = xpParaSiguiente > 0 ? Math.min(xp / xpParaSiguiente, 1) : 0

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.orange} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData() }} tintColor={Colors.orange} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerLabel}>Tus desafíos</Text>
              <Text style={styles.headerTitle}>Retos & Logros</Text>
            </View>
            <View style={styles.rachaContainer}>
              <View style={styles.rachaBadge}>
                <Text style={styles.rachaEmoji}>🔥</Text>
                <Text style={styles.rachaText}>{retos.filter(r => r.completado).length} completos</Text>
              </View>
              <Text style={styles.rachaLabel}>Retos</Text>
            </View>
          </View>

          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpNivel}>Nivel {nivel} — {user?.nivel ?? 'Bronce'}</Text>
              <Text style={styles.xpPct}>{Math.round(progresoXp * 100)}%</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${progresoXp * 100}%` }]} />
            </View>
            <Text style={styles.xpHint}>{xp} / {xpParaSiguiente} XP para Nivel {nivel + 1}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Retos activos</Text>
          {retos.length === 0 ? (
            <Text style={styles.emptyText}>No hay retos activos.</Text>
          ) : (
            retos.map(reto => (
              <RetoCard key={reto.id} reto={reto} />
            ))
          )}

          <Text style={styles.sectionTitle}>Badges coleccionables</Text>
          <View style={styles.badgesContainer}>
            <BadgeGrid badges={badges} />
          </View>

          <View style={styles.carbonCard}>
            <View style={styles.carbonHeader}>
              <View style={styles.carbonIcon}>
                <Text style={styles.carbonEmoji}>🌱</Text>
              </View>
              <View style={styles.carbonInfo}>
                <Text style={styles.carbonTitle}>Huella de carbono</Text>
                <Text style={styles.carbonSubtitle}>Compensación acumulada</Text>
              </View>
              <Text style={styles.carbonValue}>12.4 kg</Text>
            </View>
            <Text style={styles.carbonLabel}>CO₂ compensados este año</Text>
            <View style={styles.carbonTrack}>
              <View style={[styles.carbonFill, { width: '52%' }]} />
            </View>
            <View style={styles.carbonFooter}>
              <Text style={styles.carbonFooterText}>52% de tu meta anual</Text>
              <Text style={styles.carbonFooterMeta}>Meta: 24 kg</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  rachaContainer: {
    alignItems: 'center',
  },
  rachaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(228,0,43,0.3)',
    borderWidth: 1,
    borderColor: Colors.red,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  rachaEmoji: {
    fontSize: 16,
  },
  rachaText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  rachaLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  xpSection: {},
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpNivel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  xpPct: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.orange,
  },
  xpTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 6,
  },
  xpFill: {
    height: 8,
    backgroundColor: Colors.orange,
    borderRadius: 4,
  },
  xpHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  content: {
    padding: 16,
    marginTop: -8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  badgesContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  carbonCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    marginBottom: 20,
  },
  carbonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carbonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  carbonEmoji: {
    fontSize: 22,
  },
  carbonInfo: {
    flex: 1,
  },
  carbonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
  },
  carbonSubtitle: {
    fontSize: 12,
    color: '#166534',
  },
  carbonValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15803D',
  },
  carbonLabel: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 10,
  },
  carbonTrack: {
    height: 8,
    backgroundColor: '#BBF7D0',
    borderRadius: 4,
    marginBottom: 8,
  },
  carbonFill: {
    height: 8,
    backgroundColor: Colors.green,
    borderRadius: 4,
  },
  carbonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carbonFooterText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  carbonFooterMeta: {
    fontSize: 12,
    color: '#166534',
  },
})
